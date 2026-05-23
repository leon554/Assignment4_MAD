import { Text, TouchableOpacity, View } from "react-native";
import { getStyles } from "./ParachuteDropCapture.styles";

type Styles = ReturnType<typeof getStyles>;

interface Props {
    styles: Styles;
    videoUri: string | null;
    fallDuration: number;
    onConfirm: () => void;
    onRedo: () => void;
}

export default function ParachuteDropCaptureResultScreen({
    styles,
    videoUri,
    fallDuration,
    onConfirm,
    onRedo,
}: Props) {
    return (
        <View style={styles.reviewBox}>
            {videoUri && (
                <View style={styles.videoTag}>
                    <Text style={styles.videoTagText}>✅ Video recorded</Text>
                </View>
            )}
            <Text style={styles.durationText}>Fall duration: {fallDuration.toFixed(2)}s</Text>
            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.primaryBtn} onPress={onConfirm}>
                    <Text style={styles.btnText}>✓ Save This Drop</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={onRedo}>
                    <Text style={styles.secondaryBtnText}>Redo</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
