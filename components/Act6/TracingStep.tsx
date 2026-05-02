import useColorPalette from "@/hooks/useColorPalette";
import { Colors } from "@/theme/theme";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

const BOX_W = 300;
const BOX_H = 200;
const CIRCLE_R = 20;
const CX = BOX_W / 2;
const CY = BOX_H / 2;
const ELLIPSE_RX = CX - CIRCLE_R;
const ELLIPSE_RY = CY - CIRCLE_R;
const LOOP_MS = 3000;
const SESSION_MS = 5000;
const SAMPLE_MS = 50;

export type TracingStepProps = {
    onComplete?: (score: number) => void;
};

function perSampleScore(
    fx: number,
    fy: number,
    cx: number,
    cy: number,
    r: number
): number {
    const dx = fx - cx;
    const dy = fy - cy;
    const d = Math.hypot(dx, dy);
    if (d <= r) return 100;
    if (d >= 2 * r) return 0;
    return (100 * (2 * r - d)) / r;
}

export function TracingStep({ onComplete }: TracingStepProps) {
    const progress = useSharedValue(0);
    const fingerX = useSharedValue(0);
    const fingerY = useSharedValue(0);

    const circleX = useDerivedValue(() => {
        return CX + ELLIPSE_RX * Math.cos(progress.value * 2 * Math.PI);
    });
    const circleY = useDerivedValue(() => {
        return CY + ELLIPSE_RY * Math.sin(progress.value * 2 * Math.PI);
    });

    const [displayScore, setDisplayScore] = useState<number | null>(null);

    const canStartSessionRef = useRef(true);
    const sessionActiveRef = useRef(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const samplesRef = useRef<number[]>([]);

    const pendingCompleteScoreRef = useRef<number | null>(null);

    const colors = useColorPalette()
    const styles = getStyles(colors)

    const clearTimers = useCallback(() => {
        if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        }
        if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        }
    }, []);

    useEffect(() => {
        progress.value = withRepeat(
            withTiming(1, { duration: LOOP_MS }),
            -1,
            false
        );
        return () => {
            clearTimers();
        };
    }, [clearTimers, progress]);

    const endSession = useCallback(() => {
        clearTimers();
        sessionActiveRef.current = false;
        canStartSessionRef.current = false;
        const samples = samplesRef.current;
        samplesRef.current = [];
        const n = samples.length;
        const avg = n > 0 ? samples.reduce((a, b) => a + b, 0) / n : 0;
        const rounded = Math.round(avg * 10) / 10;
        pendingCompleteScoreRef.current = rounded;
        setDisplayScore(rounded);
    }, [clearTimers]);

    const startSession = useCallback(() => {
        if (!canStartSessionRef.current) return;
        if (sessionActiveRef.current) return;

        sessionActiveRef.current = true;
        samplesRef.current = [];

        intervalRef.current = setInterval(() => {
        const fx = fingerX.value;
        const fy = fingerY.value;
        const cx = circleX.value;
        const cy = circleY.value;
        samplesRef.current.push(
            perSampleScore(fx, fy, cx, cy, CIRCLE_R)
        );
        }, SAMPLE_MS);

        timeoutRef.current = setTimeout(() => {
            endSession();
        }, SESSION_MS);
    }, [fingerX, fingerY, circleX, circleY, endSession]);

    const reset = useCallback(() => {
        const score = pendingCompleteScoreRef.current;
        pendingCompleteScoreRef.current = null;
        if (score !== null) {
            onComplete?.(score);
        }
        clearTimers();
        sessionActiveRef.current = false;
        canStartSessionRef.current = true;
        samplesRef.current = [];
        setDisplayScore(null);
    }, [clearTimers, onComplete]);

    const pan = Gesture.Pan()
        .onBegin((e) => {
            "worklet";
            fingerX.value = e.x;
            fingerY.value = e.y;
            runOnJS(startSession)();
        })
        .onUpdate((e) => {
            "worklet";
            fingerX.value = e.x;
            fingerY.value = e.y;
        })
        .onEnd((e) => {
            "worklet";
            fingerX.value = e.x;
            fingerY.value = e.y;
        });

    const circleStyle = useAnimatedStyle(() => {
        return {
        transform: [
            { translateX: circleX.value - CIRCLE_R },
            { translateY: circleY.value - CIRCLE_R },
        ],
        };
    });

    return (
        <View style={styles.root}>
        <GestureDetector gesture={pan}>
            <View style={styles.box} collapsable={false}>
            <Animated.View style={[styles.circle, circleStyle]} />
            </View>
        </GestureDetector>

        {displayScore !== null && (
            <View style={styles.result}>
            <Text style={styles.scoreLabel}>
                Tracing accuracy: {displayScore.toFixed(1)}%
            </Text>
            <Pressable
                onPress={reset}
                style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                ]}
            >
                <Text style={styles.buttonText}>Continue</Text>
            </Pressable>
            </View>
        )}
        </View>
    );
}

const getStyles = (colors: Colors) => StyleSheet.create({
    root: {
        alignItems: "center",
        marginTop: 40
    },
    box: {
        width: BOX_W,
        height: BOX_H,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.surfaceRaised,
        position: "relative",
        overflow: "hidden",
        borderRadius: 20
    },
    circle: {
        position: "absolute",
        left: 0,
        top: 0,
        width: CIRCLE_R * 2,
        height: CIRCLE_R * 2,
        borderRadius: CIRCLE_R,
        backgroundColor: colors.primary,
    },
    result: {
        marginTop: 16,
        alignItems: "center",
        gap: 12,
    },
    scoreLabel: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111",
    },
    button: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: colors.primary,
        borderRadius: 8,
    },
    buttonPressed: {
        opacity: 0.85,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default TracingStep;
