import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { getStyles } from "./VibrationTracker.styles";
import { barColor, barPercent } from "./VibrationTracker.utils";

type Styles = ReturnType<typeof getStyles>;

export function IterationBadge({
    styles,
    iterationNumber,
    maxIterations,
}: {
    styles: Styles;
    iterationNumber: number;
    maxIterations: number;
}) {
    return (
        <View style={styles.progressPill}>
            <Text style={styles.progressText}>
                Iteration {iterationNumber} / {maxIterations}
            </Text>
        </View>
    );
}

export function BuildView({
    styles,
    iterationNumber,
    maxIterations,
    description,
    onDescriptionChange,
    onStartTest,
    onFinish,
}: {
    styles: Styles;
    iterationNumber: number;
    maxIterations: number;
    description: string;
    onDescriptionChange: (v: string) => void;
    onStartTest: () => void;
    onFinish: () => void;
}) {
    const isFirst = iterationNumber === 1;
    return (
        <View style={styles.sectionBox}>
            <Text style={styles.sectionTitle}>
                {isFirst ? "Build Your Structure" : "Modify Your Structure"}
            </Text>
            <Text style={styles.hint}>
                {isFirst
                    ? "Fold cardboard or paper to create an anti-vibration base, then place a flat platform on top. Rest the phone in the centre."
                    : "Adjust your structure — add more pillars, extra folds, or padding — then place the phone back in the centre."}
            </Text>
            <TextInput
                style={styles.descInput}
                value={description}
                onChangeText={onDescriptionChange}
                placeholder={
                    isFirst
                        ? "Describe your structure (e.g. 4-pillar base, single fold layer)"
                        : "What did you change? (e.g. added 2 extra pillars)"
                }
                placeholderTextColor="#888"
                multiline
                numberOfLines={2}
            />
            <TouchableOpacity
                style={[styles.primaryBtn, !description.trim() && styles.btnDisabled]}
                onPress={onStartTest}
                disabled={!description.trim()}
            >
                <Text style={styles.btnText}>📳 Start Vibration Test (10s)</Text>
            </TouchableOpacity>
            {iterationNumber > 1 && (
                <TouchableOpacity style={styles.finishBtn} onPress={onFinish}>
                    <Text style={styles.finishBtnText}>Finish — no more iterations</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

export function TestingView({
    styles,
    timeLeft,
    liveMag,
    peakMag,
}: {
    styles: Styles;
    timeLeft: number;
    liveMag: number;
    peakMag: number;
}) {
    return (
        <View style={styles.testingBox}>
            <Text style={styles.countdownText}>{timeLeft.toFixed(1)}s</Text>
            <Text style={styles.magDisplay}>{liveMag.toFixed(2)} m/s²</Text>
            <View style={styles.barTrack}>
                <View
                    style={[
                        styles.barFill,
                        { width: `${barPercent(liveMag)}%` as any, backgroundColor: barColor(liveMag) },
                    ]}
                />
            </View>
            <Text style={styles.peakLabel}>Peak: {peakMag.toFixed(2)} m/s²</Text>
            <Text style={styles.shakeHint}>Shake the table/surface to simulate an earthquake!</Text>
        </View>
    );
}
