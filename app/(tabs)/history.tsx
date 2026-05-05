import { useUser } from '@/context/UserContext';
import useColorPalette from '@/hooks/useColorPalette';
import { getActivityAttemptsForTeam } from '@/services/activityAttemptService';
import { Colors } from '@/theme/theme';
import { ActivityAttempt } from '@/types/dbTypes';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// activity names mapped from id

const ACTIVITY_NAMES: Record<string, string> = {
    '1': 'Parachute Drop Challenge',
    '2': 'Sound Pollution Hunter',
    '3': 'Hand Fan Challenge',
    '4': 'Earthquake-Resistant Structure',
    '5': 'Human Performance Lab',
    '6': 'Reaction Board Challenge',
    '7': 'Breathing Pace Trainer',
};

const DISCIPLINE_COLORS: Record<string, string> = {
    '1': '#673AB7',
    '2': '#4CAF50',
    '3': '#FF9800',
    '4': '#673AB7',
    '5': '#E91E63',
    '6': '#2196F3',
    '7': '#E91E63',
};

function formatDate(date: Date | any): string {
    try {
        const d = new Date(date as any);
        return d.toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return 'Unknown date';
    }
}

function StarRating({ rating, color }: { rating: number; color: string }) {
    return (
        <View style={{ flexDirection: 'row', gap: 2 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <Text key={i} style={{ fontSize: 12, color: i <= rating ? color : '#CCCCCC' }}>
                    ★
                </Text>
            ))}
        </View>
    );
}

export default function History() {
    const colors = useColorPalette();
    const insets = useSafeAreaInsets();
    const styles = getStyles(colors);
    const { member } = useUser();

    const [attempts, setAttempts] = useState<ActivityAttempt[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const loadAttempts = useCallback(async () => {
        if (!member?.teamId) {
            setLoading(false);
            return;
        }
        try {
            const data = await getActivityAttemptsForTeam(member.teamId);
            // sort by date descending
            const sorted = data.sort((a, b) => {
                const dateA = new Date(a.date as any);
                const dateB = new Date(b.date as any);
                return dateB.getTime() - dateA.getTime();
            });
            setAttempts(sorted);
            setError('');
        } catch (e) {
            setError('Failed to load history. Pull down to try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [member?.teamId]);

    // reload every time the tab is focused
    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadAttempts();
        }, [loadAttempts])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadAttempts();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>

            {/* header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>History</Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                    {attempts.length > 0
                        ? `${attempts.length} submitted attempt${attempts.length === 1 ? '' : 's'}`
                        : 'Your submitted attempts will appear here'}
                </Text>
            </View>

            {/* loading */}
            {loading && (
                <View style={styles.centred}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            )}

            {/* error */}
            {!loading && error !== '' && (
                <View style={styles.centred}>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{error}</Text>
                </View>
            )}

            {/* no team */}
            {!loading && !member?.teamId && (
                <View style={styles.centred}>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        You need to join a team to see history.
                    </Text>
                </View>
            )}

            {/* empty state */}
            {!loading && member?.teamId && attempts.length === 0 && error === '' && (
                <View style={styles.centred}>
                    <Text style={styles.emptyIcon}>📋</Text>
                    <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No attempts yet</Text>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        Complete and submit an activity to see it here.
                    </Text>
                </View>
            )}

            {/* attempts list */}
            {!loading && attempts.length > 0 && (
                <ScrollView
                    contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 32 }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                >
                    {attempts.map((attempt) => {
                        const activityName = ACTIVITY_NAMES[attempt.activityId] ?? `Activity ${attempt.activityId}`;
                        const tagColor = DISCIPLINE_COLORS[attempt.activityId] ?? colors.primary;

                        return (
                            <View
                                key={attempt.attemptId}
                                style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                accessibilityLabel={`${activityName} attempt on ${formatDate(attempt.date)}`}
                            >
                                {/* card header */}
                                <View style={styles.cardHeader}>
                                    <View style={[styles.activityTag, { backgroundColor: tagColor + '22' }]}>
                                        <Text style={[styles.activityTagText, { color: tagColor }]}>
                                            Activity {attempt.activityId}
                                        </Text>
                                    </View>
                                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                                        {formatDate(attempt.date)}
                                    </Text>
                                </View>

                                {/* activity name */}
                                <Text style={[styles.activityName, { color: colors.textPrimary }]}>
                                    {activityName}
                                </Text>

                                {/* score and rating row */}
                                <View style={styles.statsRow}>
                                    <View style={[styles.scoreBadge, { backgroundColor: colors.primary + '18' }]}>
                                        <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Score</Text>
                                        <Text style={[styles.scoreValue, { color: colors.primary }]}>
                                            {attempt.score ?? 0}
                                        </Text>
                                    </View>
                                    <View style={styles.ratingBlock}>
                                        <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Rating</Text>
                                        <StarRating rating={attempt.rating ?? 0} color={tagColor} />
                                    </View>
                                </View>

                                {/* comment */}
                                {attempt.comment ? (
                                    <Text
                                        style={[styles.comment, { color: colors.textSecondary, borderTopColor: colors.border }]}
                                        numberOfLines={3}
                                    >
                                        "{attempt.comment}"
                                    </Text>
                                ) : null}

                                {/* submitted by */}
                                <Text style={[styles.submittedBy, { color: colors.textDisabled }]}>
                                    Submitted by {attempt.submittedBy}
                                </Text>
                            </View>
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );
}

const getStyles = (colors: Colors) => StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 12,
        gap: 4,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
    },
    centred: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 12,
    },
    emptyIcon: {
        fontSize: 48,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    list: {
        paddingHorizontal: 20,
        paddingTop: 8,
        gap: 12,
    },
    card: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 16,
        gap: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    activityTag: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    activityTagText: {
        fontSize: 11,
        fontWeight: '600',
    },
    dateText: {
        fontSize: 12,
    },
    activityName: {
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 20,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    scoreBadge: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: 'center',
        minWidth: 64,
    },
    scoreLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    scoreValue: {
        fontSize: 22,
        fontWeight: '700',
    },
    ratingBlock: {
        gap: 4,
    },
    comment: {
        fontSize: 13,
        lineHeight: 18,
        fontStyle: 'italic',
        paddingTop: 10,
        borderTopWidth: 1,
    },
    submittedBy: {
        fontSize: 11,
    },
});
