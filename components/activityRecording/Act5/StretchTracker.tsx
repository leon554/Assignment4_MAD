import { MovementData } from "@/activityData/FSM/activity5FSM";
import { useMemo } from "react";
import { ScrollView } from "react-native";
import { getStyles } from "./StretchTracker.styles";
import {
    BetweenRoundsView,
    CooldownView,
    IdleView,
    RecordingView,
    RoundIntroView,
} from "./StretchTrackerPhaseViews";
import StretchTrackerResultScreen from "./StretchTrackerResultScreen";
import { useStretchSession } from "./UseStretchSession";

interface Props {
    onComplete: (data: MovementData) => void;
}

export default function StretchTracker({ onComplete }: Props) {
    const session = useStretchSession({ onComplete });
    const { colors } = session;
    const styles = useMemo(() => getStyles(colors), [colors]);

    if (session.phase === "done" && session.result) {
        return (
            <StretchTrackerResultScreen
                result={session.result}
                colors={colors}
                onReset={session.completeSession}
            />
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {session.phase === "idle" && (
                <IdleView
                    styles={styles}
                    colors={colors}
                    onStartRound1={() => session.startRound(1)}
                />
            )}

            {session.phase === "round_intro" && (
                <RoundIntroView
                    styles={styles}
                    round={session.round}
                    onBegin={session.beginRound}
                    onCancel={session.resetSession}
                />
            )}

            {session.phase === "cooldown" && (
                <CooldownView
                    styles={styles}
                    colors={colors}
                    round={session.round}
                    currentMovement={session.currentMovement}
                    cooldownLeft={session.cooldownLeft}
                    onCancel={session.resetSession}
                />
            )}

            {session.phase === "recording" && (
                <RecordingView
                    styles={styles}
                    colors={colors}
                    round={session.round}
                    currentMovement={session.currentMovement}
                    chartPoints={session.chartPoints}
                    liveMagnitude={session.liveMagnitude}
                    liveJerk={session.liveJerk}
                    progressAnim={session.progressAnim}
                    progressColor={session.progressColor}
                    jerkAnim={session.jerkAnim}
                    jerkColor={session.jerkColor}
                    onCancel={session.resetSession}
                />
            )}

            {session.phase === "between_rounds" && (
                <BetweenRoundsView
                    styles={styles}
                    onStartRound2={() => session.startRound(2)}
                    onReset={session.resetSession}
                />
            )}
        </ScrollView>
    );
}