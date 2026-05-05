import { getDefaultInitialStateAct5 } from '@/activityData/FSM/activity5FSM'
import { useUser } from '@/context/UserContext'
import { useAct5FSM } from '@/hooks/useAct5FSM'
import useColorPalette from '@/hooks/useColorPalette'
import { submitAttempt } from '@/services/activityAttemptService'
import { Colors } from '@/theme/theme'
import { Activity5Data } from '@/types/activityTypes'
import { roundToTwo } from '@/util/util'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import ActRatingComment from '../ActRatingComment'
import Button from '../Button'
import StretchTracker from './StretchTracker'

export default function Act5Record() {
    const colors = useColorPalette();
    const styles = getStyles(colors);
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [score, setScore] = useState(0)
    const [resultText, setResultText] = useState("")

    const {teamMembers, activityAttemptId} = useUser()
    const {state, context, send} = useAct5FSM(getDefaultInitialStateAct5(teamMembers))

    useEffect(() => {
        if(state != "done") return
        setScore(calculateScore())
        setResultText(getDataToDisplay())
    }, [state])

    const getDataToDisplay = () => {
        let text = ""

        for(const member of teamMembers!){
            const code = member.memberCode
            const data = context.memberData.get(code)!
            text += `${member.name}: 
            Avg Jerk: ${roundToTwo(data.avgJerk)} \n
            Max Jerk: ${roundToTwo(data.maxJerk)}\n
            Avg Speed: ${roundToTwo(data.avgSpeed)}\n
            Range: ${roundToTwo(data.range)}\n`
        }
        return text
    }

    const calculateScore = () => {
        let score = 4000
        score -= [...context.memberData.values()].reduce((a, c) => a += c.avgJerk + c.maxJerk, 0) * 10
        score += [...context.memberData.values()].reduce((a, c) => a += c.avgSpeed + c.range, 0) * 10
        return Math.round(score)
    }

    const handleSubmit = async (comment: string, rating: number) => {
        setLoading(true)
                
        const accData: Activity5Data = {
            memberData: teamMembers!.map(t => ({
                MemberCode: t.memberCode,
                ...context.memberData.get(t.memberCode)!,
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
            {state == "start" && (
                <View style={styles.sectionView}>
                    <Text style={styles.titleText}>Instructions</Text>
                    <Text style={styles.subText}>
                       {context.currentTeamMember.name} will go first!
                    </Text>
                    <Button
                        label='Next'
                        onPress={() => send({name: "nextStep"})}
                        fullWidth={true}
                    />
                </View>
            )}
            {(state == "movementRecord") && (
                <StretchTracker 
                    onComplete={(data) => send({name: "record", data})}
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