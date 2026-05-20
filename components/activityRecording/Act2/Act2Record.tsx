import { getDefaultInitialStateAct2, SOUND_ACTIONS } from '@/activityData/FSM/activity2FSM';
import { useUser } from '@/context/UserContext';
import { useAct2FSM } from '@/hooks/useAct2FSM';
import useColorPalette from '@/hooks/useColorPalette';
import { submitAttempt } from '@/services/activityAttemptService';
import { Colors } from '@/theme/theme';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ActRatingComment from '../../ActRatingComment';
import Button from '../../Button';
import SoundMeter from './SoundMeter';

export default function Act2Record() {
    const colors = useColorPalette();
    const styles = getStyles(colors);
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(0);

    const { teamMembers, activityAttemptId } = useUser();
    const { state, context, send } = useAct2FSM(getDefaultInitialStateAct2(teamMembers));

    useEffect(() => {
        if (state !== 'done') return;
        setScore(calculateScore());
    }, [state]);

    const calculateScore = () => {
        let total = 0;
        context.memberData.forEach((data) => {
            total += data.maxDb * 10;
        });
        return Math.round(total);
    };

    const getResultText = () => {
        let text = '';
        teamMembers?.forEach((member) => {
            const data = context.memberData.get(member.memberCode);
            if (!data) return;
            text += `${member.name}:\n`;
            text += `  Readings: ${data.readings.length}\n`;
            text += `  Peak dB: ${data.maxDb.toFixed(1)}\n`;
            text += `  Avg dB: ${data.overallAvgDb.toFixed(1)}\n`;
        });
        return text;
    };

    const handleSubmit = async (comment: string, rating: number) => {
        setLoading(true);

        const actData: Record<string, unknown> = {};
        context.memberData.forEach((data, code) => {
            actData[code] = {
                maxDb: data.maxDb,
                overallAvgDb: data.overallAvgDb,
                readings: data.readings,
            };
        });

        const res = await submitAttempt(activityAttemptId, {
            data: actData,
            rating: Number(rating),
            score: Number(score),
            comment,
        });

        if (!res.success) {
            alert(res.message);
            setLoading(false);
            return;
        }

        alert('Successfully saved!');
        router.replace('/(tabs)');
        setLoading(false);
    };

    const currentAction = SOUND_ACTIONS[context.currentActionIndex];

    return (
        <ScrollView contentContainerStyle={styles.scroll}>
            {state === 'start' && (
                <View style={styles.sectionView}>
                    <Text style={styles.titleText}>Instructions</Text>
                    <Text style={styles.subText}>
                        {context.currentTeamMember.name} will go first!{'\n\n'}
                        You will measure sound levels from 4 different actions:{'\n\n'}
                        • Dropping objects{'\n'}
                        • Talking{'\n'}
                        • Walking{'\n'}
                        • Stamping your feet{'\n\n'}
                        Hold the phone steady and note the location of each measurement.
                    </Text>
                    <Button
                        label="Start Measuring"
                        onPress={() => send({ name: 'nextStep' })}
                        fullWidth
                    />
                </View>
            )}

            {state === 'measuring' && currentAction && (
                <View style={styles.sectionView}>
                    <Text style={styles.titleText}>
                        {context.currentTeamMember.name} — Sound Measurement
                    </Text>
                    <SoundMeter
                        action={currentAction}
                        actionNumber={context.currentActionIndex + 1}
                        totalActions={SOUND_ACTIONS.length}
                        onRecord={(data) => send({ name: 'recordReading', data })}
                        onSkip={() => send({ name: 'skipAction' })}
                    />
                    <Button
                        label="Finish This Member"
                        onPress={() => send({ name: 'nextStep' })}
                        fullWidth
                    />
                </View>
            )}

            {state === 'switchTeamMates' && (
                <View style={styles.sectionView}>
                    <Text style={styles.titleText}>Switch!</Text>
                    <Text style={styles.subText}>
                        Hand the phone to {context.currentTeamMember.name} and move to a different
                        location in the classroom.{'\n\n'}
                        {context.message}
                    </Text>
                    <Button
                        label="Ready"
                        onPress={() => send({ name: 'nextStep' })}
                        fullWidth
                    />
                </View>
            )}

            {state === 'done' && (
                <View style={styles.sectionView}>
                    <Text style={styles.titleText}>Results</Text>
                    <Text style={styles.subTitle}>Exploration Score: {score}</Text>
                    <Text style={styles.subText}>{getResultText()}</Text>
                    <ActRatingComment loading={loading} handleSubmit={handleSubmit} />
                </View>
            )}
        </ScrollView>
    );
}

const getStyles = (colors: Colors) =>
    StyleSheet.create({
        scroll: { flexGrow: 1 },
        sectionView: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            gap: 24,
            padding: 40,
            paddingTop: 50,
        },
        titleText: { fontSize: 20, fontWeight: '600' },
        subTitle: { fontSize: 17, fontWeight: '500' },
        subText: { textAlign: 'justify', color: colors.textSecondary },
    });
