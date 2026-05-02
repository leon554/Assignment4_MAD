import { ACTIVITY_DATA } from '@/activityData/activityData';
import Act7Record from '@/components/Act7/Act7Record';
import Frame from '@/components/Frame';
import { Colors } from '@/theme/theme';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Act6Record from '../../components/Act6/Act6Record';

export default function ActivityRecord() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const activity = ACTIVITY_DATA[id]

    function renderAct(){
        switch (id) {
            case "1":
                return
            case "2":
                return
            case "3":
                return
            case "4":
                return
            case "5":
                return
            case "6":
                return(
                    <Act6Record/>
                )
            case "7": 
                return(
                    <Act7Record/>
                )
        }
    }

    return (
         <Frame title={activity.title} prevPagePath={`/activity/${activity.id}`}>
            <View>
                {renderAct()}
            </View>
         </Frame>
    )
}

const getStyles = (colors: Colors) => StyleSheet.create({
   
});