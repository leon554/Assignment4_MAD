import { Text, TouchableOpacity, View } from "react-native";
import { getStyles } from "./SoundMeter.styles";

type Styles = ReturnType<typeof getStyles>;

function StatBadge({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 22, fontWeight: "700", color }}>{value}</Text>
            <Text style={{ fontSize: 12, color: "#888" }}>{label}</Text>
        </View>
    );
}

interface Props {
    styles: Styles;
    peakDb: number;
    avgDb: number;
    primaryColor: string;
    onConfirm: () => void;
    onRedo: () => void;
}

export default function SoundMeterResultScreen({
    styles,
    peakDb,
    avgDb,
    primaryColor,
    onConfirm,
    onRedo,
}: Props) {
    return (
        <View style={styles.reviewBox}>
            <Text style={styles.resultTitle}>Measurement Complete</Text>
            <View style={styles.statsRow}>
                <StatBadge label="Peak" value={`${Math.round(peakDb)} dB`} color="#f44336" />
                <StatBadge label="Average" value={`${Math.round(avgDb)} dB`} color={primaryColor} />
            </View>
            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.primaryBtn} onPress={onConfirm}>
                    <Text style={styles.btnText}>✓ Save Reading</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={onRedo}>
                    <Text style={styles.secondaryBtnText}>Redo</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
