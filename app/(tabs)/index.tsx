import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.View}>
      <Text>Home Screen</Text>
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