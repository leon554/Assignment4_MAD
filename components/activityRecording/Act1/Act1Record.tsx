import { getDefaultInitialStateAct1 } from '@/activityData/FSM/activity1FSM';
import { useUser } from '@/context/UserContext';
import { useAct1FSM } from '@/hooks/useAct1FSM';
import useColorPalette from '@/hooks/useColorPalette';
import { submitAttempt } from '@/services/activityAttemptService';
import { Colors } from '@/theme/theme';
import { roundToTwo } from '@/util/util';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ActRatingComment from '../../ActRatingComment';
import Button from '../../Button';
import ParachuteDropCapture from './ParachuteDropCapture';

export default function Act1Record() {
    const colors = useColorPalette();
    const styles = getStyles(colors);
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(0);

    const { teamMembers, activityAttemptId } = useUser();
    const { state, context, send } = useAct1FSM(getDefaultInitialStateAct1(teamMembers));

    useEffect(() => {
        if (state !== 'done') return;
        setScore(calculateScore());
    }, [state]);

    const calculateScore = () => {
        let total = 0;
        context.memberData.forEach((data) => {
            total += data.bestFallDuration;
        });
        return roundToTwo(total);
    };

    const getResultText = () => {
        let text = '';
        teamMembers?.forEach((member) => {
            const data = context.memberData.get(member.memberCode);
            if (!data) return;
            text += `${member.name}:\n`;
            text += `  Best fall duration: ${data.bestFallDuration.toFixed(2)}s\n`;
            text += `  Drops recorded: ${data.drops.length}\n`;
        });
        return text;
    };

    const handleSubmit = async (comment: string, rating: number) => {
        setLoading(true);

        const actData: Record<string, unknown> = {};
        context.memberData.forEach((data, code) => {
            actData[code] = {
                bestFallDuration: data.bestFallDuration,
                dropCount: data.drops.length,
                drops: data.drops.map((d) => ({
                    withParachute: d.withParachute,
                    fallDurationSec: d.fallDurationSec,
                    videoUri: d.videoUri,
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

    return (
        <ScrollView contentContainerStyle={styles.scroll}>
            {state === 'start' && (
                <View style={styles.sectionView}>
                    <Text style={styles.titleText}>Instructions</Text>
                    <Text style={styles.subText}>
                        {context.currentTeamMember.name} will go first!{'\n\n'}
                        1. Drop the toy WITHOUT a parachute and record the baseline.{'\n\n'}
                        2. Build a parachute, then record up to 3 drops.{'\n\n'}
                        3. Rotate to the next team member.
                    </Text>
                    <Button
                        label="Start"
                        onPress={() => send({ name: 'nextStep' })}
                        fullWidth
                    />
                </View>
            )}

            {state === 'baselineDrop' && (
                <View style={styles.sectionView}>
                    <Text style={styles.titleText}>
                        {context.currentTeamMember.name} — Baseline Drop
                    </Text>
                    <Text style={styles.subText}>
                        Drop the toy WITHOUT a parachute from the same height you will use throughout.
                        Record the fall to set the baseline.
                    </Text>
                    <ParachuteDropCapture
                        withParachute={false}
                        dropNumber={1}
                        onRecord={(data) => send({ name: 'recordBaseline', data })}
                        onSkip={() => send({ name: 'skipDrop' })}
                    />
                </View>
            )}

            {state === 'parachuteDrop' && (
                <View style={styles.sectionView}>
                    <Text style={styles.titleText}>
                        {context.currentTeamMember.name} — Parachute Drop {context.currentDropIndex}/3
                    </Text>
                    <Text style={styles.subText}>
                        Attach the parachute and drop from the same height.
                        Try to improve your design each attempt!
                    </Text>
                    <ParachuteDropCapture
                        withParachute
                        dropNumber={context.currentDropIndex}
                        onRecord={(data) => send({ name: 'recordParachute', data })}
                        onSkip={() => send({ name: 'skipDrop' })}
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
        titleText: { fontSize: 20, fontWeight: '600' },
        subTitle: { fontSize: 17, fontWeight: '500' },
        subText: { textAlign: 'justify', color: colors.textSecondary },
    });
