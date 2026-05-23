import { FAN_DISTANCES, FAN_MATERIALS, getDefaultInitialStateAct3 } from '@/activityData/FSM/activity3FSM';
import { useUser } from '@/context/UserContext';
import { useAct3FSM } from '@/hooks/useAct3FSM';
import useColorPalette from '@/hooks/useColorPalette';
import { submitAttempt } from '@/services/activityAttemptService';
import { Colors } from '@/theme/theme';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ActRatingComment from '../../ActRatingComment';
import Button from '../../Button';
import FanTrialCapture from './FanTrialCapture';

const TOTAL_TRIALS = FAN_MATERIALS.length * FAN_DISTANCES.length;

export default function Act3Record() {
    const colors = useColorPalette();
    const styles = getStyles(colors);
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(0);

    const { teamMembers, activityAttemptId } = useUser();
    const { state, context, send } = useAct3FSM(getDefaultInitialStateAct3(teamMembers));

    useEffect(() => {
        if (state !== 'done') return;
        setScore(calculateScore());
    }, [state]);

    const calculateScore = () => {
        let total = 0;
        context.memberData.forEach((data) => {
            total += data.trials.length * 200;
        });
        return Math.round(total);
    };

    const getResultText = () => {
        let text = '';
        teamMembers?.forEach((member) => {
            const data = context.memberData.get(member.memberCode);
            if (!data) return;
            text += `${member.name}: ${data.trials.length} trial(s) completed\n`;
        });
        return text;
    };

    const handleSubmit = async (comment: string, rating: number) => {
        setLoading(true);

        const actData: Record<string, unknown> = {};
        context.memberData.forEach((data, code) => {
            actData[code] = {
                trialCount: data.trials.length,
                trials: data.trials.map((t) => ({
                    material: t.material,
                    distanceCm: t.distanceCm,
                    notes: t.notes,
                    photoUri: t.photoUri,
                })),
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

    const currentMaterial = FAN_MATERIALS[context.currentMaterialIndex];
    const currentDistance = FAN_DISTANCES[context.currentDistanceIndex];
    const trialNumber =
        context.currentMaterialIndex * FAN_DISTANCES.length + context.currentDistanceIndex + 1;

    return (
        <ScrollView contentContainerStyle={styles.scroll}>
            {state === 'start' && (
                <View style={styles.sectionView}>
                    <Text style={styles.titleText}>Instructions</Text>
                    <Text style={styles.subText}>
                        {context.currentTeamMember.name} will go first!{'\n\n'}
                        You will fan air at paper and cardboard from three distances:{'\n'}
                        15 cm, 30 cm, and 45 cm.{'\n\n'}
                        For each trial, take a photo of how much the material bends and add notes
                        about what you observe.
                    </Text>
                    <Button
                        label="Start Trials"
                        onPress={() => send({ name: 'nextStep' })}
                        fullWidth
                    />
                </View>
            )}

            {state === 'trial' && currentMaterial && currentDistance && (
                <View style={styles.sectionView}>
                    <Text style={styles.titleText}>
                        {context.currentTeamMember.name} — Fan Trial
                    </Text>
                    <FanTrialCapture
                        material={currentMaterial}
                        distance={currentDistance}
                        trialNumber={trialNumber}
                        totalTrials={TOTAL_TRIALS}
                        onRecord={(data) => send({ name: 'recordTrial', data })}
                        onSkip={() => send({ name: 'skipTrial' })}
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
                        Hand the phone to {context.currentTeamMember.name}.{'\n\n'}
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
                    <Text style={styles.subTitle}>Score: {score}</Text>
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
        titleText: { fontSize: 20, fontWeight: '600', color: colors.textPrimary },
        subTitle: { fontSize: 17, fontWeight: '500', color: colors.textPrimary },
        subText: { textAlign: 'justify', color: colors.textSecondary },
    });
