import EmptyNode from '@/components/EmptyNode';
import LabeledNumber from '@/components/LabeledNumber';
import Section from '@/components/SectionCard';
import { useUser } from '@/context/UserContext'; // adjust path if needed
import useColorPalette from '@/hooks/useColorPalette';
import { getAllAcitivityAttempts } from '@/services/activityAttemptService';
import { Colors } from '@/theme/theme';
import { type ActivitySummary } from '@/types/activityTypes';
import { ActivityAttempt } from '@/types/dbTypes';
import { FormatNumber, getActivitySummaries, getTeamRanking } from '@/util/util';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Home() {
    const colors = useColorPalette();
    const insets = useSafeAreaInsets();
    const styles = getStyles(colors);

    const { member, team, teamMembers } = useUser();

    const [allAttempts, setAllAttempts] = useState<ActivityAttempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const loadAll = useCallback(async () => {
        const results = await getAllAcitivityAttempts()

        if(results.success){
            setAllAttempts(results.data.flat());
            setError('');
        }else{
            setError('Failed to load data.');
        }

        setLoading(false);
        setRefreshing(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadAll();
        }, [loadAll])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadAll();
    };


    const teamRankingSummary = useMemo(() => 
        getTeamRanking(team, allAttempts), [allAttempts, team]);

    const activitySummaries = useMemo<ActivitySummary[]>(() => 
        getActivitySummaries(team, allAttempts), [allAttempts]);


    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <View>
                    <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                        Welcome back
                    </Text>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>
                        {member?.name ?? 'Home'}
                    </Text>
                </View>
                {team?.teamName && (
                    <View style={[styles.teamBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.teamBadgeText, { color: colors.primary }]}>
                            {team.teamName}
                        </Text>
                    </View>
                )}
            </View>

            {loading && (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            )}

            {!loading && error !== '' && (
                <View style={styles.centered}>
                    <Text style={{ color: colors.textSecondary }}>{error}</Text>
                </View>
            )}

            {!loading && error === '' && (
                <ScrollView
                    contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32, gap: 24 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                >
                    <Section title="Team Ranking">
                        {!teamRankingSummary ? (
                            <EmptyNode text="No ranking data yet." />
                        ) : (
                            <View style={[styles.card, { backgroundColor: colors.primary + '22', borderColor: colors.borderStrong }]}>
                                <Text style={[styles.name, { color: colors.textPrimary, marginBottom: 12 }]}>
                                    {team?.teamName}
                                </Text>
                                <View style={styles.row}>
                                    <LabeledNumber
                                        label="Avg Position"
                                        value={`#${teamRankingSummary.avg}`}
                                    />
                                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                                    <LabeledNumber
                                        label="Best"
                                        value={`#${teamRankingSummary.best}`}
                                    />
                                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                                    <LabeledNumber
                                        label="Worst"
                                        value={`#${teamRankingSummary.worst}`}
                                    />
                                </View>
                                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 12, textAlign: 'center' }}>
                                    Across {teamRankingSummary.activitiesRanked} activit{teamRankingSummary.activitiesRanked === 1 ? 'y' : 'ies'}
                                </Text>
                            </View>
                        )}
                    </Section>

                    <Section title="Activities" >
                        {activitySummaries.map((a) => {
                            return(
                                <View key={a.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <Text style={[styles.name, { color: colors.textPrimary, marginBottom: 18 }]}>{a.title}</Text>
                                    <View style={styles.row}>
                                        <LabeledNumber label="Attempts" value={String(a.attempts)}/>
                                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                                        <LabeledNumber label="Team Best" value={FormatNumber(a.topTeamScore)}/>
                                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                                        <LabeledNumber label="World Best" value={FormatNumber(a.topScore)}/>
                                    </View>
                                </View>
                            )
                        })}
                    </Section>

                    <Section title="Team Members" >
                        {!teamMembers || teamMembers.length === 0 ? (
                            <EmptyNode text="No team members found." />
                        ) : (
                            <View style={styles.chipWrap}>
                                {teamMembers.map((tm) => (
                                    <View key={tm.memberCode} style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                                            <Text style={styles.avatarText}>{tm.name.charAt(0).toUpperCase()}</Text>
                                        </View>
                                        <Text style={[styles.chipText, { color: colors.textPrimary }]}>{tm.name}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </Section>
                </ScrollView>
            )}
        </View>
    );
}

const getStyles = (colors: Colors) =>
    StyleSheet.create({
        container: { flex: 1 },
        header: { paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
        greeting: { fontSize: 13, marginBottom: 2 },
        title: { fontSize: 26, fontWeight: '700' },
        teamBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
        teamBadgeText: { fontSize: 12, fontWeight: '600' },
        centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        card: { borderRadius: 14, borderWidth: 1, padding: 16},
        row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
        rank: { fontSize: 18, width: 36 },
        name: { fontSize: 15, fontWeight: '600' },
        score: { fontSize: 20, fontWeight: '700' },
        divider: { width: 1, height: 32 },
        chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
        chip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 24, borderWidth: 1 },
        avatar: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
        avatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },
        chipText: { fontSize: 13, fontWeight: '500' },
    });