
import useColorPalette from '@/hooks/useColorPalette';
import { Colors } from '@/theme/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import BreathingTracker from './BreathingTracker';

export default function Act7Record() {
    const colors = useColorPalette();
    const styles = getStyles(colors);
    
    return (
        <View style={styles.container}>
            <BreathingTracker/>
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