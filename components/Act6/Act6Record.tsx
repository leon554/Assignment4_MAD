
import { useUser } from '@/context/UserContext'
import { useAct6FSM } from '@/hooks/useAct6FSM'
import useColorPalette from '@/hooks/useColorPalette'
import { submitAttempt } from '@/services/activityAttemptService'
import { Colors } from '@/theme/theme'
import { Activity6Data } from '@/types/activityTypes'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Button from '../Button'
import TextInput from '../TextInput'
import DominantHandStep from './ReactionTimeStep'
import TracingStep from './TracingStep'

export default function Act6Record() {
    const colors = useColorPalette();
    const styles = getStyles(colors);
    const router = useRouter()

    const [rating, setRating] = useState("")
    const [comment, setComment] = useState("")
    const [resultString, setResultString] = useState("")
    const [score, setScore] = useState("")

    const [ratingHelperText, setRatingHelperText] = useState("")

    const [loading, setLoading] = useState(false)
    const {teamMembers, activityAttemptId} = useUser()

    const {state, context, send} = useAct6FSM({
        state: "dominantHandTestInstructions",
        context: {
            dominantHandTime: new Map<string, number>(),
            nonDominantHandTime: new Map<string, number>(),
            tracingAcc: new Map<string, number>(),
            teamMembers: [...teamMembers || []],
            currentTeamMember: teamMembers![0],
            currentMemberIndex: 1,
            message: "",
            prevState: "dominantHandTestInstructions"
        }
    })

    useEffect(() => {   
        if(state == "done"){
            setResultString(getResults())
            setScore(`${Math.round(getScore())}`)
        }
    }, [state])

    function getResults(){
        let output = ""

        for(const member of teamMembers!){
            const code = member.memberCode
            output += `${member.name}: 
        Dominant Hand Reaction Time: ${context.dominantHandTime.get(code)}ms, 
        Non Dominant Hand Reaction Time: ${context.nonDominantHandTime.get(code)}ms
        Tracing Accuracy: ${context.tracingAcc.get(code)}% \n`
        }

        return output
    }

   function getScore() {
        const ReactionTimesAVG =
            [...context.dominantHandTime.entries()].reduce((a, c) => {
            return a + c[1] + (context.nonDominantHandTime.get(c[0]) || 0);
            }, 0) / context.dominantHandTime.size;

        const tracingAccAVG =
            [...context.tracingAcc.values()].reduce((a, c) => a + c, 0) /
            context.tracingAcc.size;

        return 5000 - ReactionTimesAVG + tracingAccAVG * 3;
    }

    function isNumberBetweenOneAndFive(value: string): boolean {
        const num = Number(value);
        return Number.isInteger(num) && num >= 1 && num <= 5;
    }

    const handleSubmit = async () => {
        setLoading(true)

        if(!isNumberBetweenOneAndFive(rating)){
            setRatingHelperText("Enter only a number between 0 and 5")
            setLoading(false)
            return
        }
        
        const accData: Activity6Data = {
            memberData: teamMembers!.map(t => ({
                MemberCode: t.memberCode,
                DMRT: context.dominantHandTime.get(t.memberCode)!,
                NDMRT: context.nonDominantHandTime.get(t.memberCode)!,
                TRACC: context.tracingAcc.get(t.memberCode)!
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
                        Try and follow the moving circle with your finger as closely as possible. 
                        Note the test will begin once you start tracing the circle
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
                    onComplete={acc => send({name: "record", data: acc})}
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
                    <Text style={styles.titleText}>Score: {score}</Text>
                    <Text style={styles.subText}>
                        {resultString}
                    </Text>
                    <View style={{width: "100%", display: "flex", gap: 25}}>
                        <TextInput  
                            label='Comment'
                            value={comment}
                            onChangeText={setComment}
                        />
                        <TextInput  
                            label='Rating (0-5)'
                            value={rating}
                            onChangeText={(t) => {setRating(t); setRatingHelperText("")}}
                            variant={ratingHelperText ? 'error' : 'default'}
                            helperText={ratingHelperText}
                        />
                    </View>
                    <Button
                        label='Save'
                        onPress={() => handleSubmit()}
                        fullWidth={true}
                        loading={loading}
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