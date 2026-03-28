import { darkColors, lightColors } from "@/theme/theme";
import { useColorScheme } from "react-native";

export default function useColorPalette() {
    const scheme = useColorScheme()
    return scheme == "dark" ? darkColors : lightColors;
}