import { SoundAction, SOUND_ACTION_LABELS } from "@/activityData/FSM/activity2FSM";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { getStyles } from "./SoundMeter.styles";
import { dbBarPercent, dbColor, getActionHint } from "./SoundMeter.utils";

type Styles = ReturnType<typeof getStyles>;

export function SoundMeterHeader({
    styles,
    action,
    actionNumber,
    totalActions,
}: {
    styles: Styles;
    action: SoundAction;
    actionNumber: number;
    totalActions: number;
}) {
    return (
        <>
            <View style={styles.progressPill}>
                <Text style={styles.progressText}>
                    Action {actionNumber} / {totalActions}
                </Text>
            </View>
            <Text style={styles.actionTitle}>{SOUND_ACTION_LABELS[action]}</Text>
            <Text style={styles.hint}>{getActionHint(action)}</Text>
        </>
    );
}

export function IdleView({
    styles,
    location,
    onLocationChange,
    onStart,
    onSkip,
}: {
    styles: Styles;
    location: string;
    onLocationChange: (v: string) => void;
    onStart: () => void;
    onSkip: () => void;
}) {
    return (
        <View style={styles.buttonCol}>
            <TextInput
                style={styles.locationInput}
                value={location}
                onChangeText={onLocationChange}
                placeholder="Location (e.g. near door)"
                placeholderTextColor="#888"
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={onStart}>
                <Text style={styles.btnText}>🎙 Start 5-Second Measurement</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
                <Text style={styles.skipBtnText}>Skip this action</Text>
            </TouchableOpacity>
        </View>
    );
}

export function RecordingView({
    styles,
    timeLeft,
    currentDb,
    peakDb,
}: {
    styles: Styles;
    timeLeft: number;
    currentDb: number;
    peakDb: number;
}) {
    return (
        <View style={styles.meterBox}>
            <Text style={styles.countdownText}>{timeLeft.toFixed(1)}s</Text>
            <Text style={styles.dbDisplay}>{Math.round(currentDb)} dB</Text>
            <View style={styles.barTrack}>
                <View
                    style={[
                        styles.barFill,
                        {
                            width: `${dbBarPercent(currentDb)}%` as any,
                            backgroundColor: dbColor(currentDb),
                        },
                    ]}
                />
            </View>
            <Text style={styles.peakLabel}>Peak: {Math.round(peakDb)} dB</Text>
        </View>
    );
}
