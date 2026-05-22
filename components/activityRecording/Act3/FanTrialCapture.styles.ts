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
        headerRow: {
            flexDirection: "row",
            gap: 10,
            justifyContent: "center",
        },
        tag: {
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 4,
        },
        tagText: {
            fontSize: 13,
            fontWeight: "600",
        },
        instruction: {
            fontSize: 14,
            color: colors.textSecondary,
            textAlign: "center",
        },
        buttonCol: {
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
        skipBtn: { paddingVertical: 8 },
        btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
        secondaryBtnText: { color: colors.primary, fontWeight: "600", fontSize: 15 },
        skipBtnText: { color: colors.textSecondary, fontSize: 14 },
        reviewBox: {
            width: "100%",
            alignItems: "center",
            gap: 12,
        },
        preview: {
            width: "80%",
            height: 180,
            borderRadius: 12,
        },
        notesInput: {
            width: "80%",
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            padding: 12,
            fontSize: 14,
            color: colors.textPrimary,
        },
        buttonRow: {
            width: "100%",
            gap: 10,
            alignItems: "center",
        },
    });
