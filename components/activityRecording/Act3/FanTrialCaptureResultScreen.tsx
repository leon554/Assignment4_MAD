import { FanDistance, FanMaterial, FanTrial } from "@/activityData/FSM/activity3FSM";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getStyles } from "./FanTrialCapture.styles";

type Styles = ReturnType<typeof getStyles>;

interface Props {
    styles: Styles;
    material: FanMaterial;
    distance: FanDistance;
    photoUri: string;
    notes: string;
    onNotesChange: (v: string) => void;
    onConfirm: () => void;
    onRetake: () => void;
}

export default function FanTrialCaptureResultScreen({
    styles,
    material,
    distance,
    photoUri,
    notes,
    onNotesChange,
    onConfirm,
    onRetake,
}: Props) {
    return (
        <View style={styles.reviewBox}>
            {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="cover" />
            ) : null}
            <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={onNotesChange}
                placeholder="Notes (e.g. slight bend, fell over, large deflection…)"
                multiline
                numberOfLines={2}
            />
            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.primaryBtn} onPress={onConfirm}>
                    <Text style={styles.btnText}>✓ Save Trial</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={onRetake}>
                    <Text style={styles.secondaryBtnText}>Retake Photo</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
