
import { Act6Context } from '@/activityData/Act6/activity6FSM'
import useColorPalette from '@/hooks/useColorPalette'
import { Colors } from '@/theme/theme'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import ReactionTimeTest from './ReactionTimeTest'

interface Props {
    onRecord: (data: number) => void
    context: Act6Context
}

export default function ReactionTimeStep({onRecord, context} : Props) {
    const colors = useColorPalette();
    const styles = getStyles(colors);
    
    return (
        <View style={styles.mainView}>
            <Text style={styles.title}>
                {context.currentTeamMember.name}'s Turn
            </Text>
            <ReactionTimeTest handleSubmit={onRecord}/>
        </View>
    )
}

const getStyles = (colors: Colors) => StyleSheet.create({
    mainView: {
        display: "flex", 
        alignItems: "center",
        padding: 20,
        gap: 20
    },
    title: {
        color: colors.textOnPrimary,
        fontSize: 20,
        backgroundColor: colors.primary,
        padding: 10,
        borderRadius: 10
    }
});