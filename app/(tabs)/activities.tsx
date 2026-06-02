import { ACTIVITY_DATA } from '@/activityData/activityData';
import useColorPalette from '@/hooks/useColorPalette';
import { Colors, DISCIPLINE_COLORS } from '@/theme/theme';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Activities() {
    const router = useRouter();
    const colors = useColorPalette();
    const insets = useSafeAreaInsets();
    const styles = getStyles(colors);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Activities</Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                    Select an activity to begin
                </Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            >
                {Object.values(ACTIVITY_DATA).map((activity) => {
                    const disciplineColor = DISCIPLINE_COLORS[activity.discipline]
                    return(
                        <TouchableOpacity
                            key={activity.id}
                            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            onPress={() => router.push(`/activity/${activity.id}` as never)}
                            accessibilityRole="button"
                            accessibilityLabel={`Activity ${activity.id}: ${activity.title}`}
                        >
                            <View style={[styles.numberBadge, { backgroundColor: disciplineColor + '22'}]}>
                                <Text style={[styles.numberText, { color: disciplineColor }]}>
                                    {activity.id}
                                </Text>
                            </View>
    
                            <View style={styles.cardContent}>
                                <View style={styles.titleRow}>
                                    <Text style={[styles.activityTitle, { color: colors.textPrimary }]}>
                                        {activity.title}
                                    </Text>
                                    <View style={[
                                        styles.disciplineTag,
                                        { backgroundColor: (disciplineColor ?? colors.primary) + '22' }
                                    ]}>
                                        <Text style={[
                                            styles.disciplineText,
                                            { color: disciplineColor ?? colors.primary }
                                        ]}>
                                            {activity.discipline}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={[styles.description, { color: colors.textSecondary }]}>
                                    {activity.overview}
                                </Text>
                            </View>
    
                            <Text style={[styles.chevron, { color: colors.textDisabled }]}>›</Text>
                        </TouchableOpacity>
                    )
                })}
            </ScrollView>
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
    list: {
        paddingHorizontal: 24,
        paddingBottom: 32,
        gap: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        gap: 12,
    },
    numberBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    numberText: {
        fontSize: 15,
        fontWeight: '700',
    },
    cardContent: {
        flex: 1,
        gap: 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    activityTitle: {
        fontSize: 15,
        fontWeight: '600',
        flexShrink: 1,
    },
    disciplineTag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    disciplineText: {
        fontSize: 11,
        fontWeight: '600',
    },
    description: {
        fontSize: 13,
        lineHeight: 18,
    },
    chevron: {
        fontSize: 24,
        flexShrink: 0,
    },
});
