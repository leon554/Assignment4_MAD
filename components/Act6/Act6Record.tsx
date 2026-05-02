
import { useUser } from '@/context/UserContext'
import { useAct6FSM } from '@/hooks/useAct6FSM'
import useColorPalette from '@/hooks/useColorPalette'
import { Colors } from '@/theme/theme'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Button from '../Button'
import DominantHandStep from './ReactionTimeStep'
import TracingStep from './TracingStep'

export default function Act6Record() {
    const colors = useColorPalette();
    const styles = getStyles(colors);

    const {teamMembers} = useUser()
    const {state, context, send} = useAct6FSM({
        state: "tracingAcc",
        context: {
            dominantHandTime: new Map<string, number>(),
            nonDominantHandTime: new Map<string, number>(),
            tracingAcc: new Map<string, number>(),
            teamMembers: [...teamMembers || []],
            currentTeamMember: teamMembers![0],
            currentMemberIndex: 1,
            message: "",
            prevState: "tracingAcc"
        }
    })

    return (
        <View style={styles.container}>
            {state == "dominantHandTestInstructions" && (
                <View style={styles.sectionView}>
                    <Text style={styles.titleText}>Instructions</Text>
                    <Text style={styles.subText}>
                        In this first part of the experiment you will test your reaction time.
                        Hold the phone with your dominant hand and click the rectangle as soon as it turns green
                    </Text>
                    <Button
                        label='Next'
                        onPress={() => send({name: "nextStep"})}
                        fullWidth={true}
                    />
                </View>
            )}
            {state == "NonDominantTestInstructions" && (
                <View style={styles.sectionView}>
                    <Text style={styles.titleText}>Instructions</Text>
                    <Text style={styles.subText}>
                        In the second part of this experiment you will test your reaction time with your non dominant hand.
                        Hold the phone with your non dominant hand and click the rectangle as soon as it turns green
                    </Text>
                    <Button
                        label='Next'
                        onPress={() => send({name: "nextStep"})}
                        fullWidth={true}
                    />
                </View>
            )}
            {(state == "dominantHandReactionTime" || state == "nonDominantHandReactionTime") && (
                <DominantHandStep
                    onRecord={(data: number) => send({name: "record", data})}
                    context={context}
                />
            )}
            {state == "tracingTestInstructions" && (
                <View style={styles.sectionView}>
                    <Text style={styles.titleText}>Instructions</Text>
                    <Text style={styles.subText}>
                        In the final part of this experiment we will test your tracing accuraccy.
                        Try and follow the moving cirle with your finger as closely as possible
                    </Text>
                    <Button
                        label='Next'
                        onPress={() => send({name: "nextStep"})}
                        fullWidth={true}
                    />
                </View>
            )}
            {state == "tracingAcc" && (
                <TracingStep
                    onRecord={acc => {send({name: "record", data: acc})}}
                />
            )}
            {state == "switchTeamMates" && (
                <View style={styles.sectionView}>
                    <Text style={styles.titleText}>Instructions</Text>
                    <Text style={styles.subText}>
                        Switch team mates. Give the phone to to {context.currentTeamMember.name}.
                    </Text>
                     <Button
                        label='Next'
                        onPress={() => send({name: "nextStep"})}
                        fullWidth={true}
                    />
                </View>
            )}
            {state == "done" && (
                <>
                <Text>done</Text>
                </>
            )}
        </View>
    )
}

const getStyles = (colors: Colors) => StyleSheet.create({
    container: {
    },
    sectionView:  {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        gap: 30,
        padding: 40,
        paddingTop: 70
    },
    titleText: {
        fontSize: 20, 
        fontWeight: 600
    },
    subText: {
        textAlign: "justify"
    }
});