import useColorPalette from '@/hooks/useColorPalette';
import { Colors } from '@/theme/theme';
import { RelativePathString, useRouter } from 'expo-router';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
    title: string
    prevPagePath: string
    children: ReactNode
}

export default function Frame({ title, prevPagePath, children}: Props) {
    const colors = useColorPalette();
    const styles = getStyles(colors);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    onPress={() => router.push(prevPagePath as RelativePathString)}
                    style={styles.backButton}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Text style={[styles.backText, { color: colors.primary }]}>‹ Back</Text>
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{title}</Text>
                </View>
            </View>
            {children}
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
});