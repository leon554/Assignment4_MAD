import { Colors } from '@/theme/theme';
import { Act7SessionResult } from '@/types/activityTypes';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getBpmColor } from './Act7UtilFunctions';

export function ResultScreen({result, colors, onReset,}: {
    result: Act7SessionResult;
    colors: Colors;
    onReset: () => void;
}) {
    const styles = getStyles(colors);
    const color = getBpmColor(result.avgBpm, colors);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.titleText}>Results</Text>
            <View style={styles.sectionView}>
                <Text style={styles.subTitle}>Average breathing rate</Text>
                <Text style={[styles.bpmValue, { color }]}>{result.avgBpm}</Text>
                <Text style={styles.subText}>breaths / min</Text>
            </View>
            <Pressable style={styles.buttonPrimary} onPress={onReset}>
                <Text style={styles.buttonPrimaryText}>
                    Continue
                </Text>
            </Pressable>
        </ScrollView>
    );
}

const getStyles = (colors: Colors) => StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        padding: 24,
        paddingTop: 60,
        gap: 20,
        paddingBottom: 150,
    },
    titleText: {
        fontSize: 26,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    subTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    subText: {
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: "justify",
    },
    sectionView: {
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        gap: 8,
        padding: 24,
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    bpmValue: {
        fontSize: 72,
        fontWeight: "800",
        lineHeight: 80,
    },
    buttonPrimary: {
        width: "100%",
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
    },
    buttonPrimaryText: {
        color: colors.textOnPrimary,
        fontSize: 16,
        fontWeight: "700",
    },
});