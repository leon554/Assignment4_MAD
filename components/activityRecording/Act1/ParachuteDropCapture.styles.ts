import { Colors } from "@/theme/theme";
import { StyleSheet } from "react-native";

export const getStyles = (colors: Colors) =>
    StyleSheet.create({
        container: {
            width: "100%",
            gap: 12,
            alignItems: "center",
        },
        label: {
            fontSize: 16,
            fontWeight: "600",
            color: colors.textPrimary,
            textAlign: "center",
        },
        buttonRow: {
            width: "100%",
            gap: 10,
            alignItems: "center",
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
        skipBtn: {
            paddingVertical: 8,
        },
        btnText: {
            color: "#fff",
            fontWeight: "700",
            fontSize: 15,
        },
        secondaryBtnText: {
            color: colors.primary,
            fontWeight: "600",
            fontSize: 15,
        },
        skipBtnText: {
            color: colors.textSecondary,
            fontSize: 14,
        },
        timerBox: {
            alignItems: "center",
            gap: 14,
        },
        timerText: {
            fontSize: 52,
            fontWeight: "700",
            color: colors.primary,
            fontVariant: ["tabular-nums"],
        },
        timerHint: {
            color: colors.textSecondary,
            fontSize: 13,
        },
        stopBtn: {
            backgroundColor: "#e53935",
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 40,
        },
        reviewBox: {
            width: "100%",
            alignItems: "center",
            gap: 12,
        },
        videoTag: {
            backgroundColor: "#e8f5e9",
            borderRadius: 8,
            paddingHorizontal: 14,
            paddingVertical: 6,
        },
        videoTagText: {
            color: "#2e7d32",
            fontWeight: "600",
        },
        durationText: {
            fontSize: 18,
            fontWeight: "600",
            color: colors.textPrimary,
        },
    });
