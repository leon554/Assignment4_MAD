
import { getDefaultInitialStateAct7 } from '@/activityData/FSM/activity7FSM';
import { useUser } from '@/context/UserContext';
import { useAct7FSM } from '@/hooks/useAct7FSM';
import useColorPalette from '@/hooks/useColorPalette';
import { submitAttempt } from '@/services/activityAttemptService';
import { Colors } from '@/theme/theme';
import { Activity7Data } from '@/types/activityTypes';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ActRatingComment from '../ActRatingComment';
import Button from '../Button';
import BreathingTracker from './BreathingTracker';

export default function Act7Record() {
    const colors = useColorPalette();
    const styles = getStyles(colors);
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [score, setScore] = useState(0)
    const [resultText, setResultText] = useState("")

    const {teamMembers, activityAttemptId} = useUser()
    const {state, context, send} = useAct7FSM(getDefaultInitialStateAct7(teamMembers))

    useEffect(() => {
        if(state != "done") return
        setScore(calculateScore())
        setResultText(getDataToDisplay())
    }, [state])

    const getDataToDisplay = () => {
        let data = ""

        for(const member of teamMembers!){
            const code = member.memberCode

            data += `${member.name}: 
            Breathing at rest: ${context.restBreathing.get(code)} \n
            Breathing after activity: ${context.activityBreathing.get(code)}\n`
        }
        return data
    }

    const calculateScore = () => {
        return 4000 - ([...context.activityBreathing.values()].reduce((a, c) => a+c) 
        - [...context.restBreathing.values()].reduce((a, c) => a+c))
    }

    const handleSubmit = async (comment: string, rating: number) => {
        setLoading(true)
                
        const accData: Activity7Data = {
            memberData: teamMembers!.map(t => ({
                MemberCode: t.memberCode,
                restBPM: context.restBreathing.get(t.memberCode)!,
                activityBPM: context.activityBreathing.get(t.memberCode)!,
            }))
        }

        const res = await submitAttempt(activityAttemptId, {
            data: accData,
            rating: Number(rating),
            score: Number(score),
            comment: comment
        })

        if(!res.success){
            alert(res.message)
            setLoading(false)
            return
        }

        alert("successfully saved!")
        router.replace("/(tabs)")
        setLoading(false)
    }
    
    return (
        <View style={styles.container}>
            {state == "restInstructions" && (
                <View style={styles.sectionView}>
                    <Text style={styles.titleText}>Instructions</Text>
                    <Text style={styles.subText}>
                        In this first part of the experiment you will messure your breaths per minute
                        at rest. To do this lay flat on your back with the phone flat on your chest with
                        the screen pointing up. 
                    </Text>
                    <Text style={styles.subText}>
                        Start with the team member: {context.currentTeamMember.name}
                    </Text>
                    <Button
                        label='Next'
                        onPress={() => send({name: "nextStep"})}
                        fullWidth={true}
                    />
                </View>
            )}
            {state == "activityInstructions" && (
                <View style={styles.sectionView}>
                    <Text style={styles.titleText}>Instructions</Text>
                    <Text style={styles.subText}>
                        In the second part of this experiment we will do the same
                        but before messuring do 100 start jumps then imediatly after lay down 
                        and record your breaths per minute
                    </Text>
                    <Text style={styles.subText}>
                        Start with the team member: {context.currentTeamMember.name}
                    </Text>
                    <Button
                        label='Next'
                        onPress={() => send({name: "nextStep"})}
                        fullWidth={true}
                    />
                </View>
            )}
            {(state == "restBreathingRecord" || state == "activityBreathingRecord") && (
                <BreathingTracker onComplete={(bpm) => {send({name: "record", data: bpm})}}/>
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
                <View style={styles.sectionView}>
                    <Text style={styles.titleText}>Results</Text>
                    <Text style={styles.subTitle}>Score: {score}</Text>
                   <Text style={styles.subText}>
                       {resultText}
                    </Text>
                    <ActRatingComment
                        loading={loading}
                        handleSubmit={handleSubmit}
                    />
                </View>
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
    subSectionView:  {
        display: "flex",
        justifyContent: "center",
        width: "100%",
        gap: 10,
    },
    titleText: {
        fontSize: 20, 
        fontWeight: 600
    },
    subTitle: {
        fontSize: 17, 
        fontWeight: 500
    },
    subText: {
        textAlign: "justify",
        color: colors.textSecondary
    }
});