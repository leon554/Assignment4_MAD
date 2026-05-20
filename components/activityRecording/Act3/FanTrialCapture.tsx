import { FanTrial } from "@/activityData/FSM/activity3FSM";
import useColorPalette from "@/hooks/useColorPalette";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { View } from "react-native";
import { PHOTO_QUALITY } from "./FanTrialCapture.constants";
import { getStyles } from "./FanTrialCapture.styles";
import { Phase, FanTrialCaptureProps } from "./FanTrialCapture.types";
import { IdleView, TrialHeader } from "./FanTrialCapturePhaseViews";
import FanTrialCaptureResultScreen from "./FanTrialCaptureResultScreen";

export default function FanTrialCapture({
    material,
    distance,
    trialNumber,
    totalTrials,
    onRecord,
    onSkip,
}: FanTrialCaptureProps) {
    const colors = useColorPalette();
    const styles = getStyles(colors);

    const [phase, setPhase] = useState<Phase>("idle");
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [notes, setNotes] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const takePhoto = async () => {
        setLoading(true);
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
            alert("Camera permission is required to photograph the bend angle.");
            setLoading(false);
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: PHOTO_QUALITY,
        });
        setLoading(false);
        if (result.canceled) return;
        setPhotoUri(result.assets[0].uri);
        setPhase("review");
    };

    const handleConfirm = () => {
        onRecord({ material, distanceCm: distance, photoUri: photoUri ?? "", notes });
        setPhase("idle");
        setPhotoUri(null);
        setNotes("");
    };

    const handleRetake = () => {
        setPhase("idle");
        setPhotoUri(null);
    };

    return (
        <View style={styles.container}>
            <TrialHeader
                styles={styles}
                material={material}
                distance={distance}
                trialNumber={trialNumber}
                totalTrials={totalTrials}
            />
            {phase === "idle" && (
                <IdleView
                    styles={styles}
                    loading={loading}
                    onTakePhoto={takePhoto}
                    onSkip={onSkip}
                />
            )}
            {phase === "review" && photoUri && (
                <FanTrialCaptureResultScreen
                    styles={styles}
                    material={material}
                    distance={distance}
                    photoUri={photoUri}
                    notes={notes}
                    onNotesChange={setNotes}
                    onConfirm={handleConfirm}
                    onRetake={handleRetake}
                />
            )}
        </View>
    );
}
