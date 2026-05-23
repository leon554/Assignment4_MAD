import { useUser } from "@/context/UserContext";
import useColorPalette from "@/hooks/useColorPalette";
import { captureAndUploadPhoto } from "@/services/mediaService";
import { useState } from "react";
import { View } from "react-native";
import { getStyles } from "./FanTrialCapture.styles";
import { FanTrialCaptureProps, Phase } from "./FanTrialCapture.types";
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
    const {activityAttemptId} = useUser()

    const takePhoto = async () => {
        setLoading(true);
        const result = await captureAndUploadPhoto(activityAttemptId)
        setLoading(false)

        if(!result.success){
            alert("Error: " + result.message!)
            return
        }

        setPhotoUri(result.media?.mediaUrl!);
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
