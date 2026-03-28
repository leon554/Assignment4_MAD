import useColorPalette from "@/hooks/useColorPalette";
import { Colors } from "@/theme/theme";
import { StyleSheet, Text, View } from "react-native";

export default function History() {
    const colors = useColorPalette()
    const styles = getStyles(colors)

    return (
        <View style={styles.View}>
            <Text style={styles.Text}>History Page</Text>
        </View>
    );
}

 const getStyles = (colors: Colors) => StyleSheet.create({
    View: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background
    },
    Text: {
        color: colors.textOnPrimary,
        padding: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: colors.primary,
        fontSize: 20
    }
})