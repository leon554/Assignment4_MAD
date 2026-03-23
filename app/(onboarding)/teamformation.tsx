import { useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function teamformation() {
    const router = useRouter();

    return (
        <View style={styles.View}>
        <Text>Team Formation Page</Text>
        <Button 
            title="Go to home screen" 
            onPress={() => router.replace('/(tabs)')} 
        />
        </View>
    )
}
const styles = StyleSheet.create({
    View: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    }
})