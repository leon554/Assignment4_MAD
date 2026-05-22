import { DropData } from "@/activityData/FSM/activity1FSM";
import useColorPalette from "@/hooks/useColorPalette";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import { Text, View } from "react-native";
import { VIDEO_MAX_DURATION_SEC, TIMER_INTERVAL_MS } from "./ParachuteDropCapture.constants";
import { getStyles } from "./ParachuteDropCapture.styles";
import { Phase, ParachuteDropCaptureProps } from "./ParachuteDropCapture.types";
import { getDropLabel } from "./ParachuteDropCapture.utils";
import { IdleView, TimingView } from "./ParachuteDropCapturePhaseViews";
import ParachuteDropCaptureResultScreen from "./ParachuteDropCaptureResultScreen";

export default function ParachuteDropCapture({
    withParachute,
    dropNumber,
    onRecord,
    onSkip,
}: ParachuteDropCaptureProps) {
    const colors = useColorPalette();
    const styles = getStyles(colors);

    const [phase, setPhase] = useState<Phase>("idle");
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [startMs, setStartMs] = useState<number>(0);
    const [fallDuration, setFallDuration] = useState<number>(0);
    const [elapsed, setElapsed] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startTimer = () => {
        const now = Date.now();
        setStartMs(now);
        setElapsed(0);
        setPhase("timing");
        timerRef.current = setInterval(() => {
            setElapsed(Date.now() - now);
        }, TIMER_INTERVAL_MS);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        const duration = (Date.now() - startMs) / 1000;
        setFallDuration(duration);
        setPhase("review");
    };

    const recordVideo = async () => {
        setLoading(true);
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
            alert("Camera permission is required to record the drop.");
            setLoading(false);
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["videos"],
            videoMaxDuration: VIDEO_MAX_DURATION_SEC,
            quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
        });
        setLoading(false);
        if (result.canceled) return;
        const asset = result.assets[0];
        setVideoUri(asset.uri);
        if (asset.duration && asset.duration > 0) {
            setFallDuration(asset.duration);
        }
        setPhase("review");
    };

    const handleConfirm = () => {
        onRecord({ videoUri: videoUri ?? "", fallDurationSec: fallDuration, withParachute });
        setPhase("idle");
        setVideoUri(null);
        setFallDuration(0);
    };

    const handleRedo = () => {
        setPhase("idle");
        setVideoUri(null);
        setFallDuration(0);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{getDropLabel(withParachute, dropNumber)}</Text>
            {phase === "idle" && (
                <IdleView
                    styles={styles}
                    loading={loading}
                    onRecordVideo={recordVideo}
                    onStartTimer={startTimer}
                    onSkip={onSkip}
                />
            )}
            {phase === "timing" && (
                <TimingView styles={styles} elapsed={elapsed} onStop={stopTimer} />
            )}
            {phase === "review" && (
                <ParachuteDropCaptureResultScreen
                    styles={styles}
                    videoUri={videoUri}
                    fallDuration={fallDuration}
                    onConfirm={handleConfirm}
                    onRedo={handleRedo}
                />
            )}
        </View>
    );
}
