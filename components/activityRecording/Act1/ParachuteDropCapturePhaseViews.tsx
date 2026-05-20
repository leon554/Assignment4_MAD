import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { getStyles } from "./ParachuteDropCapture.styles";

type Styles = ReturnType<typeof getStyles>;

export function IdleView({
    styles,
    loading,
    onRecordVideo,
    onStartTimer,
    onSkip,
}: {
    styles: Styles;
    loading: boolean;
    onRecordVideo: () => void;
    onStartTimer: () => void;
    onSkip?: () => void;
}) {
    return (
        <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.primaryBtn} onPress={onRecordVideo} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.btnText}>📹 Record Video</Text>
                )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onStartTimer}>
                <Text style={styles.secondaryBtnText}>⏱ Time the Drop</Text>
            </TouchableOpacity>
            {onSkip && (
                <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
                    <Text style={styles.skipBtnText}>Skip</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

export function TimingView({
    styles,
    elapsed,
    onStop,
}: {
    styles: Styles;
    elapsed: number;
    onStop: () => void;
}) {
    return (
        <View style={styles.timerBox}>
            <Text style={styles.timerText}>{(elapsed / 1000).toFixed(2)}s</Text>
            <Text style={styles.timerHint}>Tap STOP when the toy lands</Text>
            <TouchableOpacity style={styles.stopBtn} onPress={onStop}>
                <Text style={styles.btnText}>⏹ STOP</Text>
            </TouchableOpacity>
        </View>
    );
}
