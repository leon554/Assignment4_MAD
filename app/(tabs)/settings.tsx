import Button from "@/components/Button";
import Section from "@/components/SectionCard";
import { useUser } from "@/context/UserContext";
import { auth } from "@/FirebaseConfig";
import useColorPalette from "@/hooks/useColorPalette";
import { leaveTeam } from "@/services/teamService";
import { Colors } from "@/theme/theme";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Settings() {
    const colors = useColorPalette()
    const styles = getStyles(colors)
    const insets = useSafeAreaInsets();

    const {member, team, refreshMember} = useUser()
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const loadingID = useRef(0)

    const leaveTeamFunc = async () => {
        if(!member?.teamId) {
            alert("You are allready not in a team")
            return
        }

        setLoading(true)
        const {success, message} = await leaveTeam(member!.memberCode, member!.teamId)

        if(success){
            await refreshMember()
            alert("Successfully left team")
        }else{
            alert(message)
        }
        setLoading(false)
    }

    const handleCreateTeam = () => {
        if(member?.teamId){
            alert("You are allready in a team leave your team first to create a new team");
            return
        }
        router.replace("/(onboarding)/teamformation")
    }

    const handleManageTeam = () => {
        router.replace("/(subscreens)/manageTeam")
    }

    return (
        <>
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
            </View>
            <View style={styles.View}>
                <Section
                    title="Team Settings"
                >
                    <Text style={styles.TextBox}>Team Name: {team ? team.teamName : "Not In Team"}</Text>
                    <View style={styles.viewStyles}>
                        <Button
                            label="Leave Team"
                            onPress={() => {leaveTeamFunc(); loadingID.current = 1}}
                            loading={loadingID.current == 1 ? loading : false}
                            fullWidth={true}
                        />
                        <Button
                            label="Create Team"
                            onPress={() => {handleCreateTeam(); loadingID.current = 2}}
                            loading={loadingID.current == 2 ? loading : false}
                            fullWidth={true}
                        />
                        <Button
                            label="Manage Team"
                            onPress={() => {handleManageTeam(); loadingID.current = 3}}
                            loading={loadingID.current == 3 ? loading : false}
                            fullWidth={true}
                        />
                    </View>
                </Section>
                <View style={{ height: 20 }} /> 
                <Section
                    title="General Settings"
                >
                    <View style={styles.viewStyles}>
                        <Text style={styles.TextBox}>Member Code: {member?.memberCode}</Text>
                        <Button
                            label="Sign Out"
                            onPress={() => auth.signOut()}
                            fullWidth={true}
                        />
                    </View>
                </Section>
            </View>
        </>
    );
}

 const getStyles = (colors: Colors) => StyleSheet.create({
    header: {
        paddingHorizontal: 24,
        paddingBottom: 12,
        gap: 4,
        backgroundColor: colors.background
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    View: {
        gap: 10,
        padding: 30,
        height: "100%",
        backgroundColor: colors.background
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
        borderColor: colors.border,
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
        backgroundColor: colors.background,
    }
})