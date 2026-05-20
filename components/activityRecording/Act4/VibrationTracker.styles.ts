import { Colors } from "@/theme/theme";
import { StyleSheet } from "react-native";

export const getStyles = (colors: Colors) =>
    StyleSheet.create({
        container: {
            width: "100%",
            alignItems: "center",
            gap: 16,
        },
        progressPill: {
            backgroundColor: colors.primary + "22",
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 4,
        },
        progressText: {
            color: colors.primary,
            fontWeight: "600",
            fontSize: 13,
        },
        sectionBox: {
            width: "100%",
            alignItems: "center",
            gap: 12,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: "700",
            color: colors.textPrimary,
            textAlign: "center",
        },
        hint: {
            fontSize: 13,
            color: colors.textSecondary,
            textAlign: "center",
        },
        descInput: {
            width: "90%",
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            padding: 12,
            fontSize: 14,
            color: colors.textPrimary,
        },
        primaryBtn: {
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 28,
            alignItems: "center",
            width: "80%",
        },
        btnDisabled: {
            opacity: 0.45,
        },
        finishBtn: {
            paddingVertical: 8,
        },
        finishBtnText: {
            color: colors.textSecondary,
            fontSize: 14,
        },
        btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
        testingBox: {
            width: "100%",
            alignItems: "center",
            gap: 10,
        },
        countdownText: {
            fontSize: 40,
            fontWeight: "700",
            color: colors.primary,
            fontVariant: ["tabular-nums"],
        },
        magDisplay: {
            fontSize: 46,
            fontWeight: "800",
            color: colors.textPrimary,
            fontVariant: ["tabular-nums"],
        },
        barTrack: {
            width: "80%",
            height: 18,
            backgroundColor: colors.border,
            borderRadius: 9,
            overflow: "hidden",
        },
        barFill: {
            height: "100%",
            borderRadius: 9,
        },
        peakLabel: {
            color: "#f44336",
            fontWeight: "600",
            fontSize: 14,
        },
        shakeHint: {
            color: colors.textSecondary,
            fontSize: 13,
            textAlign: "center",
        },
        resultBox: {
            width: "100%",
            alignItems: "center",
            gap: 14,
        },
        statsGrid: {
            flexDirection: "row",
            justifyContent: "space-around",
            width: "100%",
        },
        scoreHint: {
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: "center",
        },
    });
