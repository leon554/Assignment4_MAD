import { computeIterationScore, StructureIteration } from "@/activityData/FSM/activity4FSM";
import useColorPalette from "@/hooks/useColorPalette";
import { Accelerometer } from "expo-sensors";
import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { RECORDING_SECONDS, SAMPLE_RATE_MS } from "./VibrationTracker.constants";
import { getStyles } from "./VibrationTracker.styles";
import { Phase, VibrationTrackerProps } from "./VibrationTracker.types";
import { magnitude } from "./VibrationTracker.utils";
import { BuildView, IterationBadge, TestingView } from "./VibrationTrackerPhaseViews";
import VibrationTrackerResultScreen from "./VibrationTrackerResultScreen";

type Sample = { ax: number; ay: number; az: number; magnitude: number; timestamp: number };

export default function VibrationTracker({
    iterationNumber,
    maxIterations,
    onRecord,
    onFinish,
}: VibrationTrackerProps) {
    const colors = useColorPalette();
    const styles = getStyles(colors);

    const [phase, setPhase] = useState<Phase>("build");
    const [description, setDescription] = useState<string>("");
    const [timeLeft, setTimeLeft] = useState<number>(RECORDING_SECONDS);
    const [liveMag, setLiveMag] = useState<number>(0);
    const [peakMag, setPeakMag] = useState<number>(0);
    const [result, setResult] = useState<StructureIteration | null>(null);

    const samplesRef = useRef<Sample[]>([]);
    const peakRef = useRef<number>(0);
    const subRef = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => () => stopAll(), []);

    const stopAll = useCallback(() => {
        subRef.current?.remove();
        subRef.current = null;
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        Accelerometer.setUpdateInterval(1000);
    }, []);

    const startTest = () => {
        samplesRef.current = [];
        peakRef.current = 0;
        setPeakMag(0);
        setTimeLeft(RECORDING_SECONDS);
        setPhase("testing");

        Accelerometer.setUpdateInterval(SAMPLE_RATE_MS);
        subRef.current = Accelerometer.addListener(({ x, y, z }) => {
            const m = magnitude(x, y, z);
            setLiveMag(m);
            samplesRef.current.push({ ax: x, ay: y, az: z, magnitude: m, timestamp: Date.now() });
            if (m > peakRef.current) {
                peakRef.current = m;
                setPeakMag(m);
            }
        });

        let remaining = RECORDING_SECONDS;
        timerRef.current = setInterval(() => {
            remaining -= 0.1;
            setTimeLeft(Math.max(0, remaining));
            if (remaining <= 0) {
                clearInterval(timerRef.current!);
                subRef.current?.remove();
                subRef.current = null;

                const allMags = samplesRef.current.map((s) => s.magnitude);
                const avgMagnitude =
                    allMags.length > 0
                        ? allMags.reduce((a, b) => a + b, 0) / allMags.length
                        : 0;
                const peakMagnitude = peakRef.current;
                const iterationScore = computeIterationScore(peakMagnitude);

                setResult({ description, peakMagnitude, avgMagnitude, iterationScore });
                setPhase("result");
            }
        }, 100);
    };

    const handleConfirm = () => {
        if (result) onRecord(result);
        setPhase("build");
        setDescription("");
        setResult(null);
    };

    return (
        <View style={styles.container}>
            <IterationBadge
                styles={styles}
                iterationNumber={iterationNumber}
                maxIterations={maxIterations}
            />
            {phase === "build" && (
                <BuildView
                    styles={styles}
                    iterationNumber={iterationNumber}
                    maxIterations={maxIterations}
                    description={description}
                    onDescriptionChange={setDescription}
                    onStartTest={startTest}
                    onFinish={onFinish}
                />
            )}
            {phase === "testing" && (
                <TestingView
                    styles={styles}
                    timeLeft={timeLeft}
                    liveMag={liveMag}
                    peakMag={peakMag}
                />
            )}
            {phase === "result" && result && (
                <VibrationTrackerResultScreen
                    styles={styles}
                    primaryColor={colors.primary}
                    result={result}
                    iterationNumber={iterationNumber}
                    maxIterations={maxIterations}
                    onConfirm={handleConfirm}
                />
            )}
        </View>
    );
}
