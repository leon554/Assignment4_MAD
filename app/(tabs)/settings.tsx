import { StyleSheet, Text, View } from "react-native";

export default function Settings() {
  return (
    <View style={styles.View}>
      <Text>Settings Page</Text>
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