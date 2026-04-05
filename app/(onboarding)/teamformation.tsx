import useColorPalette from '@/hooks/useColorPalette';
import { Colors } from '@/theme/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';

// grade year level options

const GRADES = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];

// componant

export default function Teamformation() {
    const router = useRouter();
    const colors = useColorPalette();
    const styles = getStyles(colors);

    const [teamName, setTeamName] = useState('');
    const [members, setMembers] = useState(['', '', '']);
    const [grade, setGrade] = useState('');
    const [gradeOpen, setGradeOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // errors
    const [teamNameError, setTeamNameError] = useState('');
    const [memberErrors, setMemberErrors] = useState(['', '', '']);
    const [gradeError, setGradeError] = useState('');

    // add and remove members

    const addMember = () => {
        if (members.length < 6) {
            setMembers([...members, '']);
            setMemberErrors([...memberErrors, '']);
        }
    };

    const updateMember = (index: number, value: string) => {
        const updated = [...members];
        updated[index] = value;
        setMembers(updated);
    };

    // validation

    const validate = (): boolean => {
        let valid = true;
        setTeamNameError('');
        setGradeError('');
        const newMemberErrors = members.map(() => '');

        if (teamName.trim().length < 2) {
            setTeamNameError('Please enter a team name');
            valid = false;
        }
        members.forEach((m, i) => {
            if (m.trim().length < 2) {
                newMemberErrors[i] = 'Please enter a name';
                valid = false;
            }
        });
        setMemberErrors(newMemberErrors);
        if (!grade) {
            setGradeError('Please select a grade level');
            valid = false;
        }
        return valid;
    };

    // submit

    const handleContinue = () => {
        if (!validate()) return;
        setLoading(true);
        // save team data
        setTimeout(() => {
            setLoading(false);
            router.push('/(tabs)');
        }, 1500);
    };

    // render

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >

                {/* Header */}
                <View style={styles.header}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight + '33' }]}>
                        <Text style={styles.iconText}>🏢</Text>
                    </View>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>
                        Welcome to STEMM Lab
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Let's set up your team
                    </Text>
                </View>

                {/* form */}
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>

                    {/* team name */}
                    <TextInput
                        label="Team Name"
                        placeholder="Enter team name"
                        value={teamName}
                        onChangeText={setTeamName}
                        autoCapitalize="words"
                        variant={teamNameError ? 'error' : 'default'}
                        helperText={teamNameError}
                        colors={colors}
                    />

                    {/* team members */}
                    <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
                        Team Member Names
                    </Text>

                    {members.map((member, index) => (
                        <TextInput
                            key={index}
                            placeholder={`Member ${index + 1} first name`}
                            value={member}
                            onChangeText={(val) => updateMember(index, val)}
                            autoCapitalize="words"
                            variant={memberErrors[index] ? 'error' : 'default'}
                            helperText={memberErrors[index]}
                            colors={colors}
                        />
                    ))}

                    {/* add a memmber */}
                    {members.length < 6 && (
                        <TouchableOpacity
                            onPress={addMember}
                            accessibilityRole="button"
                            style={styles.addMemberRow}
                        >
                            <Text style={[styles.addMemberText, { color: colors.primary }]}>
                                + Add Member
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* grade Level */}
                    <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>
                        Grade Level
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.dropdown,
                            {
                                borderColor: gradeError ? colors.destructive : colors.border,
                                backgroundColor: colors.surface,
                            },
                        ]}
                        onPress={() => setGradeOpen(!gradeOpen)}
                        accessibilityRole="button"
                    >
                        <Text style={[
                            styles.dropdownText,
                            { color: grade ? colors.textPrimary : colors.textDisabled },
                        ]}>
                            {grade || 'Select grade'}
                        </Text>
                        <Text style={[styles.dropdownChevron, { color: colors.textSecondary }]}>
                            {gradeOpen ? '▲' : '▼'}
                        </Text>
                    </TouchableOpacity>

                    {gradeError ? (
                        <Text style={[styles.errorText, { color: colors.destructive }]}>
                            {gradeError}
                        </Text>
                    ) : null}

                    {/* grade options */}
                    {gradeOpen && (
                        <View style={[styles.dropdownList, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                            {GRADES.map((g) => (
                                <TouchableOpacity
                                    key={g}
                                    style={[
                                        styles.dropdownItem,
                                        { borderBottomColor: colors.border },
                                        grade === g && { backgroundColor: colors.primaryLight + '22' },
                                    ]}
                                    onPress={() => {
                                        setGrade(g);
                                        setGradeOpen(false);
                                        setGradeError('');
                                    }}
                                >
                                    <Text style={[
                                        styles.dropdownItemText,
                                        { color: grade === g ? colors.primary : colors.textPrimary },
                                    ]}>
                                        {g}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* continue button */}
                    <View style={styles.buttonRow}>
                        <Button
                            label="Continue"
                            variant="primary"
                            size="lg"
                            fullWidth
                            loading={loading}
                            onPress={handleContinue}
                            colors={colors}
                        />
                    </View>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// styles

const getStyles = (colors: Colors) => StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 40,
        gap: 24,
    },
    header: {
        alignItems: 'center',
        gap: 8,
        paddingBottom: 8,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    iconText: {
        fontSize: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 20,
        gap: 14,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: -6,
    },
    addMemberRow: {
        marginTop: -4,
    },
    addMemberText: {
        fontSize: 14,
        fontWeight: '600',
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1.5,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    dropdownText: {
        fontSize: 15,
    },
    dropdownChevron: {
        fontSize: 11,
    },
    dropdownList: {
        borderWidth: 1,
        borderRadius: 10,
        marginTop: -8,
        overflow: 'hidden',
    },
    dropdownItem: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    dropdownItemText: {
        fontSize: 14,
    },
    errorText: {
        fontSize: 12,
        marginTop: -8,
    },
    buttonRow: {
        marginTop: 4,
    },
});