import { MovementData } from "@/activityData/FSM/activity5FSM";
import useColorPalette from "@/hooks/useColorPalette";
import * as Haptics from "expo-haptics";
import { Accelerometer } from "expo-sensors";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import {
    COOLDOWN_SECONDS,
    HAPTIC_COOLDOWN_MS,
    JERK_SMOOTHING_ALPHA,
    MODERATE_THRESHOLD,
    RECORDING_SECONDS,
    ROUND_CONFIG,
    SAMPLE_RATE_MS,
    WINDOW_SIZE,
} from "./StretchTracker.constants";
import { Movement, Phase, Round, Sample, SessionResult } from "./StretchTracker.types";
import {
    aggregateSession,
    buildChartPoints,
    buildRoundResult,
    computeJerk,
    magnitude,
} from "./StretchTracker.utils";

interface UseStretchSessionArgs {
    onComplete: (data: MovementData) => void;
}

export function useStretchSession({ onComplete }: UseStretchSessionArgs) {
    const colors = useColorPalette();

    const [phase, setPhase] = useState<Phase>("idle");
    const [round, setRound] = useState<Round>(1);
    const [currentMovement, setCurrentMovement] = useState<Movement>(1);
    const [secondsLeft, setSecondsLeft] = useState(RECORDING_SECONDS);
    const [cooldownLeft, setCooldownLeft] = useState(COOLDOWN_SECONDS);
    const [chartPoints, setChartPoints] = useState<string>("");
    const [liveJerk, setLiveJerk] = useState<number>(0);
    const [liveMagnitude, setLiveMagnitude] = useState<number>(0);
    const [result, setResult] = useState<SessionResult | null>(null);

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

    const currentMovementRef = useRef<Movement>(1);
    const roundRef = useRef<Round>(1);
    const sensorHandlerRef = useRef<(x: number, y: number, z: number) => void>(() => { });
    const advanceMovementRef = useRef<(current: Movement) => void>(() => { });

    useEffect(() => { currentMovementRef.current = currentMovement; }, [currentMovement]);
    useEffect(() => { roundRef.current = round; }, [round]);

    const stopSensor = useCallback(() => {
        subscriptionRef.current?.remove();
        subscriptionRef.current = null;
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        Accelerometer.setUpdateInterval(1000);
    }, []);

    const finaliseSession = useCallback(() => {
        stopSensor();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const r1 = buildRoundResult(1, round1BuffersRef.current, colors);
        const r2 = buildRoundResult(2, round2BuffersRef.current, colors);
        setResult({ round1: r1, round2: r2 });
        setPhase("done");
    }, [stopSensor, colors]);

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

    const advanceMovement = useCallback(
        (current: Movement) => {
            subscriptionRef.current?.remove();
            subscriptionRef.current = null;

            if (current < 3) {
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
                setPhase("between_rounds");
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                finaliseSession();
            }
        },
        [finaliseSession, startMovement]
    );

    useEffect(() => {
        advanceMovementRef.current = advanceMovement;
    }, [advanceMovement]);

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

                if (hapticEnabled && smoothedJerkRef.current > MODERATE_THRESHOLD) {
                    const timeSinceLast = now - lastHapticRef.current;
                    if (timeSinceLast > HAPTIC_COOLDOWN_MS) {
                        lastHapticRef.current = now;
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    }
                }

                if (bufferRef.current.length > 5) {
                    setChartPoints(buildChartPoints(bufferRef.current));
                }
            };

            subscriptionRef.current = Accelerometer.addListener(({ x, y, z }) => {
                sensorHandlerRef.current(x, y, z);
            });
        },
        [jerkAnim]
    );

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

    const jerkColor = jerkAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [colors.positive, colors.primary, colors.destructive],
    });

    const progressColor = progressAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [colors.destructive, colors.primary, colors.positive],
    });

    const completeSession = useCallback(() => {
        if (!result) return;
        onComplete(aggregateSession(result));
        resetSession();
    }, [result, onComplete, resetSession]);

    return {
        colors,
        phase,
        round,
        currentMovement,
        secondsLeft,
        cooldownLeft,
        chartPoints,
        liveJerk,
        liveMagnitude,
        result,
        progressAnim,
        jerkAnim,
        progressColor,
        jerkColor,
        startRound,
        beginRound,
        resetSession,
        completeSession,
    };
}