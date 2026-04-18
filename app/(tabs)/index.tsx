import { Dropdown } from "@/components/DropDown";
import useColorPalette from "@/hooks/useColorPalette";
import { Colors } from "@/theme/theme";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
    const dropdowdOptions = ["test1", "test2", "test3", "test4"]
    const [selected, setSelected] = useState("")

    const colors = useColorPalette()
    const styles = getStyles(colors)

    return (
        <View style={styles.View}>
            <Text style={styles.Text}>Home Screen</Text>
            <Dropdown 
                options={dropdowdOptions} 
                selected={selected} 
                onSelect={setSelected}
                showSearch={true}
            />
        </View>
    );
}

const getStyles = (colors: Colors) => StyleSheet.create({
    View: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
        gap: 50
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