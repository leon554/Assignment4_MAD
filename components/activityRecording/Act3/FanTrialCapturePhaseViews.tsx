import { FanDistance, FanMaterial } from "@/activityData/FSM/activity3FSM";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { getStyles } from "./FanTrialCapture.styles";
import { getMaterialColor, getMaterialLabel } from "./FanTrialCapture.utils";

type Styles = ReturnType<typeof getStyles>;

export function TrialHeader({
    styles,
    material,
    distance,
    trialNumber,
    totalTrials,
}: {
    styles: Styles;
    material: FanMaterial;
    distance: FanDistance;
    trialNumber: number;
    totalTrials: number;
}) {
    const label = getMaterialLabel(material);
    const color = getMaterialColor(material);
    return (
        <>
            <View style={styles.progressPill}>
                <Text style={styles.progressText}>
                    Trial {trialNumber} / {totalTrials}
                </Text>
            </View>
            <View style={styles.headerRow}>
                <View style={[styles.tag, { backgroundColor: color + "22" }]}>
                    <Text style={[styles.tagText, { color }]}>{label}</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: "#1976d222" }]}>
                    <Text style={[styles.tagText, { color: "#1976d2" }]}>{distance} cm away</Text>
                </View>
            </View>
            <Text style={styles.instruction}>
                Hold the {label.toLowerCase()} upright, fan air from {distance} cm, then take a photo
                of the bend angle.
            </Text>
        </>
    );
}

export function IdleView({
    styles,
    loading,
    onTakePhoto,
    onSkip,
}: {
    styles: Styles;
    loading: boolean;
    onTakePhoto: () => void;
    onSkip: () => void;
}) {
    return (
        <View style={styles.buttonCol}>
            <TouchableOpacity style={styles.primaryBtn} onPress={onTakePhoto} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.btnText}>📷 Take Photo of Bend</Text>
                )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
                <Text style={styles.skipBtnText}>Skip this trial</Text>
            </TouchableOpacity>
        </View>
    );
}
