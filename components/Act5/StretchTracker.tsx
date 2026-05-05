import { MovementData } from "@/activityData/FSM/activity5FSM";
import useColorPalette from "@/hooks/useColorPalette";
import { Colors } from "@/theme/theme";
import * as Haptics from "expo-haptics";
import { Accelerometer } from "expo-sensors";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Svg, { Polyline } from "react-native-svg";


// ─── Config ────────────────────────────────────────────────────────────────
const SAMPLE_RATE_MS = 50;
const WINDOW_SIZE = 200; // 10 seconds of data at 50ms
const RECORDING_SECONDS = 10;
const COOLDOWN_SECONDS = 3;
const JERK_SMOOTHING_ALPHA = 0.2;

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_WIDTH = SCREEN_WIDTH - 80;
const CHART_HEIGHT = 100;

// Smoothness thresholds (jerk magnitude in m/s³ approx)
const SMOOTH_THRESHOLD = 0.4;
const MODERATE_THRESHOLD = 0.8;

// How long to wait between haptic warnings so we don't buzz constantly (ms)
const HAPTIC_COOLDOWN_MS = 200;

// ─── Types ──────────────────────────────────────────────────────────────────
interface Sample {
    ax: number;
    ay: number;
    az: number;
    magnitude: number;
    jerk: number;
    timestamp: number;
}

// round: which experiment round we are in
// 1 = no feedback (baseline), 2 = haptic feedback enabled
type Round = 1 | 2;
type Phase = "idle" | "round_intro" | "recording" | "cooldown" | "between_rounds" | "done";
type Movement = 1 | 2 | 3;

interface MovementResult {
    movement: Movement;
    label: string;
    avgSpeed: number;
    avgJerk: number;
    maxJerk: number;
    rangeOfMotion: number;
    smoothnessLabel: string;
    smoothnessColor: string;
}

interface RoundResult {
    round: Round;
    movements: MovementResult[];
    hardestMovement: Movement;
}

interface SessionResult {
    round1: RoundResult;
    round2: RoundResult;
}

// ─── Utilities ───────────────────────────────────────────────────────────────
function magnitude(ax: number, ay: number, az: number): number {
    return Math.sqrt(ax * ax + ay * ay + az * az);
}

function computeJerk(prev: number, curr: number, dt: number): number {
    if (dt === 0) return 0;
    return Math.abs((curr - prev) / dt);
}

function smoothnessLabel(avgJerk: number, colors: Colors): { label: string; color: string } {
    if (avgJerk < SMOOTH_THRESHOLD) return { label: "Smooth", color: colors.positive };
    if (avgJerk < MODERATE_THRESHOLD) return { label: "Moderate", color: colors.primary };
    return { label: "Jerky", color: colors.destructive };
}

function computeRangeOfMotion(samples: Sample[]): number {
    if (samples.length === 0) return 0;
    const mags = samples.map((s) => s.magnitude);
    return parseFloat((Math.max(...mags) - Math.min(...mags)).toFixed(3));
}

function buildResult(
    movement: Movement,
    label: string,
    samples: Sample[],
    colors: Colors
): MovementResult {
    if (samples.length === 0) {
        return {
            movement,
            label,
            avgSpeed: 0,
            avgJerk: 0,
            maxJerk: 0,
            rangeOfMotion: 0,
            smoothnessLabel: "No data",
            smoothnessColor: colors.textDisabled,
        };
    }
    const avgSpeed = parseFloat(
        (samples.reduce((a, s) => a + s.magnitude, 0) / samples.length).toFixed(3)
    );
    const avgJerk = parseFloat(
        (samples.reduce((a, s) => a + s.jerk, 0) / samples.length).toFixed(4)
    );
    const maxJerk = parseFloat(Math.max(...samples.map((s) => s.jerk)).toFixed(4));
    const rangeOfMotion = computeRangeOfMotion(samples);
    const { label: sLabel, color: sColor } = smoothnessLabel(avgJerk, colors);
    return { movement, label, avgSpeed, avgJerk, maxJerk, rangeOfMotion, smoothnessLabel: sLabel, smoothnessColor: sColor };
}

function buildRoundResult(
    round: Round,
    buffers: Record<Movement, Sample[]>,
    colors: Colors
): RoundResult {
    const movements = ([1, 2, 3] as Movement[]).map((m) =>
        buildResult(m, MOVEMENT_LABELS[m], buffers[m], colors)
    );
    const hardest = movements.reduce((a, b) => (a.avgJerk > b.avgJerk ? a : b));
    return { round, movements, hardestMovement: hardest.movement };
}

const MOVEMENT_LABELS: Record<Movement, string> = {
    1: "Movement 1: Slow Arm Raise",
    2: "Movement 2: Side Arm Move",
    3: "Movement 3: Circular Arm Swing",
};

const ROUND_CONFIG: Record<Round, { title: string; subtitle: string; emoji: string; hapticEnabled: boolean }> = {
    1: {
        title: "Round 1: Baseline",
        subtitle: "No feedback. Perform each stretch as smoothly as you can without any cues.",
        emoji: "🤫",
        hapticEnabled: false,
    },
    2: {
        title: "Round 2: Haptic Feedback",
        subtitle: "Your phone will buzz when your movement becomes too jerky. Try to minimise the buzzes.",
        emoji: "📳",
        hapticEnabled: true,
    },
};

interface Props {
    onComplete: (data: MovementData) => void
}
// ─── Main Component ───────────────────────────────────────────────────────────
export default function StretchTracker({onComplete} : Props) {
    const colors = useColorPalette();
    const styles = getStyles(colors);

    const [phase, setPhase] = useState<Phase>("idle");
    const [round, setRound] = useState<Round>(1);
    const [currentMovement, setCurrentMovement] = useState<Movement>(1);
    const [secondsLeft, setSecondsLeft] = useState(RECORDING_SECONDS);
    const [cooldownLeft, setCooldownLeft] = useState(COOLDOWN_SECONDS);
    const [chartPoints, setChartPoints] = useState<string>("");
    const [liveJerk, setLiveJerk] = useState<number>(0);
    const [liveMagnitude, setLiveMagnitude] = useState<number>(0);
    const [result, setResult] = useState<SessionResult | null>(null);

    // Stores buffers for both rounds separately
    const round1BuffersRef = useRef<Record<Movement, Sample[]>>({ 1: [], 2: [], 3: [] });
    const round2BuffersRef = useRef<Record<Movement, Sample[]>>({ 1: [], 2: [], 3: [] });
    const bufferRef = useRef<Sample[]>([]);
    const prevMagnitudeRef = useRef<number>(0);
    const prevTimestampRef = useRef<number>(0);
    const smoothedJerkRef = useRef<number>(0);
    const lastHapticRef = useRef<number>(0);
    const subscriptionRef = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const progressAnim = useRef(new Animated.Value(1)).current;
    const jerkAnim = useRef(new Animated.Value(0)).current;

    // Refs so sensor closure always reads latest values
    const currentMovementRef = useRef<Movement>(1);
    const roundRef = useRef<Round>(1);
    const sensorHandlerRef = useRef<(x: number, y: number, z: number) => void>(() => { });
    const advanceMovementRef = useRef<(current: Movement) => void>(() => { });

    useEffect(() => { currentMovementRef.current = currentMovement; }, [currentMovement]);
    useEffect(() => { roundRef.current = round; }, [round]);

    // ─── Sensor stop ───────────────────────────────────────────────────────────
    const stopSensor = useCallback(() => {
        subscriptionRef.current?.remove();
        subscriptionRef.current = null;
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        Accelerometer.setUpdateInterval(1000);
    }, []);

    // ─── Finalise entire session ───────────────────────────────────────────────
    const finaliseSession = useCallback(() => {
        stopSensor();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const r1 = buildRoundResult(1, round1BuffersRef.current, colors);
        const r2 = buildRoundResult(2, round2BuffersRef.current, colors);
        setResult({ round1: r1, round2: r2 });
        setPhase("done");
    }, [stopSensor, colors]);

    // ─── Start a single movement recording ────────────────────────────────────
    const startMovement = useCallback(
        (nextMovement: Movement) => {
            setCurrentMovement(nextMovement);
            setSecondsLeft(RECORDING_SECONDS);
            bufferRef.current = [];
            setChartPoints("");
            setPhase("recording");
            progressAnim.setValue(1);
            Animated.timing(progressAnim, {
                toValue: 0,
                duration: RECORDING_SECONDS * 1000,
                useNativeDriver: false,
            }).start();

            let remaining = RECORDING_SECONDS;
            timerRef.current = setInterval(() => {
                remaining -= 1;
                setSecondsLeft(remaining);
                if (remaining <= 0) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    advanceMovementRef.current(nextMovement);
                }
            }, 1000);
        },
        [progressAnim]
    );

    // ─── Advance to next movement or next round ────────────────────────────────
    const advanceMovement = useCallback(
        (current: Movement) => {
            // Always stop sensor during cooldown / transition
            subscriptionRef.current?.remove();
            subscriptionRef.current = null;

            if (current < 3) {
                // More movements in this round — cooldown then next movement
                const next = (current + 1) as Movement;
                setPhase("cooldown");
                setCooldownLeft(COOLDOWN_SECONDS);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

                let cd = COOLDOWN_SECONDS;
                timerRef.current = setInterval(() => {
                    cd -= 1;
                    setCooldownLeft(cd);
                    if (cd <= 0) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                        Accelerometer.setUpdateInterval(SAMPLE_RATE_MS);
                        subscriptionRef.current = Accelerometer.addListener(({ x, y, z }) => {
                            sensorHandlerRef.current(x, y, z);
                        });
                        startMovement(next);
                    }
                }, 1000);
            } else if (roundRef.current === 1) {
                // Round 1 done — show between-rounds screen
                setPhase("between_rounds");
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                // Round 2 done — finalise
                finaliseSession();
            }
        },
        [finaliseSession, startMovement]
    );

    useEffect(() => {
        advanceMovementRef.current = advanceMovement;
    }, [advanceMovement]);

    // ─── Attach sensor and build handler ──────────────────────────────────────
    const attachSensor = useCallback(
        (hapticEnabled: boolean) => {
            Accelerometer.setUpdateInterval(SAMPLE_RATE_MS);
            let isInitialized = false;

            sensorHandlerRef.current = (x: number, y: number, z: number) => {
                const now = Date.now();
                const mag = magnitude(x, y, z);

                if (!isInitialized) {
                    prevMagnitudeRef.current = mag;
                    prevTimestampRef.current = now;
                    isInitialized = true;
                    return;
                }

                const dt = (now - prevTimestampRef.current) / 1000;
                const rawJerk = computeJerk(prevMagnitudeRef.current, mag, dt);
                smoothedJerkRef.current =
                    JERK_SMOOTHING_ALPHA * rawJerk +
                    (1 - JERK_SMOOTHING_ALPHA) * smoothedJerkRef.current;

                prevMagnitudeRef.current = mag;
                prevTimestampRef.current = now;

                const sample: Sample = {
                    ax: x, ay: y, az: z,
                    magnitude: mag,
                    jerk: smoothedJerkRef.current,
                    timestamp: now,
                };

                bufferRef.current.push(sample);
                if (bufferRef.current.length > WINDOW_SIZE) bufferRef.current.shift();

                // Store into correct round buffer
                const mov = currentMovementRef.current;
                const currentRound = roundRef.current;
                if (currentRound === 1) {
                    round1BuffersRef.current[mov].push(sample);
                } else {
                    round2BuffersRef.current[mov].push(sample);
                }

                setLiveMagnitude(parseFloat(mag.toFixed(3)));
                setLiveJerk(parseFloat(smoothedJerkRef.current.toFixed(4)));

                Animated.timing(jerkAnim, {
                    toValue: Math.min(smoothedJerkRef.current / MODERATE_THRESHOLD, 1),
                    duration: 100,
                    useNativeDriver: false,
                }).start();

                // Haptic warning if in round 2 and too jerky
                if (hapticEnabled && smoothedJerkRef.current > MODERATE_THRESHOLD) {
                    const timeSinceLast = now - lastHapticRef.current;
                    if (timeSinceLast > HAPTIC_COOLDOWN_MS) {
                        lastHapticRef.current = now;
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    }
                }

                if (bufferRef.current.length > 5) {
                    const values = bufferRef.current.map((s) => s.magnitude);
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    const range = max - min === 0 ? 1 : max - min;

                    const pointsString = bufferRef.current
                        .map((s, i) => {
                            const px = (i / WINDOW_SIZE) * CHART_WIDTH;
                            const normalizedY = (s.magnitude - min) / range;
                            const py = CHART_HEIGHT - normalizedY * CHART_HEIGHT;
                            return `${px},${py}`;
                        })
                        .join(" ");

                    setChartPoints(pointsString);
                }
            };

            subscriptionRef.current = Accelerometer.addListener(({ x, y, z }) => {
                sensorHandlerRef.current(x, y, z);
            });
        },
        [jerkAnim]
    );

    // ─── Start a round ─────────────────────────────────────────────────────────
    const startRound = useCallback(
        (r: Round) => {
            setRound(r);
            setCurrentMovement(1);
            setSecondsLeft(RECORDING_SECONDS);
            setChartPoints("");
            setLiveJerk(0);
            setLiveMagnitude(0);
            bufferRef.current = [];
            prevMagnitudeRef.current = 0;
            prevTimestampRef.current = 0;
            smoothedJerkRef.current = 0;
            lastHapticRef.current = 0;

            if (r === 1) {
                round1BuffersRef.current = { 1: [], 2: [], 3: [] };
            } else {
                round2BuffersRef.current = { 1: [], 2: [], 3: [] };
            }

            setPhase("round_intro");
        },
        []
    );

    // Called when user taps "Begin" on the round intro screen
    const beginRound = useCallback(() => {
        const r = roundRef.current;
        const hapticEnabled = ROUND_CONFIG[r].hapticEnabled;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        progressAnim.setValue(1);
        Animated.timing(progressAnim, {
            toValue: 0,
            duration: RECORDING_SECONDS * 1000,
            useNativeDriver: false,
        }).start();

        let remaining = RECORDING_SECONDS;
        timerRef.current = setInterval(() => {
            remaining -= 1;
            setSecondsLeft(remaining);
            if (remaining <= 0) {
                if (timerRef.current) clearInterval(timerRef.current);
                advanceMovementRef.current(1);
            }
        }, 1000);

        attachSensor(hapticEnabled);
        setPhase("recording");
    }, [progressAnim, attachSensor]);

    const resetSession = useCallback(() => {
        stopSensor();
        setPhase("idle");
        setRound(1);
        setCurrentMovement(1);
        setSecondsLeft(RECORDING_SECONDS);
        setCooldownLeft(COOLDOWN_SECONDS);
        setChartPoints("");
        setLiveJerk(0);
        setLiveMagnitude(0);
        setResult(null);
        progressAnim.setValue(1);
        jerkAnim.setValue(0);
    }, [stopSensor, progressAnim, jerkAnim]);

    useEffect(() => () => stopSensor(), [stopSensor]);

    // ─── Derived animation values ──────────────────────────────────────────────
    const jerkColor = jerkAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [colors.positive, colors.primary, colors.destructive],
    });

    const progressColor = progressAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [colors.destructive, colors.primary, colors.positive],
    });

    // ─── Done screen ───────────────────────────────────────────────────────────
    if (phase === "done" && result) {
        return (
            <ResultScreen
                result={result}
                colors={colors}
                onReset={() => {
                    const movements= [...result!.round1.movements, ...result!.round2.movements]
                    const avgResults = movements.reduce((a, c) => {
                        a.avgJerk += c.avgJerk
                        a.maxJerk += c.maxJerk
                        a.avgSpeed += c.avgSpeed
                        a.rangeOfMotion += c.rangeOfMotion
                        return a
                    })
                    onComplete({
                        avgJerk: avgResults.avgJerk/3,
                        maxJerk: avgResults.maxJerk/3,
                        avgSpeed: avgResults.avgSpeed/3,
                        range: avgResults.rangeOfMotion/3
                    })
                    resetSession();
                }}
            />
        );
    }

    // ─── Movement step indicator (reused across phases) ────────────────────────
    const MovementStepper = () => (
        <View style={styles.movementHeader}>
            {([1, 2, 3] as Movement[]).map((m) => (
                <View
                    key={m}
                    style={[
                        styles.movementStep,
                        currentMovement === m && styles.movementStepActive,
                        currentMovement > m && styles.movementStepDone,
                    ]}
                >
                    <Text
                        style={[
                            styles.movementStepText,
                            currentMovement === m && styles.movementStepTextActive,
                        ]}
                    >
                        {currentMovement > m ? "✓" : m}
                    </Text>
                </View>
            ))}
        </View>
    );

    // ─── Round badge ───────────────────────────────────────────────────────────
    const RoundBadge = ({ r }: { r: Round }) => (
        <View style={[styles.roundBadge, r === 2 && styles.roundBadge2]}>
            <Text style={styles.roundBadgeText}>
                {r === 1 ? "Round 1 — No Feedback" : "Round 2 — Haptic Feedback 📳"}
            </Text>
        </View>
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* ── Idle ── */}
            {phase === "idle" && (
                <>
                    <View style={styles.sectionView}>
                        <Text style={styles.subText}>
                            This experiment has two rounds. In Round 1 you perform each
                            stretch without any feedback. In Round 2 your phone will buzz
                            when your movement is too jerky — try to minimise the buzzes
                            and compare your results.
                        </Text>
                        <View style={styles.movementList}>
                            {([1, 2, 3] as Movement[]).map((m) => (
                                <View key={m} style={styles.movementRow}>
                                    <View style={styles.movementBadge}>
                                        <Text style={styles.movementBadgeText}>{m}</Text>
                                    </View>
                                    <Text style={styles.subText}>{MOVEMENT_LABELS[m]}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.roundsPreview}>
                        <View style={[styles.roundPreviewCard, { borderColor: colors.border }]}>
                            <Text style={styles.roundPreviewEmoji}>🤫</Text>
                            <Text style={styles.roundPreviewTitle}>Round 1</Text>
                            <Text style={styles.roundPreviewSub}>No feedback</Text>
                        </View>
                        <View style={styles.roundArrow}>
                            <Text style={{ color: colors.textDisabled, fontSize: 20 }}>→</Text>
                        </View>
                        <View style={[styles.roundPreviewCard, { borderColor: colors.primary }]}>
                            <Text style={styles.roundPreviewEmoji}>📳</Text>
                            <Text style={styles.roundPreviewTitle}>Round 2</Text>
                            <Text style={styles.roundPreviewSub}>Haptic cues</Text>
                        </View>
                    </View>

                    <Pressable style={styles.buttonPrimary} onPress={() => startRound(1)}>
                        <Text style={styles.buttonPrimaryText}>Start Round 1</Text>
                    </Pressable>
                </>
            )}

            {/* ── Round intro ── */}
            {phase === "round_intro" && (
                <>
                    <RoundBadge r={round} />
                    <View style={styles.sectionView}>
                        <Text style={styles.roundIntroEmoji}>{ROUND_CONFIG[round].emoji}</Text>
                        <Text style={styles.movementLabel}>{ROUND_CONFIG[round].title}</Text>
                        <Text style={styles.subText}>{ROUND_CONFIG[round].subtitle}</Text>
                    </View>
                    <View style={styles.movementList}>
                        {([1, 2, 3] as Movement[]).map((m) => (
                            <View key={m} style={styles.movementRow}>
                                <View style={styles.movementBadge}>
                                    <Text style={styles.movementBadgeText}>{m}</Text>
                                </View>
                                <Text style={styles.subText}>{MOVEMENT_LABELS[m]}</Text>
                            </View>
                        ))}
                    </View>
                    <Pressable style={styles.buttonPrimary} onPress={beginRound}>
                        <Text style={styles.buttonPrimaryText}>Begin</Text>
                    </Pressable>
                    <Pressable style={styles.buttonSecondary} onPress={resetSession}>
                        <Text style={styles.buttonSecondaryText}>Cancel</Text>
                    </Pressable>
                </>
            )}

            {/* ── Cooldown ── */}
            {phase === "cooldown" && (
                <>
                    <RoundBadge r={round} />
                    <MovementStepper />
                    <View style={styles.sectionView}>
                        <Text style={styles.cooldownEmoji}>🧘</Text>
                        <Text style={styles.cooldownTitle}>Get Ready</Text>
                        <Text style={[styles.countdown, { color: colors.primary }]}>
                            {cooldownLeft}
                        </Text>
                        <Text style={styles.subText}>
                            Next: {MOVEMENT_LABELS[(currentMovement + 1) as Movement]}
                        </Text>
                    </View>
                    <Pressable style={styles.buttonSecondary} onPress={resetSession}>
                        <Text style={styles.buttonSecondaryText}>Cancel</Text>
                    </Pressable>
                </>
            )}

            {/* ── Recording ── */}
            {phase === "recording" && (
                <>
                    <RoundBadge r={round} />
                    <MovementStepper />

                    <Text style={styles.movementLabel}>
                        {MOVEMENT_LABELS[currentMovement]}
                    </Text>

                    <View style={styles.ringContainer}>
                        <Animated.View
                            style={[
                                styles.ringFill,
                                {
                                    width: progressAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ["0%", "100%"],
                                    }),
                                    backgroundColor: progressColor,
                                },
                            ]}
                        />
                       
                    </View>

                    {/* Waveform */}
                    <View style={styles.subSectionView}> 
                        <Text style={styles.subTitle}>Movement Magnitude</Text>
                        <View
                            style={{
                                width: CHART_WIDTH,
                                height: CHART_HEIGHT,
                                backgroundColor: colors.surfaceRaised,
                                borderRadius: 8,
                                overflow: "hidden",
                            }}
                        >
                            <Svg width="100%" height="100%">
                                <Polyline
                                    points={chartPoints}
                                    fill="none"
                                    stroke={colors.primary}
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </Svg>
                        </View>
                        <Text style={styles.subText}>
                            Smoother movement = flatter, more consistent wave.
                        </Text>
                    </View>

                    {/* Live metrics */}
                    <View style={styles.metricsRow}>
                        <View style={[styles.metricCard, { flex: 1 }]}>
                            <Text style={styles.metricLabel}>Speed</Text>
                            <Text style={styles.metricValue}>{liveMagnitude}</Text>
                            <Text style={styles.metricUnit}>m/s²</Text>
                        </View>
                        <View style={[styles.metricCard, { flex: 1 }]}>
                            <Text style={styles.metricLabel}>Jerk</Text>
                            <Text style={styles.metricValue}>{liveJerk}</Text>
                            <Text style={styles.metricUnit}>m/s³</Text>
                        </View>
                    </View>

                    {/* Smoothness bar */}
                    <View style={styles.sectionView}>
                        <Text style={styles.subTitle}>Smoothness</Text>
                        {round === 2 && (
                            <Text style={styles.hapticHint}>
                                📳 Phone will buzz if you exceed the jerky threshold
                            </Text>
                        )}
                        <View style={styles.jerkBarBg}>
                            <Animated.View
                                style={[
                                    styles.jerkBarFill,
                                    {
                                        width: jerkAnim.interpolate({
                                            inputRange: [0, 0.8],
                                            outputRange: ["0%", "100%"],
                                        }),
                                        backgroundColor: jerkColor,
                                    },
                                ]}
                            />
                        </View>
                        <View style={styles.jerkBarLabels}>
                            <Text style={[styles.metricUnit, { color: colors.positive }]}>
                                Smooth
                            </Text>
                            <Text style={[styles.metricUnit, { color: colors.destructive }]}>
                                Jerky
                            </Text>
                        </View>
                    </View>

                    <Pressable style={styles.buttonSecondary} onPress={resetSession}>
                        <Text style={styles.buttonSecondaryText}>Cancel</Text>
                    </Pressable>
                </>
            )}

            {/* ── Between rounds ── */}
            {phase === "between_rounds" && (
                <>
                    <View style={styles.sectionView}>
                        <Text style={styles.roundIntroEmoji}>✅</Text>
                        <Text style={styles.movementLabel}>Round 1 Complete!</Text>
                        <Text style={styles.subText}>
                            Good work. Now repeat the same three movements, but this time
                            your phone will buzz whenever your movement becomes too jerky.
                            Try to keep the buzzes to a minimum and see if the feedback
                            helps you move more smoothly.
                        </Text>
                    </View>
                    <Pressable style={styles.buttonPrimary} onPress={() => startRound(2)}>
                        <Text style={styles.buttonPrimaryText}>Start Round 2</Text>
                    </Pressable>
                    <Pressable style={styles.buttonSecondary} onPress={resetSession}>
                        <Text style={styles.buttonSecondaryText}>Start Over</Text>
                    </Pressable>
                </>
            )}
        </ScrollView>
    );
}

// ─── Results Screen ────────────────────────────────────────────────────────────
function ResultScreen({
    result,
    colors,
    onReset,
}: {
    result: SessionResult;
    colors: Colors;
    onReset: () => void;
}) {
    const styles = getStyles(colors);
    const rounds: RoundResult[] = [result.round1, result.round2];

    // Compare avg jerk per movement across rounds
    const improvements = ([1, 2, 3] as Movement[]).map((m) => {
        const r1 = result.round1.movements.find((mv) => mv.movement === m)!;
        const r2 = result.round2.movements.find((mv) => mv.movement === m)!;
        const delta = r1.avgJerk - r2.avgJerk;
        return { movement: m, delta, improved: delta > 0 };
    });

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.titleText}>Results</Text>

            {/* Comparison summary */}
            <View style={styles.sectionView}>
                <Text style={styles.subTitle}>Round Comparison</Text>
                <Text style={styles.subText}>
                    Average jerk per movement — lower is smoother. ▼ means you improved in Round 2.
                </Text>
                {improvements.map(({ movement, delta, improved }) => (
                    <View key={movement} style={styles.comparisonRow}>
                        <View style={styles.movementBadge}>
                            <Text style={styles.movementBadgeText}>{movement}</Text>
                        </View>
                        <Text style={styles.comparisonLabel}>
                            {MOVEMENT_LABELS[movement].split(":")[1]?.trim()}
                        </Text>
                        <View
                            style={[
                                styles.deltaBadge,
                                {
                                    backgroundColor: improved ? colors.positive + "22" : colors.destructive + "22",
                                    borderColor: improved ? colors.positive : colors.destructive,
                                },
                            ]}
                        >
                            <Text style={{ color: improved ? colors.positive : colors.destructive, fontSize: 12, fontWeight: "700" }}>
                                {improved ? "▼ " : "▲ "}{Math.abs(delta).toFixed(3)}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Per-round breakdown */}
            {rounds.map((r) => (
                <View key={r.round} style={styles.sectionView}>
                    <Text style={styles.subTitle}>
                        {r.round === 1 ? "Round 1 : No Feedback 🤫" : "Round 2 : Haptic Feedback 📳"}
                    </Text>
                    <Text style={[styles.subText, { alignSelf: "flex-start" }]}>
                        Hardest movement: {r.hardestMovement}
                    </Text>

                    {r.movements.map((m) => (
                        <View key={m.movement} style={styles.movementResultCard}>
                            <View style={styles.resultHeader}>
                                <View
                                    style={[
                                        styles.movementBadge,
                                        m.movement === r.hardestMovement && { backgroundColor: colors.destructive },
                                    ]}
                                >
                                    <Text style={styles.movementBadgeText}>{m.movement}</Text>
                                </View>
                                <Text style={styles.subTitle}>{m.label.split(":")[1]?.trim()}</Text>
                            </View>
                            <View style={styles.resultGrid}>
                                <ResultStat label="Avg Speed" value={m.avgSpeed.toString()} unit="m/s²" colors={colors} />
                                <ResultStat label="Avg Jerk" value={m.avgJerk.toString()} unit="m/s³" colors={colors} />
                                <ResultStat label="Max Jerk" value={m.maxJerk.toString()} unit="m/s³" colors={colors} />
                                <ResultStat label="Range" value={m.rangeOfMotion.toString()} unit="m/s²" colors={colors} />
                            </View>
                            <View style={[styles.smoothnessBadge, { backgroundColor: m.smoothnessColor + "22", borderColor: m.smoothnessColor }]}>
                                <Text style={[styles.smoothnessBadgeText, { color: m.smoothnessColor }]}>
                                    {m.smoothnessLabel}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            ))}

            {/* Write-up prompts */}
            <View style={styles.sectionView}>
                <Text style={styles.subTitle}>Write-up Prompts</Text>
                <Text style={styles.promptText}>1. Which movement was hardest to keep smooth?</Text>
                <Text style={styles.promptText}>2. Did haptic feedback help you move more smoothly in Round 2?</Text>
                <Text style={styles.promptText}>3. Were there any movements where you got worse in Round 2? Why might that be?</Text>
                <Text style={styles.promptText}>4. What does jerk tell us about coordination compared to speed alone?</Text>
            </View>

            <Pressable style={styles.buttonPrimary} onPress={onReset}>
                <Text style={styles.buttonPrimaryText}>Continue</Text>
            </Pressable>
        </ScrollView>
    );
}

function ResultStat({
    label,
    value,
    unit,
    colors,
}: {
    label: string;
    value: string;
    unit: string;
    colors: Colors;
}) {
    const styles = getStyles(colors);
    return (
        <View style={styles.statBox}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.metricUnit}>{unit}</Text>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const getStyles = (colors: Colors) =>
    StyleSheet.create({
        container: {
            flexGrow: 1,
            backgroundColor: colors.background,
            alignItems: "center",
            padding: 24,
            paddingTop: 60,
            gap: 20,
            paddingBottom: 150,
        },
        titleText: {
            fontSize: 26,
            fontWeight: "700",
            color: colors.textPrimary,
        },
        subTitle: {
            fontSize: 15,
            fontWeight: "600",
            color: colors.textPrimary,
        },
        subText: {
            fontSize: 13,
            color: colors.textSecondary,
            textAlign: "justify",
        },
        sectionView: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            gap: 12,
            padding: 24,
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
        },
        subSectionView: {
            display: "flex",
            justifyContent: "center",
            width: "100%",
            gap: 8,
            padding: 16,
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
        },
        roundBadge: {
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 20,
            backgroundColor: colors.surfaceRaised,
            borderWidth: 1,
            borderColor: colors.border,
        },
        roundBadge2: {
            borderColor: colors.primary,
            backgroundColor: colors.primary + "18",
        },
        roundBadgeText: {
            fontSize: 12,
            fontWeight: "600",
            color: colors.textSecondary,
        },
        roundsPreview: {
            flexDirection: "row",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
        },
        roundPreviewCard: {
            flex: 1,
            alignItems: "center",
            gap: 4,
            padding: 16,
            backgroundColor: colors.surface,
            borderRadius: 14,
            borderWidth: 1,
        },
        roundPreviewEmoji: {
            fontSize: 28,
        },
        roundPreviewTitle: {
            fontSize: 14,
            fontWeight: "700",
            color: colors.textPrimary,
        },
        roundPreviewSub: {
            fontSize: 12,
            color: colors.textSecondary,
        },
        roundArrow: {
            alignItems: "center",
            justifyContent: "center",
        },
        roundIntroEmoji: {
            fontSize: 48,
        },
        movementList: {
            width: "100%",
            gap: 10,
        },
        movementRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
        },
        movementHeader: {
            flexDirection: "row",
            gap: 16,
            alignItems: "center",
        },
        movementStep: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.surfaceRaised,
            borderWidth: 2,
            borderColor: colors.border,
            justifyContent: "center",
            alignItems: "center",
        },
        movementStepActive: {
            borderColor: colors.primary,
            backgroundColor: colors.primary + "22",
        },
        movementStepDone: {
            borderColor: colors.positive,
            backgroundColor: colors.positive + "22",
        },
        movementStepText: {
            fontSize: 14,
            fontWeight: "600",
            color: colors.textSecondary,
        },
        movementStepTextActive: {
            color: colors.primary,
        },
        movementLabel: {
            fontSize: 16,
            fontWeight: "700",
            color: colors.textPrimary,
            textAlign: "center",
        },
        movementBadge: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.primary,
            justifyContent: "center",
            alignItems: "center",
        },
        movementBadgeText: {
            fontSize: 14,
            fontWeight: "700",
            color: colors.textOnPrimary,
        },
        ringContainer: {
            width: "90%",
            justifyContent: "center",
            alignItems: "center",
        },
        ringBg: {
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: 100,
            borderWidth: 8,
            borderColor: colors.border,
        },
        ringFill: {
            position: "absolute",
            bottom: -20,
            left: 0,
            height: 4,
            borderRadius: 2,
        },
        ringInner: {
            alignItems: "center",
            gap: 4,
        },
        countdown: {
            fontSize: 64,
            fontWeight: "800",
            color: colors.textPrimary,
            lineHeight: 72,
        },
        metricsRow: {
            flexDirection: "row",
            width: "100%",
            gap: 12,
        },
        metricCard: {
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 16,
            alignItems: "center",
            gap: 4,
        },
        metricLabel: {
            fontSize: 12,
            fontWeight: "600",
            color: colors.textSecondary,
            textTransform: "uppercase",
            letterSpacing: 0.8,
        },
        metricValue: {
            fontSize: 24,
            fontWeight: "800",
            color: colors.textPrimary,
        },
        metricUnit: {
            fontSize: 11,
            color: colors.textDisabled,
        },
        hapticHint: {
            fontSize: 12,
            color: colors.primary,
            fontWeight: "500",
            textAlign: "center",
        },
        jerkBarBg: {
            width: "100%",
            height: 12,
            backgroundColor: colors.surfaceRaised,
            borderRadius: 6,
            overflow: "hidden",
        },
        jerkBarFill: {
            height: "100%",
            borderRadius: 6,
        },
        jerkBarLabels: {
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
        },
        cooldownEmoji: {
            fontSize: 48,
        },
        cooldownTitle: {
            fontSize: 20,
            fontWeight: "700",
            color: colors.textPrimary,
        },
        comparisonRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            width: "100%",
        },
        comparisonLabel: {
            flex: 1,
            fontSize: 13,
            color: colors.textSecondary,
        },
        deltaBadge: {
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 10,
            borderWidth: 1,
        },
        movementResultCard: {
            width: "100%",
            gap: 10,
            padding: 16,
            backgroundColor: colors.surfaceRaised,
            borderRadius: 12,
            alignItems: "center",
        },
        resultHeader: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            alignSelf: "flex-start",
        },
        resultGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            width: "100%",
            justifyContent: "center",
        },
        statBox: {
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 12,
            alignItems: "center",
            minWidth: "44%",
            gap: 2,
        },
        statLabel: {
            fontSize: 11,
            fontWeight: "600",
            color: colors.textSecondary,
            textTransform: "uppercase",
            letterSpacing: 0.6,
        },
        statValue: {
            fontSize: 20,
            fontWeight: "800",
            color: colors.textPrimary,
        },
        smoothnessBadge: {
            paddingHorizontal: 16,
            paddingVertical: 6,
            borderRadius: 20,
            borderWidth: 1,
        },
        smoothnessBadgeText: {
            fontSize: 13,
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 1,
        },
        promptText: {
            fontSize: 13,
            color: colors.textSecondary,
            alignSelf: "flex-start",
            lineHeight: 20,
        },
        buttonPrimary: {
            width: "100%",
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: 14,
            alignItems: "center",
        },
        buttonPrimaryText: {
            color: colors.textOnPrimary,
            fontSize: 16,
            fontWeight: "700",
        },
        buttonSecondary: {
            width: "100%",
            backgroundColor: colors.surfaceRaised,
            paddingVertical: 16,
            borderRadius: 14,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
        },
        buttonSecondaryText: {
            color: colors.textSecondary,
            fontSize: 16,
            fontWeight: "600",
        },
    });