
import { useUser } from '@/context/UserContext'
import { useAct6FSM } from '@/hooks/useAct6FSM'
import React from 'react'
import { Text, View } from 'react-native'
import Button from '../Button'
import DominantHandStep from './ReactionTimeStep'

export default function Act6Record() {
    const {teamMembers} = useUser()
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
            prevState: "NonDominantTestInstructions"
        }
    })

    return (
        <View>
            {state == "dominantHandTestInstructions" && (
                <>
                    <Text>dominant hand instructions</Text>
                    <Button
                        label='Next'
                        onPress={() => send({name: "nextStep"})}
                    />
                </>
            )}
            {state == "NonDominantTestInstructions" && (
                <>
                <Text>non dominant hand instructions</Text>
                <Button
                    label='Next'
                    onPress={() => send({name: "nextStep"})}
                />
                </>
            )}
            {(state == "dominantHandReactionTime" || state == "nonDominantHandReactionTime") && (
                <DominantHandStep
                    onRecord={(data: number) => send({name: "record", data})}
                    context={context}
                />
            )}
            {state == "tracingTestInstructions" && (
                <>
                    <Text>tracing test instructions</Text>
                    <Button
                        label='Next'
                        onPress={() => send({name: "nextStep"})}
                    />
                </>
            )}
            {state == "tracingAcc" && (
                <>
                <Text>tracing</Text>
                </>
            )}
            {state == "switchTeamMates" && (
                <>
                    <Text>Switch Team mates to {context.currentTeamMember.name}</Text>
                     <Button
                        label='Next'
                        onPress={() => send({name: "nextStep"})}
                    />
                </>
            )}
            {state == "done" && (
                <>
                <Text>done</Text>
                </>
            )}
        </View>
    )
}