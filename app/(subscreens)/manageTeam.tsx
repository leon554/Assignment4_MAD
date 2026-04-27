import Button from "@/components/Button";
import InputModal from "@/components/InputModal";
import { useUser } from "@/context/UserContext";
import useColorPalette from "@/hooks/useColorPalette";
import { addMemberToTeam, leaveTeam } from "@/services/teamService";
import { Colors } from "@/theme/theme";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function manageTeam() {
    const colors = useColorPalette()
    const styles = getStyles(colors)
    const [loading, setLaoding] = useState(false)
    const router = useRouter()
    const insets = useSafeAreaInsets();
    const [modalVisible, setModalVisible] = useState(false);
    const {team, refreshMember} = useUser()
    const LoadingID = useRef("");

    const addMember = async (code: string) => {
        setLaoding(true)

        if(!team){
            alert("Create or join a team first before adding members")
            setLaoding(false)
            return;
        }
        const {success, message} = await addMemberToTeam(code, team!.teamId)

        if(!success){
            alert(message)
        }else{
            await refreshMember()
        }

        setLaoding(false);
    }

    const removeMember = async (code: string) => {
        setLaoding(true)

        const {success, message} = await leaveTeam(code, team!.teamId)

        if(!success){
            alert(message)
        }else{
            await refreshMember()
        }

        setLaoding(false);
    }

    return (
        <>
            <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/settings')}
                    style={styles.backButton}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Text style={[styles.backText, { color: colors.primary }]}>‹ Back</Text>
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                        Manage Team Page
                    </Text>
                </View>
            </View>
            <View style={styles.View}>
                <Text style={styles.SubText}>Team Members</Text>
                <View style={{ width: "100%"}}>
                    <FlatList
                        data={team?.memberCodes}
                        style={{width: "100%"}}
                        extraData={team?.memberCodes}
                        keyExtractor={(item) => item}
                        contentContainerStyle={{ 
                            display: "flex",
                            width: "100%",
                            gap: 10
                        }}
                        renderItem={({ item }) => (
                            <View style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: 10
                            }}>
                                <Text style={styles.TextBox}>{item}</Text>
                                <Button
                                    label="X"
                                    size="sm"
                                    onPress={() => {removeMember(item); LoadingID.current = item}}
                                    loading={LoadingID.current == item ? loading : false}
                                />
                            </View>
                        )}
                    />
                </View>
                <View style={{ height: 20 }} /> 
                <Text style={styles.SubText}>Add Member</Text>

                <View style={styles.viewStyles}>
                    <Button
                        label="Add"
                        onPress={() => {setModalVisible(!modalVisible); LoadingID.current = "add"}}
                        loading={LoadingID.current == "add" ? loading : false}
                        fullWidth={true}
                    />
                </View>
            </View>

            <InputModal
                visible={modalVisible}
                title="Enter Team Code"
                placeholder="e.g. ABC123"
                confirmLabel="Add"
                onConfirm={(code) => {
                    setModalVisible(false);
                    addMember(code);
                }}
                onCancel={() => setModalVisible(false)}
            />
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
        flex: 1
    },
    viewStyles: {
        display: "flex",
        gap: 10,
        width: "100%",
    },
     container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        gap: 8,
    },
    backButton: {
        alignSelf: 'flex-start',
    },
    backText: {
        fontSize: 17,
        fontWeight: '500',
    },
    headerContent: {
        gap: 6,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    disciplineTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 6,
    },
    disciplineText: {
        fontSize: 12,
        fontWeight: '600',
    },
    scroll: {
        padding: 20,
        gap: 16,
    },
    section: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 16,
        gap: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    bodyText: {
        fontSize: 14,
        lineHeight: 20,
    },
    listRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'flex-start',
    },
    bullet: {
        fontSize: 16,
        lineHeight: 20,
    },
    stepBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: 1,
    },
    stepNumber: {
        fontSize: 12,
        fontWeight: '700',
    },
    startButton: {
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    startButtonText: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
})