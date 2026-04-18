import Button from "@/components/Button";
import { useUser } from "@/context/UserContext";
import { auth } from "@/FirebaseConfig";
import useColorPalette from "@/hooks/useColorPalette";
import { leaveTeam } from "@/services/teamService";
import { Colors } from "@/theme/theme";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Settings() {
    const colors = useColorPalette()
    const styles = getStyles(colors)
    const {member, team, refreshMember} = useUser()
    const [loading, setLoading] = useState(false)

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

    return (
        <>
            <View style={styles.View}>
                <Text style={styles.Text}>Settings Page</Text>
                <Text style={styles.SubText}>Member Code: {member?.memberCode}</Text>
                <Text style={styles.SubText}>Team Name: {team ? team.teamName : "Not In Team"}</Text>
                <Button
                    label="Sign Out"
                    onPress={() => auth.signOut()}
                />
                <Button
                    label="Leave Team"
                    onPress={() => leaveTeamFunc()}
                    loading={loading}
                />
            </View>
        </>
    );
}

 const getStyles = (colors: Colors) => StyleSheet.create({
    View: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        backgroundColor: colors.background
    },
    Text: {
        color: colors.textOnPrimary,
        padding: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: colors.primary,
        fontSize: 20
    },
    SubText: {
        color: colors.textPrimary,
        padding: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 2,
        fontSize: 16
    },
})