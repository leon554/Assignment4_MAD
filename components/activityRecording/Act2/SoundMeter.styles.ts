import { Colors } from "@/theme/theme";
import { StyleSheet } from "react-native";

export const getStyles = (colors: Colors) =>
    StyleSheet.create({
        container: {
            width: "100%",
            alignItems: "center",
            gap: 14,
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
        actionTitle: {
            fontSize: 20,
            fontWeight: "700",
            color: colors.textPrimary,
            textAlign: "center",
        },
        hint: {
            fontSize: 13,
            color: colors.textSecondary,
            textAlign: "center",
        },
        buttonCol: {
            width: "100%",
            gap: 10,
            alignItems: "center",
        },
        locationInput: {
            width: "80%",
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
        secondaryBtn: {
            borderColor: colors.primary,
            borderWidth: 1.5,
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 28,
            alignItems: "center",
            width: "80%",
        },
        skipBtn: { paddingVertical: 6 },
        btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
        secondaryBtnText: { color: colors.primary, fontWeight: "600", fontSize: 15 },
        skipBtnText: { color: colors.textSecondary, fontSize: 14 },
        meterBox: {
            width: "100%",
            alignItems: "center",
            gap: 10,
        },
        countdownText: {
            fontSize: 36,
            fontWeight: "700",
            color: colors.primary,
            fontVariant: ["tabular-nums"],
        },
        dbDisplay: {
            fontSize: 48,
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
        reviewBox: {
            width: "100%",
            alignItems: "center",
            gap: 14,
        },
        resultTitle: {
            fontSize: 17,
            fontWeight: "700",
            color: colors.textPrimary,
        },
        statsRow: {
            flexDirection: "row",
            gap: 40,
            justifyContent: "center",
        },
        buttonRow: {
            width: "100%",
            gap: 10,
            alignItems: "center",
        },
    });
