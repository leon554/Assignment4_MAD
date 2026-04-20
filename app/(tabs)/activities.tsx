import useColorPalette from '@/hooks/useColorPalette';
import { Colors } from '@/theme/theme';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ACTIVITIES = [
    {
        id: '1',
        title: 'Parachute Drop Challenge',
        discipline: 'Engineering',
        description: 'Design and test a parachute for a small toy to reduce landing speed and impact force.',
    },
    {
        id: '2',
        title: 'Sound Pollution Hunter',
        discipline: 'Science',
        description: 'Measure and compare sound levels across different classroom activities and locations.',
    },
    {
        id: '3',
        title: 'Hand Fan Challenge',
        discipline: 'Physics',
        description: 'Test how air movement from different fan designs affects flexible materials.',
    },
    {
        id: '4',
        title: 'Earthquake-Resistant Structure',
        discipline: 'Engineering',
        description: 'Build and test structures that withstand vibration simulating earthquake conditions.',
    },
    {
        id: '5',
        title: 'Human Performance Lab',
        discipline: 'Medical',
        description: 'Measure speed, smoothness, and coordination during controlled stretching activities.',
    },
    {
        id: '6',
        title: 'Reaction Board Challenge',
        discipline: 'Neuroscience',
        description: 'Measure reaction time, coordination, and improvement through repeated digital and physical challenges.',
    },
    {
        id: '7',
        title: 'Breathing Pace Trainer',
        discipline: 'Medical',
        description: 'Analyse and compare breathing patterns at rest and after exercise.',
    },
];

// tag colours

const DISCIPLINE_COLORS: Record<string, string> = {
    Engineering: '#673AB7',
    Science: '#4CAF50',
    Physics: '#FF9800',
    Medical: '#E91E63',
    Neuroscience: '#2196F3',
};

export default function Activities() {
    const router = useRouter();
    const colors = useColorPalette();
    const styles = getStyles(colors);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>

            {/* header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Activities</Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                    Select an activity to begin
                </Text>
            </View>

            {/* activity list */}
            <ScrollView
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            >
                {ACTIVITIES.map((activity) => (
                    <TouchableOpacity
                        key={activity.id}
                        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => router.push(`/activity/${activity.id}` as never)}
                        accessibilityRole="button"
                        accessibilityLabel={`Activity ${activity.id}: ${activity.title}`}
                    >
                        {/* activity number */}
                        <View style={[styles.numberBadge, { backgroundColor: colors.primary }]}>
                            <Text style={[styles.numberText, { color: colors.textOnPrimary }]}>
                                {activity.id}
                            </Text>
                        </View>

                        {/* content */}
                        <View style={styles.cardContent}>
                            <View style={styles.titleRow}>
                                <Text style={[styles.activityTitle, { color: colors.textPrimary }]}>
                                    {activity.title}
                                </Text>
                                <View style={[
                                    styles.disciplineTag,
                                    { backgroundColor: (DISCIPLINE_COLORS[activity.discipline] ?? colors.primary) + '22' }
                                ]}>
                                    <Text style={[
                                        styles.disciplineText,
                                        { color: DISCIPLINE_COLORS[activity.discipline] ?? colors.primary }
                                    ]}>
                                        {activity.discipline}
                                    </Text>
                                </View>
                            </View>
                            <Text style={[styles.description, { color: colors.textSecondary }]}>
                                {activity.description}
                            </Text>
                        </View>

                        {/* chevron */}
                        <Text style={[styles.chevron, { color: colors.textDisabled }]}>›</Text>
                    </TouchableOpacity>
                ))}
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
        paddingTop: 20,
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