import { StyleSheet, Text, View } from "react-native";

export default function Activites() {
  return (
    <View style={styles.View}>
      <Text>Activity Page</Text>
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