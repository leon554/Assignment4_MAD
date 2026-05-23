import { getDefaultInitialStateAct4 } from '@/activityData/FSM/activity4FSM';
import { useUser } from '@/context/UserContext';
import { useAct4FSM } from '@/hooks/useAct4FSM';
import useColorPalette from '@/hooks/useColorPalette';
import { submitAttempt } from '@/services/activityAttemptService';
import { Colors } from '@/theme/theme';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ActRatingComment from '../../ActRatingComment';
import Button from '../../Button';
import VibrationTracker from './VibrationTracker';

const MAX_ITERATIONS = 3;

export default function Act4Record() {
    const colors = useColorPalette();
    const styles = getStyles(colors);
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(0);

    const { teamMembers, activityAttemptId } = useUser();
    const { state, context, send } = useAct4FSM(getDefaultInitialStateAct4(teamMembers));

    useEffect(() => {
        if (state !== 'done') return;
        setScore(calculateScore());
    }, [state]);

    const calculateScore = () => {
        let total = 0;
        context.memberData.forEach((data) => {
            total += data.bestScore;
        });
        return Math.round(total / Math.max(1, context.memberData.size));
    };

    const getResultText = () => {
        let text = '';
        teamMembers?.forEach((member) => {
            const data = context.memberData.get(member.memberCode);
            if (!data) return;
            text += `${member.name}:\n`;
            text += `  Best score: ${data.bestScore}\n`;
            text += `  Best peak accel: ${data.bestPeakMagnitude === Infinity ? 'N/A' : data.bestPeakMagnitude.toFixed(2) + ' m/s²'}\n`;
            text += `  Iterations: ${data.iterations.length}\n`;
        });
        return text;
    };

    const handleSubmit = async (comment: string, rating: number) => {
        setLoading(true);

        const actData: Record<string, unknown> = {};
        context.memberData.forEach((data, code) => {
            actData[code] = {
                bestScore: data.bestScore,
                bestPeakMagnitude: data.bestPeakMagnitude,
                iterations: data.iterations,
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

    return (
        <ScrollView contentContainerStyle={styles.scroll}>
            {state === 'start' && (
                <View style={styles.sectionView}>
                    <Text style={styles.titleText}>Instructions</Text>
                    <Text style={styles.subText}>
                        {context.currentTeamMember.name} will go first!{'\n\n'}
                        Each team member will:{'\n'}
                        1. Build an anti-vibration structure using paper/cardboard.{'\n'}
                        2. Place the phone on top and run a 10-second vibration test.{'\n'}
                        3. Modify the structure and test again (up to 3 iterations).{'\n\n'}
                        Lower acceleration = less vibration = higher score!
                    </Text>
                    <Button
                        label="Start Building"
                        onPress={() => send({ name: 'nextStep' })}
                        fullWidth
                    />
                </View>
            )}

            {state === 'iterating' && (
                <View style={styles.sectionView}>
                    <Text style={styles.titleText}>
                        {context.currentTeamMember.name} — Structure Test
                    </Text>
                    <VibrationTracker
                        iterationNumber={context.currentIteration}
                        maxIterations={MAX_ITERATIONS}
                        onRecord={(data) => send({ name: 'recordVibration', data })}
                        onFinish={() => send({ name: 'finishMember' })}
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
                    <Text style={styles.subTitle}>Team Score: {score}</Text>
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
