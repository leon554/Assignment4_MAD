import useColorPalette from '@/hooks/useColorPalette';
import { Colors } from '@/theme/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACTIVITY_DATA: Record<string, {
    id: string;
    title: string;
    discipline: string;
    category: string;
    overview: string;
    equipment: string[];
    instructions: string[];
    curriculumLinks: string[];
}> = {
    '1': {
        id: '1',
        title: 'Parachute Drop Challenge',
        discipline: 'Engineering',
        category: 'Engineering Challenges',
        overview: 'Students design, build, and test a parachute for a small toy to reduce its landing speed and impact force. Teams iterate their designs under time and material constraints, aiming to achieve the slowest and safest landing within a target area.',
        equipment: [
            'Mobile phone with STEMM Lab app',
            'Small toy (e.g. army toy soldier)',
            'Table or elevated surface',
            'Paper or plastic',
            'String',
            'Scissors',
            'Tape',
        ],
        instructions: [
            'Drop the toy without a parachute and record the fall (baseline test).',
            'Build a parachute using provided materials.',
            'Drop the toy from the same height and record the fall.',
            'Review speed and landing accuracy results in the app.',
            'Redesign and test up to three prototypes within 20 minutes.',
            'Upload videos, results, and team reflections.',
        ],
        curriculumLinks: [
            'ACSSU076 / ACSSU117 — Forces affect motion',
            'ACSIS124 — Planning and conducting investigations',
            'ACSIS126 — Analysing patterns in data',
            'ACTDEP036 — Generate, test, and improve solutions',
        ],
    },
    '2': {
        id: '2',
        title: 'Sound Pollution Hunter',
        discipline: 'Science',
        category: 'Engineering Challenges',
        overview: 'Students measure and compare sound levels in different classroom activities. Teams map loud and quiet zones and analyse how sound intensity varies depending on energy and surfaces.',
        equipment: [
            'Mobile phone with STEMM Lab app',
        ],
        instructions: [
            'Measure noise from different actions (dropping objects, talking, walking, stamping your feet).',
            'Record sound levels and locations.',
            'Map loud and quiet zones.',
        ],
        curriculumLinks: [
            'ACSSU073 — Sound and energy',
            'ACPPS053 — Health and wellbeing',
        ],
    },
    '3': {
        id: '3',
        title: 'Hand Fan Challenge',
        discipline: 'Physics',
        category: 'Engineering Challenges',
        overview: 'Students test how air movement affects flexible materials. Teams record how different fan designs and distances affect the bend angle of paper and cardboard.',
        equipment: [
            'Paper and cardboard',
            'Scissors',
            'Mobile phone',
            'Sticky tape',
            'STEMM Mobile App',
        ],
        instructions: [
            'Stand paper upright on a table.',
            'Fan air from 30 cm away.',
            'Observe and record movement.',
            'Repeat with different fan designs and fan distances (15 cm, 30 cm, 45 cm).',
            'Repeat with cardboard instead of paper.',
        ],
        curriculumLinks: [
            'ACSSU076 — Forces and motion',
        ],
    },
    '4': {
        id: '4',
        title: 'Earthquake-Resistant Structure',
        discipline: 'Engineering',
        category: 'Engineering Challenges',
        overview: 'Students design structures that withstand vibration, simulating earthquakes. Teams iterate their designs to reduce phone movement recorded by the accelerometer.',
        equipment: [
            'Cardboard, paper, scissors, sticky tape, plastic/paper cups',
            'Mobile phone with vibration sensor',
        ],
        instructions: [
            'Build an anti-vibration layer by folding paper or cardboard.',
            'Place a flat cardboard platform on top.',
            'Place the phone in the centre and activate vibration mode on the STEMM App.',
            'Modify the structure to reduce movement (e.g. more pillars, more folds).',
        ],
        curriculumLinks: [
            'ACSSU096 — Earth processes',
            'ACTDEP036 — Testing and improving designs',
        ],
    },
    '5': {
        id: '5',
        title: 'Human Performance Lab',
        discipline: 'Medical',
        category: 'Health and Medical Sciences',
        overview: 'Students investigate how the human body moves by measuring speed, smoothness, and coordination during controlled stretching activities.',
        equipment: [
            'Mobile phone with STEMM Lab app',
            'Open space to move safely',
        ],
        instructions: [
            'Hold the phone firmly in one hand and activate the app vibration sensor.',
            'Perform guided movement slowly as shown in the app and record the vibration.',
            'Repeat the activity with vibration feedback enabled.',
            'Review speed, smoothness, and range-of-motion data.',
            'Upload results and reflect as a group.',
        ],
        curriculumLinks: [
            'ACPPS051 — Movement skills',
            'ACPPS054 — Physical performance',
            'ACSSU176 — Structure and function of body systems',
        ],
    },
    '6': {
        id: '6',
        title: 'Reaction Board Challenge',
        discipline: 'Neuroscience',
        category: 'Health and Medical Sciences',
        overview: 'Students measure reaction time, coordination, and improvement through repeated digital and physical challenges.',
        equipment: [
            'Mobile phone with STEMM Lab app',
            'Clear working space',
        ],
        instructions: [
            'Phase 1 — Tap the screen as soon as the hidden button appears and record reaction time.',
            'Rotate through each team member.',
            'Phase 2 — Repeat using the non-dominant hand and compare results.',
            'Rotate through each team member.',
            'Phase 3 — Trace a moving shape on the screen and review accuracy and delay.',
            'Rotate through each team member.',
        ],
        curriculumLinks: [
            'ACSIS130 — Collecting and analysing data',
            'ACMSP147 — Averages and variation',
            'ACPPS057 — Understanding physical performance',
        ],
    },
    '7': {
        id: '7',
        title: 'Breathing Pace Trainer',
        discipline: 'Medical',
        category: 'Health and Medical Sciences',
        overview: 'Students analyse breathing patterns at rest and after exercise. Sensors detect chest movement helping students visualise breathing patterns.',
        equipment: [
            'Mobile phone with STEMM Lab app',
            'Flat surface or mat',
        ],
        instructions: [
            'Place the phone gently on the chest.',
            'Record breathing at rest.',
            'Perform light exercise: jog one minute on the spot.',
            'Perform 100 star jumps.',
            'Record breathing again and compare results.',
            'Rotate for each team member.',
        ],
        curriculumLinks: [
            'ACSSU176 — Body systems',
            'ACPPS054 — Physical activity and health',
        ],
    },
};

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