import { StyleSheet, Text, View } from "react-native";

export default function Leaderboard() {
  return (
    <View style={styles.View}>
      <Text>Leaderboard Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  View: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }
})