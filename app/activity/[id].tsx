import { ACTIVITY_DATA } from '@/activityData/activityData';
import useColorPalette from '@/hooks/useColorPalette';
import { Colors } from '@/theme/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



const DISCIPLINE_COLORS: Record<string, string> = {
    Engineering: '#673AB7',
    Science: '#4CAF50',
    Physics: '#FF9800',
    Medical: '#E91E63',
    Neuroscience: '#2196F3',
};

export default function ActivityDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const colors = useColorPalette();
    const insets = useSafeAreaInsets();
    const styles = getStyles(colors);

    const activity = ACTIVITY_DATA[id ?? '1'];

    if (!activity) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.textPrimary, padding: 24 }}>Activity not found.</Text>
            </View>
        );
    }

    const disciplineColor = DISCIPLINE_COLORS[activity.discipline] ?? colors.primary;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>

            {/* header */}
            <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/activities')}
                    style={styles.backButton}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Text style={[styles.backText, { color: colors.primary }]}>‹ Back</Text>
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{activity.title}</Text>
                    <View style={[styles.disciplineTag, { backgroundColor: disciplineColor + '22' }]}>
                        <Text style={[styles.disciplineText, { color: disciplineColor }]}>{activity.discipline}</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* overview */}
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Overview</Text>
                    <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{activity.overview}</Text>
                </View>

                {/* equipment */}
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Equipment</Text>
                    {activity.equipment.map((item, index) => (
                        <View key={index} style={styles.listRow}>
                            <Text style={[styles.bullet, { color: disciplineColor }]}>•</Text>
                            <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{item}</Text>
                        </View>
                    ))}
                </View>

                {/* instructions */}
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Instructions</Text>
                    {activity.instructions.map((step, index) => (
                        <View key={index} style={styles.listRow}>
                            <View style={[styles.stepBadge, { backgroundColor: disciplineColor + '22' }]}>
                                <Text style={[styles.stepNumber, { color: disciplineColor }]}>{index + 1}</Text>
                            </View>
                            <Text style={[styles.bodyText, { color: colors.textSecondary, flex: 1 }]}>{step}</Text>
                        </View>
                    ))}
                </View>

                {/* curriculum links */}
                <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Curriculum Links</Text>
                    {activity.curriculumLinks.map((link, index) => (
                        <View key={index} style={styles.listRow}>
                            <Text style={[styles.bullet, { color: disciplineColor }]}>•</Text>
                            <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{link}</Text>
                        </View>
                    ))}
                </View>

                {/* start activity button */}
                <TouchableOpacity
                    style={[styles.startButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push(`/record/${activity.id}` as never)}
                    accessibilityRole="button"
                    accessibilityLabel={`Start ${activity.title}`}
                >
                    <Text style={[styles.startButtonText, { color: colors.textOnPrimary }]}>Start Activity</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const getStyles = (colors: Colors) => StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        gap: 8,
    },
    backButton: {
        alignSelf: 'flex-start',
    },
    backText: {
        fontSize: 17,
        fontWeight: '500',
    },
    headerContent: {
        gap: 6,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    disciplineTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 6,
    },
    disciplineText: {
        fontSize: 12,
        fontWeight: '600',
    },
    scroll: {
        padding: 20,
        gap: 16,
    },
    section: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 16,
        gap: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    bodyText: {
        fontSize: 14,
        lineHeight: 20,
    },
    listRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'flex-start',
    },
    bullet: {
        fontSize: 16,
        lineHeight: 20,
    },
    stepBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: 1,
    },
    stepNumber: {
        fontSize: 12,
        fontWeight: '700',
    },
    startButton: {
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    startButtonText: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
});