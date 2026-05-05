import { Movement, Round, RoundConfig } from "./StretchTracker.types";
import { Dimensions } from "react-native";

export const SAMPLE_RATE_MS = 50;
export const WINDOW_SIZE = 200;
export const RECORDING_SECONDS = 10;
export const COOLDOWN_SECONDS = 3;
export const JERK_SMOOTHING_ALPHA = 0.2;
export const SMOOTH_THRESHOLD = 0.4;
export const MODERATE_THRESHOLD = 0.8;
export const HAPTIC_COOLDOWN_MS = 200;
export const CHART_WIDTH =  Dimensions.get("window").width - 80;
export const CHART_HEIGHT = 100;

export const MOVEMENTS: Movement[] = [1, 2, 3];

export const MOVEMENT_LABELS: Record<Movement, string> = {
    1: "Movement 1: Slow Arm Raise",
    2: "Movement 2: Side Arm Move",
    3: "Movement 3: Circular Arm Swing",
};

export const ROUND_CONFIG: Record<Round, RoundConfig> = {
    1: {
        title: "Round 1: Baseline",
        subtitle: "No feedback. Perform each stretch as smoothly as you can without any cues.",
        emoji: "🤫",
        hapticEnabled: false,
    },
    2: {
        title: "Round 2: Haptic Feedback",
        subtitle: "Your phone will buzz when your movement becomes too jerky. Try to minimise the buzzes.",
        emoji: "📳",
        hapticEnabled: true,
    },
};
