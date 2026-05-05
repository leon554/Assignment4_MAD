import { Colors } from "@/theme/theme";
import { Pressable, ScrollView, Text, View } from "react-native";
import { MOVEMENT_LABELS, MOVEMENTS } from "./StretchTracker.constants";
import { getStyles } from "./StretchTracker.styles";
import { ResultScreenProps } from "./StretchTracker.types";

function ResultStat({
    label,
    value,
    unit,
    colors,
}: {
    label: string;
    value: string;
    unit: string;
    colors: Colors;
}) {
    const styles = getStyles(colors);
    return (
        <View style={styles.statBox}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.metricUnit}>{unit}</Text>
        </View>
    );
}

export default function StretchTrackerResultScreen({
    result,
    colors,
    onReset,
}: ResultScreenProps) {
    const styles = getStyles(colors);
    const rounds = [result.round1, result.round2];
    const improvements = MOVEMENTS.map((m) => {
        const r1 = result.round1.movements.find((mv) => mv.movement === m)!;
        const r2 = result.round2.movements.find((mv) => mv.movement === m)!;
        const delta = r1.avgJerk - r2.avgJerk;
        return { movement: m, delta, improved: delta > 0 };
    });

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.titleText}>Results</Text>

            <View style={styles.sectionView}>
                <Text style={styles.subTitle}>Round Comparison</Text>
                <Text style={styles.subText}>
                    Average jerk per movement — lower is smoother. ▼ means you improved in Round 2.
                </Text>
                {improvements.map(({ movement, delta, improved }) => (
                    <View key={movement} style={styles.comparisonRow}>
                        <View style={styles.movementBadge}>
                            <Text style={styles.movementBadgeText}>{movement}</Text>
                        </View>
                        <Text style={styles.comparisonLabel}>
                            {MOVEMENT_LABELS[movement].split(":")[1]?.trim()}
                        </Text>
                        <View
                            style={[
                                styles.deltaBadge,
                                {
                                    backgroundColor: improved ? colors.positive + "22" : colors.destructive + "22",
                                    borderColor: improved ? colors.positive : colors.destructive,
                                },
                            ]}
                        >
                            <Text style={{ color: improved ? colors.positive : colors.destructive, fontSize: 12, fontWeight: "700" }}>
                                {improved ? "▼ " : "▲ "}
                                {Math.abs(delta).toFixed(3)}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {rounds.map((r) => (
                <View key={r.round} style={styles.sectionView}>
                    <Text style={styles.subTitle}>
                        {r.round === 1 ? "Round 1 : No Feedback 🤫" : "Round 2 : Haptic Feedback 📳"}
                    </Text>
                    <Text style={[styles.subText, { alignSelf: "flex-start" }]}>
                        Hardest movement: {r.hardestMovement}
                    </Text>

                    {r.movements.map((m) => (
                        <View key={m.movement} style={styles.movementResultCard}>
                            <View style={styles.resultHeader}>
                                <View
                                    style={[
                                        styles.movementBadge,
                                        m.movement === r.hardestMovement && { backgroundColor: colors.destructive },
                                    ]}
                                >
                                    <Text style={styles.movementBadgeText}>{m.movement}</Text>
                                </View>
                                <Text style={styles.subTitle}>{m.label.split(":")[1]?.trim()}</Text>
                            </View>
                            <View style={styles.resultGrid}>
                                <ResultStat label="Avg Speed" value={m.avgSpeed.toString()} unit="m/s²" colors={colors} />
                                <ResultStat label="Avg Jerk" value={m.avgJerk.toString()} unit="m/s³" colors={colors} />
                                <ResultStat label="Max Jerk" value={m.maxJerk.toString()} unit="m/s³" colors={colors} />
                                <ResultStat label="Range" value={m.rangeOfMotion.toString()} unit="m/s²" colors={colors} />
                            </View>
                            <View
                                style={[
                                    styles.smoothnessBadge,
                                    { backgroundColor: m.smoothnessColor + "22", borderColor: m.smoothnessColor },
                                ]}
                            >
                                <Text style={[styles.smoothnessBadgeText, { color: m.smoothnessColor }]}>
                                    {m.smoothnessLabel}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            ))}

            <View style={styles.sectionView}>
                <Text style={styles.subTitle}>Write-up Prompts</Text>
                <Text style={styles.promptText}>1. Which movement was hardest to keep smooth?</Text>
                <Text style={styles.promptText}>2. Did haptic feedback help you move more smoothly in Round 2?</Text>
                <Text style={styles.promptText}>3. Were there any movements where you got worse in Round 2? Why might that be?</Text>
                <Text style={styles.promptText}>4. What does jerk tell us about coordination compared to speed alone?</Text>
            </View>

            <Pressable style={styles.buttonPrimary} onPress={onReset}>
                <Text style={styles.buttonPrimaryText}>Continue</Text>
            </Pressable>
        </ScrollView>
    );
}
