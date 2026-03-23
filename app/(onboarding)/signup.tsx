import { useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function signup() {
    const router = useRouter();

    return (
        <View style={styles.View}>
        <Text>Signup Page</Text>
        <Button 
            title="Go to team formation" 
            onPress={() => router.push('/teamformation')} 
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