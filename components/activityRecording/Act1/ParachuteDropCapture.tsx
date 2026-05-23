import { useUser } from "@/context/UserContext";
import useColorPalette from "@/hooks/useColorPalette";
import { captureAndUploadVideo } from "@/services/mediaService";
import { useRef, useState } from "react";
import { Text, View } from "react-native";
import { TIMER_INTERVAL_MS } from "./ParachuteDropCapture.constants";
import { getStyles } from "./ParachuteDropCapture.styles";
import { ParachuteDropCaptureProps, Phase } from "./ParachuteDropCapture.types";
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
    const {activityAttemptId} = useUser()

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
        const result = await captureAndUploadVideo(activityAttemptId)
        setLoading(false);

        if(!result.success){
            alert("Video error" + result.message)
            return 
        }

        setVideoUri(result.media?.mediaUrl!);
        setFallDuration(result.durationSeconds!);
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
