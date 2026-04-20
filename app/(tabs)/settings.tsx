import Button from "@/components/Button";
import { useUser } from "@/context/UserContext";
import { auth } from "@/FirebaseConfig";
import useColorPalette from "@/hooks/useColorPalette";
import { leaveTeam } from "@/services/teamService";
import { Colors } from "@/theme/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Settings() {
    const colors = useColorPalette()
    const styles = getStyles(colors)
    const {member, team, refreshMember} = useUser()
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const leaveTeamFunc = async () => {
        if(!member?.teamId) {
            alert("You are allready not in a team")
            return
        }

        setLoading(true)
        const {success, message} = await leaveTeam(member!.uid, member!.teamId)

        if(success){
            await refreshMember()
            alert("Successfully left team")
        }else{
            alert(message)
        }
        setLoading(false)
    }

    const handleCreateTeam = () => {
        router.replace("/(onboarding)/teamformation")
    }

    const handleManageTeam = () => {
        router.replace("/(subscreens)/manageTeam")
    }

    return (
        <>
            <View style={{ height: 50 }} /> 
            <View style={styles.View}>
                <Text style={styles.Text}>Settings Page</Text>
                <View style={{ height: 20 }} /> 
                <Text style={styles.SubText}>Team Settings</Text>
                <Text style={styles.TextBox}>Team Name: {team ? team.teamName : "Not In Team"}</Text>
                <View style={styles.viewStyles}>
                    <Button
                        label="Leave Team"
                        onPress={() => leaveTeamFunc()}
                        loading={loading}
                        fullWidth={true}
                    />
                    <Button
                        label="Create Team"
                        onPress={() => handleCreateTeam()}
                        loading={loading}
                        fullWidth={true}
                    />
                    <Button
                        label="Manage Team"
                        onPress={() => handleManageTeam()}
                        loading={loading}
                        fullWidth={true}
                    />
                </View>
                <View style={{ height: 20 }} /> 
                <Text style={styles.SubText}>General Settings</Text>
                <Text style={styles.TextBox}>Member Code: {member?.memberCode}</Text>
                <Button
                    label="Sign Out"
                    onPress={() => auth.signOut()}
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