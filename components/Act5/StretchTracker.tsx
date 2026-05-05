import { MovementData } from "@/activityData/FSM/activity5FSM";
import useColorPalette from "@/hooks/useColorPalette";
import { Colors } from "@/theme/theme";
import * as Haptics from "expo-haptics";
import { Accelerometer } from "expo-sensors";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import Svg, { Polyline } from "react-native-svg";
import {
    CHART_HEIGHT,
    CHART_WIDTH,
    COOLDOWN_SECONDS,
    HAPTIC_COOLDOWN_MS,
    JERK_SMOOTHING_ALPHA,
    MODERATE_THRESHOLD,
    MOVEMENT_LABELS,
    RECORDING_SECONDS,
    ROUND_CONFIG,
    SAMPLE_RATE_MS,
    WINDOW_SIZE,
} from "./StretchTracker.constants";
import StretchTrackerResultScreen from "./StretchTrackerResultScreen";
import { getStyles } from "./StretchTracker.styles";
import { MovementStepper, RoundBadge } from "./StretchTrackerPhaseViews";
import { Movement, MovementResult, Phase, Round, RoundResult, Sample, SessionResult } from "./StretchTracker.types";
import { buildRoundResult, computeJerk, magnitude } from "./StretchTracker.utils";


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
            <StretchTrackerResultScreen
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
                    <RoundBadge styles={styles} r={round} />
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
                    <RoundBadge styles={styles} r={round} />
                    <MovementStepper styles={styles} currentMovement={currentMovement} />
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
                    <RoundBadge styles={styles} r={round} />
                    <MovementStepper styles={styles} currentMovement={currentMovement} />

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