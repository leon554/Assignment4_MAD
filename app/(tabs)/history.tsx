import { ACTIVITY_DATA } from '@/activityData/activityData';
import StarRating from '@/components/StarRating';
import { useUser } from '@/context/UserContext';
import useColorPalette from '@/hooks/useColorPalette';
import { getActivityAttemptsForTeam } from '@/services/activityAttemptService';
import { Colors, DISCIPLINE_COLORS } from '@/theme/theme';
import { ActivityAttempt } from '@/types/dbTypes';
import { FormatNumber } from '@/util/util';
import { useFocusEffect } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
            const sorted = data.sort((a, b) => {
                const dateA = new Date((a.date as Timestamp).toDate());
                const dateB = new Date((b.date as Timestamp).toDate());
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
    
    function TimeStampToDateString(date: Timestamp): string {
        try {
            const timestamp = new Timestamp(date.seconds, date.nanoseconds)
            const d = new Date(timestamp.toDate());
            return d.toLocaleDateString('en-AU', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch(e ) {
            return `${date}`;
        }
    }

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

            {loading && (
                <View style={styles.centred}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            )}

            {!loading && error !== '' && (
                <View style={styles.centred}>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{error}</Text>
                </View>
            )}

            {!loading && !member?.teamId && (
                <View style={styles.centred}>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        You need to join a team to see history.
                    </Text>
                </View>
            )}

            {!loading && member?.teamId && attempts.length === 0 && error === '' && (
                <View style={styles.centred}>
                    <Text style={styles.emptyIcon}>📋</Text>
                    <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No attempts yet</Text>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        Complete and submit an activity to see it here.
                    </Text>
                </View>
            )}

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
                        const activityName = ACTIVITY_DATA[attempt.activityId].title ?? `Activity ${attempt.activityId}`;
                        const tagColor = DISCIPLINE_COLORS[ACTIVITY_DATA[attempt.activityId].discipline] ?? colors.primary;

                        return (
                            <View
                                key={attempt.attemptId}
                                style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                accessibilityLabel={`${activityName} attempt on ${TimeStampToDateString(attempt.date)}`}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={[styles.activityTag, { backgroundColor: tagColor + '22' }]}>
                                        <Text style={[styles.activityTagText, { color: tagColor }]}>
                                            Activity {attempt.activityId}
                                        </Text>
                                    </View>
                                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                                        {TimeStampToDateString(attempt.date)}
                                    </Text>
                                </View>

                                <Text style={[styles.activityName, { color: colors.textPrimary }]}>
                                    {activityName}
                                </Text>

                                <View style={styles.statsRow}>
                                    <View style={[styles.scoreBadge, { backgroundColor: tagColor + '22' }]}>
                                        <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Score</Text>
                                        <Text style={[styles.scoreValue, { color: tagColor }]}>
                                            {FormatNumber(attempt.score) ?? 0}
                                        </Text>
                                    </View>
                                    <View style={styles.ratingBlock}>
                                        <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Rating</Text>
                                        <StarRating rating={attempt.rating ?? 0} color={tagColor} />
                                    </View>
                                </View>

                                {attempt.comment ? (
                                    <Text
                                        style={[styles.comment, { color: colors.textSecondary, borderTopColor: colors.border }]}
                                        numberOfLines={3}
                                    >
                                        "{attempt.comment}"
                                    </Text>
                                ) : null}

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
