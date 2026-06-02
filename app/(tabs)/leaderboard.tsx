import { ACTIVITY_DATA } from '@/activityData/activityData';
import Button from '@/components/Button';
import { Dropdown } from '@/components/DropDown';
import useColorPalette from '@/hooks/useColorPalette';
import { getActivityAttemptsForActivity } from '@/services/activityAttemptService';
import { Colors } from '@/theme/theme';
import { ActivityAttempt } from '@/types/dbTypes';
import { FormatNumber } from '@/util/util';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type LeaderboardEntry = {
    name: string;
    totalScore: number;
    attempts: number;
    attemptId?: string;
};

export default function Leaderboard() {
    const colors = useColorPalette();
    const insets = useSafeAreaInsets();
    const styles = getStyles(colors);

    const [selectedActivityName, setSelectedActivityName] = useState(
        ACTIVITY_DATA['6'].title
    );
    const [groupMode, setGroupMode] = useState<'individual' | 'team'>('individual');

    const [attempts, setAttempts] = useState<ActivityAttempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const selectedActivityId = useMemo(() => {
        return Object.keys(ACTIVITY_DATA).find(
            (key) => ACTIVITY_DATA[key].title === selectedActivityName
        )!;
    }, [selectedActivityName]);

    const loadLeaderboard = useCallback(async () => {
        try {
            const data = await getActivityAttemptsForActivity(selectedActivityId);
            setAttempts(data);
            setError('');
        } catch {
            setError('Failed to load leaderboard.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedActivityId]);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadLeaderboard();
        }, [loadLeaderboard])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadLeaderboard();
    };

    const leaderboard = useMemo(() => {
        if (groupMode === 'individual') {
            return getIndevidaulRankings(attempts)
        }
        return getTeamRankings(attempts)
    }, [attempts, groupMode]);

    const getRankIcon = (index: number) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return `#${index + 1}`;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                    Leaderboard
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {selectedActivityName}
                </Text>
            </View>

            <View style={styles.controls}>
                <Dropdown
                    options={[...Object.values(ACTIVITY_DATA)].map(a => a.title)}
                    selected={selectedActivityName}
                    onSelect={setSelectedActivityName}
                    showSearch
                />
                <View style={styles.toggleRow}>
                    <Button
                        label='Individual Best'
                        size="sm"
                        variant={groupMode === 'individual' ? "primary" : "outline"}
                        onPress={() => setGroupMode('individual')}
                        style={{width: "49%"}}
                    />
                    <Button
                        label='Team Avg'
                        size="sm"
                        variant={groupMode === 'team' ? "primary" : "outline"}
                        onPress={() => setGroupMode('team')}
                        style={{width: "48%"}}
                    />
                </View>
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

            {!loading && leaderboard.length > 0 && (
                <ScrollView
                    contentContainerStyle={{
                        padding: 20,
                        paddingBottom: insets.bottom + 32,
                        gap: 12,
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                >
                    {leaderboard.map((entry, index) => (
                        <View
                            key={entry.attemptId ?? `${entry.name}-${index}`}
                            style={[
                                styles.card,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <View style={styles.row}>
                                <Text style={styles.rank}>
                                    {getRankIcon(index)}
                                </Text>

                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={[ styles.name, { color: colors.textPrimary }]}
                                    >
                                        {entry.name}
                                    </Text>

                                    <Text
                                        style={{ color: colors.textSecondary, fontSize: 12}}
                                    >
                                        {groupMode === 'team'
                                            ? `${entry.attempts} attempt${entry.attempts === 1 ? '' : 's'}`
                                            : 'Single attempt'}
                                    </Text>
                                </View>

                                <Text
                                    style={[
                                        styles.score,
                                        { color: colors.primary },
                                    ]}
                                >
                                    {FormatNumber(entry.totalScore/entry.attempts)}
                                </Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}

            {!loading && leaderboard.length === 0 && (
                <View style={styles.centered}>
                    <Text style={{ color: colors.textSecondary }}>
                        No data yet for this activity.
                    </Text>
                </View>
            )}
        </View>
    );
}

function getIndevidaulRankings(attempts: ActivityAttempt[]){
    return attempts
        .map((a) => ({
            name: a.submittedBy,
            totalScore: a.score ?? 0,
            attempts: 1,
            attemptId: a.attemptId,
        }))
        .sort((a, b) => b.totalScore - a.totalScore);
}

function getTeamRankings(attempts: ActivityAttempt[]){
    const map: Record<string, LeaderboardEntry> = {};
        attempts.forEach((a) => {
            const key = a.teamId ?? 'Unknown Team';
            if (!map[key]) {
                map[key] = {
                    name: a.teamName,
                    totalScore: 0,
                    attempts: 0,
                };
            }
            map[key].totalScore += a.score ?? 0;
            map[key].attempts += 1;
        });

    return Object.values(map).sort((a, b) => (b.totalScore/b.attempts) - (a.totalScore/a.attempts));
}

const getStyles = (colors: Colors) =>
    StyleSheet.create({
        container: { flex: 1 },

        header: {
            paddingHorizontal: 24,
            paddingBottom: 12,
        },
        title: {
            fontSize: 26,
            fontWeight: '700',
        },
        subtitle: {
            fontSize: 14,
        },

        controls: {
            paddingHorizontal: 20,
            gap: 10,
            marginBottom: 10,
        },

        toggleRow: {
            flexDirection: 'row',
            gap: 10,
        },

        toggleButton: {
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
        },

        centered: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },

        card: {
            borderRadius: 14,
            borderWidth: 1,
            padding: 16,
        },

        row: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },

        rank: {
            fontSize: 18,
            width: 40,
            color: colors.textPrimary
        },

        name: {
            fontSize: 15,
            fontWeight: '600',
        },

        score: {
            fontSize: 20,
            fontWeight: '700',
        },
    });