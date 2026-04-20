import { auth } from '@/FirebaseConfig';
import useColorPalette from '@/hooks/useColorPalette';
import { Colors } from '@/theme/theme';
import { signInWithEmailAndPassword } from '@firebase/auth';
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

export default function Login() {
    const router = useRouter();
    const colors = useColorPalette();
    const styles = getStyles(colors);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = (): boolean => {
        let valid = true;
        setEmailError('');
        setPasswordError('');
        if (!email.includes('@')) {
            setEmailError('Please enter a valid email address');
            valid = false;
        }
        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            valid = false;
        }
        return valid;
    };
// simulating a login delay, when real authentication added later this will be replaced with API call
    const handleLogin = async () => {
        if (!validate()) return;
        setLoading(true);
         
        try {
            await signInWithEmailAndPassword(auth, email, password)
            router.replace('/(onboarding)/teamformation')
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
                {/* Header */}
                <View style={styles.header}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight + '33' }]}>
                        <Text style={styles.iconText}>⚗</Text>
                    </View>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome back</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Sign in to your STEMM Lab account
                    </Text>
                </View>

                {/* Form Card */}
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>

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

                    <TouchableOpacity
                        style={styles.forgotRow}
                        // placeholder for forgot password functionality, will be implemented in future iteration
                        onPress={() => {}}
                        accessibilityRole="button"
                    >
                        <Text style={[styles.forgotText, { color: colors.primary }]}>
                            Forgot password?
                        </Text>
                    </TouchableOpacity>

                    <Button
                        label="Login"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={loading}
                        onPress={handleLogin}
                        colors={colors}
                    />

                    <View style={styles.dividerRow}>
                        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                        <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
                        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                    </View>

                    <TouchableOpacity
                        style={styles.switchRow}
                        onPress={() => router.push('/signup')}
                        accessibilityRole="button"
                    >
                        <Text style={[styles.switchText, { color: colors.textSecondary }]}>
                            Don't have an account?{' '}
                        </Text>
                        <Text style={[styles.switchLink, { color: colors.primary }]}>Sign Up</Text>
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
    forgotRow: {
        alignSelf: 'flex-end',
        marginTop: -8,
    },
    forgotText: {
        fontSize: 13,
        fontWeight: '500',
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