import { SoundAction, SoundReading } from "@/activityData/FSM/activity2FSM";
import useColorPalette from "@/hooks/useColorPalette";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { METER_INTERVAL_MS, RECORDING_DURATION_MS } from "./SoundMeter.constants";
import { getStyles } from "./SoundMeter.styles";
import { Phase, SoundMeterProps } from "./SoundMeter.types";
import { dbfsToSpl } from "./SoundMeter.utils";
import { IdleView, RecordingView, SoundMeterHeader } from "./SoundMeterPhaseViews";
import SoundMeterResultScreen from "./SoundMeterResultScreen";

export default function SoundMeter({
    action,
    actionNumber,
    totalActions,
    onRecord,
    onSkip,
}: SoundMeterProps) {
    const colors = useColorPalette();
    const styles = getStyles(colors);

    const [phase, setPhase] = useState<Phase>("idle");
    const [currentDb, setCurrentDb] = useState<number>(0);
    const [peakDb, setPeakDb] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<number>(RECORDING_DURATION_MS / 1000);
    const [location, setLocation] = useState<string>("Classroom centre");
    const [avgDb, setAvgDb] = useState<number>(0);

    const recordingRef = useRef<Audio.Recording | null>(null);
    const meterIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const samplesRef = useRef<number[]>([]);
    const peakRef = useRef<number>(0);

    useEffect(() => {
        return () => { stopAll(); };
    }, []);

    const stopAll = async () => {
        if (meterIntervalRef.current) clearInterval(meterIntervalRef.current);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        try {
            if (recordingRef.current) {
                await recordingRef.current.stopAndUnloadAsync();
                recordingRef.current = null;
            }
        } catch (_) {}
    };

    const startRecording = async () => {
        const perm = await Audio.requestPermissionsAsync();
        if (!perm.granted) {
            alert("Microphone permission is required to measure sound levels.");
            return;
        }

        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync({
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
            isMeteringEnabled: true,
        });
        await recording.startAsync();
        recordingRef.current = recording;
        samplesRef.current = [];
        peakRef.current = 0;
        setPeakDb(0);
        setTimeLeft(RECORDING_DURATION_MS / 1000);
        setPhase("recording");

        meterIntervalRef.current = setInterval(async () => {
            try {
                const status = await recording.getStatusAsync();
                if (status.isRecording && status.metering !== undefined) {
                    const spl = dbfsToSpl(status.metering);
                    setCurrentDb(spl);
                    samplesRef.current.push(spl);
                    if (spl > peakRef.current) {
                        peakRef.current = spl;
                        setPeakDb(spl);
                    }
                }
            } catch (_) {}
        }, METER_INTERVAL_MS);

        let remaining = RECORDING_DURATION_MS / 1000;
        timerIntervalRef.current = setInterval(async () => {
            remaining -= 0.1;
            setTimeLeft(Math.max(0, remaining));
            if (remaining <= 0) {
                clearInterval(timerIntervalRef.current!);
                clearInterval(meterIntervalRef.current!);
                await recording.stopAndUnloadAsync();
                recordingRef.current = null;
                const avg =
                    samplesRef.current.length > 0
                        ? samplesRef.current.reduce((a, b) => a + b, 0) / samplesRef.current.length
                        : 0;
                setAvgDb(avg);
                setPhase("review");
            }
        }, 100);
    };

    const handleConfirm = () => {
        onRecord({ action, peakDb: Math.round(peakDb), avgDb: Math.round(avgDb), location });
        setPhase("idle");
        setCurrentDb(0);
        setPeakDb(0);
        setAvgDb(0);
    };

    const handleRedo = () => setPhase("idle");

    return (
        <View style={styles.container}>
            <SoundMeterHeader
                styles={styles}
                action={action}
                actionNumber={actionNumber}
                totalActions={totalActions}
            />
            {phase === "idle" && (
                <IdleView
                    styles={styles}
                    location={location}
                    onLocationChange={setLocation}
                    onStart={startRecording}
                    onSkip={onSkip}
                />
            )}
            {phase === "recording" && (
                <RecordingView
                    styles={styles}
                    timeLeft={timeLeft}
                    currentDb={currentDb}
                    peakDb={peakDb}
                />
            )}
            {phase === "review" && (
                <SoundMeterResultScreen
                    styles={styles}
                    peakDb={peakDb}
                    avgDb={avgDb}
                    primaryColor={colors.primary}
                    onConfirm={handleConfirm}
                    onRedo={handleRedo}
                />
            )}
        </View>
    );
}
