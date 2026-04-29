import { ACTIVITY_DATA } from '@/activityData/activityData';
import Frame from '@/components/Frame';
import useColorPalette from '@/hooks/useColorPalette';
import { Colors } from '@/theme/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Act6Record from '../../components/Act6/Act6Record';

export default function ActivityRecord() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const activity = ACTIVITY_DATA[id]
    const colors = useColorPalette();
    const styles = getStyles(colors);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    
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
                return
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