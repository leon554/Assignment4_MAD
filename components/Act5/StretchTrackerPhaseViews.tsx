import { Colors } from "@/theme/theme";
import { Animated, Pressable, Text, View } from "react-native";
import Svg, { Polyline } from "react-native-svg";
import {
    CHART_HEIGHT,
    CHART_WIDTH,
    MOVEMENT_LABELS,
    MOVEMENTS,
    ROUND_CONFIG,
} from "./StretchTracker.constants";
import { Movement, Round } from "./StretchTracker.types";

interface SharedProps {
    styles: ReturnType<typeof import("./StretchTracker.styles").getStyles>;
    colors: Colors;
}

export function MovementStepper({
    styles,
    currentMovement,
}: {
    styles: SharedProps["styles"];
    currentMovement: Movement;
}) {
    return (
        <View style={styles.movementHeader}>
            {MOVEMENTS.map((m) => (
                <View
                    key={m}
                    style={[
                        styles.movementStep,
                        currentMovement === m && styles.movementStepActive,
                        currentMovement > m && styles.movementStepDone,
                    ]}
                >
                    <Text
                        style={[
                            styles.movementStepText,
                            currentMovement === m && styles.movementStepTextActive,
                        ]}
                    >
                        {currentMovement > m ? "✓" : m}
                    </Text>
                </View>
            ))}
        </View>
    );
}

export function RoundBadge({ styles, r }: { styles: SharedProps["styles"]; r: Round }) {
    return (
        <View style={[styles.roundBadge, r === 2 && styles.roundBadge2]}>
            <Text style={styles.roundBadgeText}>
                {r === 1 ? "Round 1 — No Feedback" : "Round 2 — Haptic Feedback 📳"}
            </Text>
        </View>
    );
}

export function IdleView({
    styles,
    colors,
    onStartRound1,
}: SharedProps & { onStartRound1: () => void }) {
    return (
        <>
            <View style={styles.sectionView}>
                <Text style={styles.subText}>
                    This experiment has two rounds. In Round 1 you perform each stretch without any
                    feedback. In Round 2 your phone will buzz when your movement is too jerky — try
                    to minimise the buzzes and compare your results.
                </Text>
                <View style={styles.movementList}>
                    {MOVEMENTS.map((m) => (
                        <View key={m} style={styles.movementRow}>
                            <View style={styles.movementBadge}>
                                <Text style={styles.movementBadgeText}>{m}</Text>
                            </View>
                            <Text style={styles.subText}>{MOVEMENT_LABELS[m]}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.roundsPreview}>
                <View style={[styles.roundPreviewCard, { borderColor: colors.border }]}>
                    <Text style={styles.roundPreviewEmoji}>🤫</Text>
                    <Text style={styles.roundPreviewTitle}>Round 1</Text>
                    <Text style={styles.roundPreviewSub}>No feedback</Text>
                </View>
                <View style={styles.roundArrow}>
                    <Text style={{ color: colors.textDisabled, fontSize: 20 }}>→</Text>
                </View>
                <View style={[styles.roundPreviewCard, { borderColor: colors.primary }]}>
                    <Text style={styles.roundPreviewEmoji}>📳</Text>
                    <Text style={styles.roundPreviewTitle}>Round 2</Text>
                    <Text style={styles.roundPreviewSub}>Haptic cues</Text>
                </View>
            </View>

            <Pressable style={styles.buttonPrimary} onPress={onStartRound1}>
                <Text style={styles.buttonPrimaryText}>Start Round 1</Text>
            </Pressable>
        </>
    );
}

export function RoundIntroView({
    styles,
    round,
    onBegin,
    onCancel,
}: {
    styles: SharedProps["styles"];
    round: Round;
    onBegin: () => void;
    onCancel: () => void;
}) {
    return (
        <>
            <RoundBadge styles={styles} r={round} />
            <View style={styles.sectionView}>
                <Text style={styles.roundIntroEmoji}>{ROUND_CONFIG[round].emoji}</Text>
                <Text style={styles.movementLabel}>{ROUND_CONFIG[round].title}</Text>
                <Text style={styles.subText}>{ROUND_CONFIG[round].subtitle}</Text>
            </View>
            <View style={styles.movementList}>
                {MOVEMENTS.map((m) => (
                    <View key={m} style={styles.movementRow}>
                        <View style={styles.movementBadge}>
                            <Text style={styles.movementBadgeText}>{m}</Text>
                        </View>
                        <Text style={styles.subText}>{MOVEMENT_LABELS[m]}</Text>
                    </View>
                ))}
            </View>
            <Pressable style={styles.buttonPrimary} onPress={onBegin}>
                <Text style={styles.buttonPrimaryText}>Begin</Text>
            </Pressable>
            <Pressable style={styles.buttonSecondary} onPress={onCancel}>
                <Text style={styles.buttonSecondaryText}>Cancel</Text>
            </Pressable>
        </>
    );
}

export function CooldownView({
    styles,
    colors,
    round,
    currentMovement,
    cooldownLeft,
    onCancel,
}: {
    styles: SharedProps["styles"];
    colors: Colors;
    round: Round;
    currentMovement: Movement;
    cooldownLeft: number;
    onCancel: () => void;
}) {
    return (
        <>
            <RoundBadge styles={styles} r={round} />
            <MovementStepper styles={styles} currentMovement={currentMovement} />
            <View style={styles.sectionView}>
                <Text style={styles.cooldownEmoji}>🧘</Text>
                <Text style={styles.cooldownTitle}>Get Ready</Text>
                <Text style={[styles.countdown, { color: colors.primary }]}>{cooldownLeft}</Text>
                <Text style={styles.subText}>
                    Next: {MOVEMENT_LABELS[(currentMovement + 1) as Movement]}
                </Text>
            </View>
            <Pressable style={styles.buttonSecondary} onPress={onCancel}>
                <Text style={styles.buttonSecondaryText}>Cancel</Text>
            </Pressable>
        </>
    );
}

export function RecordingView({
    styles,
    colors,
    round,
    currentMovement,
    chartPoints,
    liveMagnitude,
    liveJerk,
    progressAnim,
    progressColor,
    jerkAnim,
    jerkColor,
    onCancel,
}: {
    styles: SharedProps["styles"];
    colors: Colors;
    round: Round;
    currentMovement: Movement;
    chartPoints: string;
    liveMagnitude: number;
    liveJerk: number;
    progressAnim: Animated.Value;
    progressColor: Animated.AnimatedInterpolation<string | number>;
    jerkAnim: Animated.Value;
    jerkColor: Animated.AnimatedInterpolation<string | number>;
    onCancel: () => void;
}) {
    return (
        <>
            <RoundBadge styles={styles} r={round} />
            <MovementStepper styles={styles} currentMovement={currentMovement} />

            <Text style={styles.movementLabel}>{MOVEMENT_LABELS[currentMovement]}</Text>

            <View style={styles.ringContainer}>
                <Animated.View
                    style={[
                        styles.ringFill,
                        {
                            width: progressAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["0%", "100%"],
                            }),
                            backgroundColor: progressColor,
                        },
                    ]}
                />
            </View>

            <View style={styles.subSectionView}>
                <Text style={styles.subTitle}>Movement Magnitude</Text>
                <View
                    style={{
                        width: CHART_WIDTH,
                        height: CHART_HEIGHT,
                        backgroundColor: colors.surfaceRaised,
                        borderRadius: 8,
                        overflow: "hidden",
                    }}
                >
                    <Svg width="100%" height="100%">
                        <Polyline
                            points={chartPoints}
                            fill="none"
                            stroke={colors.primary}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                </View>
                <Text style={styles.subText}>Smoother movement = flatter, more consistent wave.</Text>
            </View>

            <View style={styles.metricsRow}>
                <View style={[styles.metricCard, { flex: 1 }]}>
                    <Text style={styles.metricLabel}>Speed</Text>
                    <Text style={styles.metricValue}>{liveMagnitude}</Text>
                    <Text style={styles.metricUnit}>m/s²</Text>
                </View>
                <View style={[styles.metricCard, { flex: 1 }]}>
                    <Text style={styles.metricLabel}>Jerk</Text>
                    <Text style={styles.metricValue}>{liveJerk}</Text>
                    <Text style={styles.metricUnit}>m/s³</Text>
                </View>
            </View>

            <View style={styles.sectionView}>
                <Text style={styles.subTitle}>Smoothness</Text>
                {round === 2 && (
                    <Text style={styles.hapticHint}>
                        📳 Phone will buzz if you exceed the jerky threshold
                    </Text>
                )}
                <View style={styles.jerkBarBg}>
                    <Animated.View
                        style={[
                            styles.jerkBarFill,
                            {
                                width: jerkAnim.interpolate({
                                    inputRange: [0, 0.8],
                                    outputRange: ["0%", "100%"],
                                }),
                                backgroundColor: jerkColor,
                            },
                        ]}
                    />
                </View>
                <View style={styles.jerkBarLabels}>
                    <Text style={[styles.metricUnit, { color: colors.positive }]}>Smooth</Text>
                    <Text style={[styles.metricUnit, { color: colors.destructive }]}>Jerky</Text>
                </View>
            </View>

            <Pressable style={styles.buttonSecondary} onPress={onCancel}>
                <Text style={styles.buttonSecondaryText}>Cancel</Text>
            </Pressable>
        </>
    );
}

export function BetweenRoundsView({
    styles,
    onStartRound2,
    onReset,
}: {
    styles: SharedProps["styles"];
    onStartRound2: () => void;
    onReset: () => void;
}) {
    return (
        <>
            <View style={styles.sectionView}>
                <Text style={styles.roundIntroEmoji}>✅</Text>
                <Text style={styles.movementLabel}>Round 1 Complete!</Text>
                <Text style={styles.subText}>
                    Good work. Now repeat the same three movements, but this time your phone will buzz
                    whenever your movement becomes too jerky. Try to keep the buzzes to a minimum and
                    see if the feedback helps you move more smoothly.
                </Text>
            </View>
            <Pressable style={styles.buttonPrimary} onPress={onStartRound2}>
                <Text style={styles.buttonPrimaryText}>Start Round 2</Text>
            </Pressable>
            <Pressable style={styles.buttonSecondary} onPress={onReset}>
                <Text style={styles.buttonSecondaryText}>Start Over</Text>
            </Pressable>
        </>
    );
}
