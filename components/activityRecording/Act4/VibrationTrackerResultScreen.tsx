import { StructureIteration } from "@/activityData/FSM/activity4FSM";
import { Text, TouchableOpacity, View } from "react-native";
import { getStyles } from "./VibrationTracker.styles";

type Styles = ReturnType<typeof getStyles>;

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <View style={{ alignItems: "center", gap: 2 }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color }}>{value}</Text>
            <Text style={{ fontSize: 11, color: "#888", textAlign: "center" }}>{label}</Text>
        </View>
    );
}

interface Props {
    styles: Styles;
    primaryColor: string;
    result: StructureIteration;
    iterationNumber: number;
    maxIterations: number;
    onConfirm: () => void;
}

export default function VibrationTrackerResultScreen({
    styles,
    primaryColor,
    result,
    iterationNumber,
    maxIterations,
    onConfirm,
}: Props) {
    const scoreHint =
        result.iterationScore >= 4000
            ? "🌟 Excellent! Very stable structure."
            : result.iterationScore >= 2500
            ? "✅ Good — try modifying to reduce vibration further."
            : "⚠️ High vibration detected — try adding more support.";

    return (
        <View style={styles.resultBox}>
            <Text style={styles.sectionTitle}>Iteration Result</Text>
            <View style={styles.statsGrid}>
                <StatCard
                    label="Peak Acceleration"
                    value={`${result.peakMagnitude.toFixed(2)} m/s²`}
                    color="#f44336"
                />
                <StatCard
                    label="Avg Acceleration"
                    value={`${result.avgMagnitude.toFixed(2)} m/s²`}
                    color={primaryColor}
                />
                <StatCard
                    label="Score"
                    value={`${result.iterationScore}`}
                    color="#4caf50"
                />
            </View>
            <Text style={styles.scoreHint}>{scoreHint}</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={onConfirm}>
                <Text style={styles.btnText}>
                    {iterationNumber < maxIterations ? "Next Iteration →" : "Finish"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
