import { Dropdown } from '@/components/DropDown';
import { useUser } from '@/context/UserContext';
import useColorPalette from '@/hooks/useColorPalette';
import { createTeam } from '@/services/teamService';
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
    const [members, setMembers] = useState<string[]>([]);
    const [grade, setGrade] = useState('');
    const [gradeOpen, setGradeOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // errors
    const [teamNameError, setTeamNameError] = useState('');
    const [memberErrors, setMemberErrors] = useState<string[]>([]);
    const [gradeError, setGradeError] = useState('');

    const {member, refreshMember} = useUser()

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
                newMemberErrors[i] = 'Please enter a member code';
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

    const handleContinue = async () => {
        if (!validate()) return;
        setLoading(true); 

        const {success, message} = await createTeam({
            teamName,
            gradeLevel: Number(grade.split(" ")[1]),
            memberIds: [member!.memberCode, ...members]
        })

        await refreshMember()
        
        if(!success){
            alert(message)
        }else{
            router.push('/(tabs)');
        }
        setLoading(false);
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
                        Team Member Codes
                    </Text>

                    {members.map((member, index) => (
                        <TextInput
                            key={index}
                            placeholder={`Member ${index + 1} Code`}
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
                    
                    <Dropdown
                        options={GRADES}
                        selected={grade}
                        onSelect={setGrade}
                    />
                    
                    {gradeError ? (
                        <Text style={[styles.errorText, { color: colors.destructive }]}>
                            {gradeError}
                        </Text>
                    ) : null}

                   

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