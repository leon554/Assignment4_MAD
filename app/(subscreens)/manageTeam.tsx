import Button from "@/components/Button";
import { useUser } from "@/context/UserContext";
import useColorPalette from "@/hooks/useColorPalette";
import { Colors } from "@/theme/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

export default function manageTeam() {
    const colors = useColorPalette()
    const styles = getStyles(colors)
    const [loading, setLaoding] = useState(false)
    const router = useRouter()

    const {team} = useUser()

    const handleBack = () => {
        router.replace("/(tabs)/settings")
    }

    return (
        <>
            <View style={{ height: 50 }} /> 
            <View style={styles.View}>
                <Text style={styles.Text}>Manage Team Page</Text>
                <View style={{ height: 20 }} /> 
                <Text style={styles.SubText}>Team Members</Text>
                <View style={{maxHeight: 100, height: (team?.memberIds.length ?? 0) * 50, width: "100%"}}>
                    <FlatList
                        data={team?.memberIds}
                        style={{width: "100%"}}
                        keyExtractor={(item) => item}
                        contentContainerStyle={{ 
                            display: "flex",
                            width: "100%",
                            gap: 10
                        }}
                        renderItem={({ item }) => (
                            <Text style={styles.TextBox}>{item}</Text>
                        )}
                    />
                </View>
                <View style={{ height: 20 }} /> 
                <Text style={styles.SubText}>Add Member</Text>

                <View style={styles.viewStyles}>
                    <Button
                        label="Add"
                        onPress={() => {}}
                        loading={loading}
                        fullWidth={true}
                    />
                </View>
            </View>
            <View style={{padding: 30}}>
                <Button
                    label="Back"
                    variant="secondary"
                    onPress={() => handleBack()}
                    loading={loading}
                    fullWidth={true}
                />
            </View>
        </>
    );
}

 const getStyles = (colors: Colors) => StyleSheet.create({
    View: {
        flex: 1,
        alignItems: "center",
        gap: 10,
        backgroundColor: colors.background,
        padding: 30
    },
    Text: {
        color: colors.textPrimary,
        fontWeight: 600,
        fontSize: 24,
    },
    SubText: {
        color: colors.textPrimary,
        fontWeight: 600,
        fontSize: 18,
        width: "100%"
    },
    TextBox: {
        color: colors.textPrimary,
        padding: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 2,
        fontSize: 16,
        width: "100%"
    },
    viewStyles: {
        display: "flex",
        gap: 10,
        width: "100%",
    }
})