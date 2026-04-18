import { auth } from '@/FirebaseConfig';
import useColorPalette from '@/hooks/useColorPalette';
import { createTeamMember } from '@/services/teamMemberService';
import { Colors } from '@/theme/theme';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
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

export default function Signup() {
    const router = useRouter();
    const colors = useColorPalette();
    const styles = getStyles(colors);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = (): boolean => {
        let valid = true;
        setNameError('');
        setEmailError('');
        setPasswordError('');
        if (name.trim().length < 2) {
            setNameError('Please enter your full name');
            valid = false;
        }
        if (!email.includes('@')) {
            setEmailError('Please enter a valid email address');
            valid = false;
        }
        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            valid = false;
        }
        if (password !== confirmPassword) {
            setPasswordError('Passwords do not match');
            valid = false;
        }
        return valid;
    };

    const handleSignup = async () => {
        if (!validate()) return;
        setLoading(true);
       
        try {
            const user = await createUserWithEmailAndPassword(auth, email, password)
            const uid = user.user.uid
            const [success, error] = await createTeamMember({uid, name, teamId: ""})
            if(!success) throw new Error(error)

        } catch (error) {
            alert(error)
        }

        setLoading(false);
    };

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
                <View style={styles.header}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight + '33' }]}>
                        <Text style={styles.iconText}>⚗</Text>
                    </View>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Create account</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Join STEMM Lab and get started
                    </Text>
                </View>

                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>

                    <TextInput
                        label="Full Name"
                        placeholder="Enter your full name"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        variant={nameError ? 'error' : 'default'}
                        helperText={nameError}
                        colors={colors}
                    />

                    <TextInput
                        label="Email"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        variant={emailError ? 'error' : 'default'}
                        helperText={emailError}
                        colors={colors}
                    />

                    <TextInput
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        variant={passwordError ? 'error' : 'default'}
                        helperText={passwordError}
                        colors={colors}
                    />

                    <TextInput
                        label="Confirm Password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        colors={colors}
                    />

                    <Button
                        label="Create Account"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={loading}
                        onPress={handleSignup}
                        colors={colors}
                    />

                    <View style={styles.dividerRow}>
                        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                        <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
                        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                    </View>

                    <TouchableOpacity
                        style={styles.switchRow}
                        onPress={() => router.push('/login')}
                        accessibilityRole="button"
                    >
                        <Text style={[styles.switchText, { color: colors.textSecondary }]}>
                            Already have an account?{' '}
                        </Text>
                        <Text style={[styles.switchLink, { color: colors.primary }]}>Login</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

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
        fontSize: 26,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 20,
        gap: 16,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontSize: 13,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    switchText: {
        fontSize: 14,
    },
    switchLink: {
        fontSize: 14,
        fontWeight: '600',
    },
});