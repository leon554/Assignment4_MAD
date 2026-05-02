import useColorPalette from "@/hooks/useColorPalette";
import { Colors } from "@/theme/theme";
import { Accelerometer } from "expo-sensors";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Svg, { Polyline } from "react-native-svg";

// ─── Config ────────────────────────────────────────────────────────────────
const SAMPLE_RATE_MS = 50;
const WINDOW_SIZE = 400; // 20 seconds of data at 50ms
const BREATH_FREQ_MIN = 0.15; // 9 BPM
const BREATH_FREQ_MAX = 0.6; // 36 BPM
const SMOOTHING_ALPHA = 0.1;
const SESSION_SECONDS = 60;

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_WIDTH = SCREEN_WIDTH - 80;
const CHART_HEIGHT = 100;

// ─── Types ──────────────────────────────────────────────────────────────────
interface Sample {
  val: number;
  timestamp: number;
}

type Phase = "idle" | "tracking" | "done";

interface SessionResult {
  avgBpm: number;
  minBpm: number;
  maxBpm: number;
  readings: number[];
}

// ─── Utilities ───────────────────────────────────────────────────────────────
function lowPass(prev: number, next: number, alpha: number): number {
  return alpha * next + (1 - alpha) * prev;
}

function estimateBreathsPerMinute(samples: Sample[]): number | null {
  if (samples.length < 40) return null;
  const values = samples.map((s) => s.val);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const centred = values.map((v) => v - mean);

  // Dynamic Hysteresis: Find the amplitude to filter out noise
  const maxAmp = Math.max(...centred);
  const minAmp = Math.min(...centred);
  const amplitude = maxAmp - minAmp;

  // If amplitude is tiny, they are holding their breath or the phone is on a table
  if (amplitude < 0.005) return null;

  const threshold = amplitude * 0.25; // Require a 25% swing to register a crossing
  let crossings = 0;
  let isPositive = centred[0] > 0;

  for (let i = 1; i < centred.length; i++) {
    if (isPositive && centred[i] < -threshold) {
      crossings++;
      isPositive = false;
    } else if (!isPositive && centred[i] > threshold) {
      crossings++;
      isPositive = true;
    }
  }

  const duration =
    (samples[samples.length - 1].timestamp - samples[0].timestamp) / 1000;
  if (duration === 0) return null;
  
  const bpm = (crossings / 2 / duration) * 60;
  if (bpm < BREATH_FREQ_MIN * 60 || bpm > BREATH_FREQ_MAX * 60) return null;
  return Math.round(bpm);
}

function getBpmColor(bpm: number | null, colors: Colors): string {
  if (bpm === null) return colors.textDisabled;
  if (bpm < 12) return colors.destructive;
  if (bpm <= 20) return colors.positive;
  return colors.destructive;
}

function bpmLabel(bpm: number): string {
  if (bpm < 12) return "Slow";
  if (bpm <= 20) return "Normal";
  return "Elevated";
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BreathingTracker() {
  const colors = useColorPalette();
  const styles = getStyles(colors);

  const [phase, setPhase] = useState<Phase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS);
  const [liveBpm, setLiveBpm] = useState<number | null>(null);
  const [rawZ, setRawZ] = useState<number | null>(null);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [chartPoints, setChartPoints] = useState<string>("");

  const bufferRef = useRef<Sample[]>([]);
  const filteredZRef = useRef<number>(0);
  const readingsRef = useRef<number[]>([]);
  const subscriptionRef = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnim = useRef(new Animated.Value(1)).current;

  const stopTracking = useCallback(
    (finalise = false) => {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      Accelerometer.setUpdateInterval(1000);

      if (finalise && readingsRef.current.length > 0) {
        const readings = readingsRef.current;
        const avg = Math.round(readings.reduce((a, b) => a + b, 0) / readings.length);
        setResult({ avgBpm: avg, minBpm: Math.min(...readings), maxBpm: Math.max(...readings), readings });
        setPhase("done");
      } else {
        setPhase("idle");
        setSecondsLeft(SESSION_SECONDS);
        setLiveBpm(null);
        setRawZ(null);
        setChartPoints("");
        progressAnim.setValue(1);
      }
    },
    [progressAnim]
  );

  const startTracking = useCallback(() => {
    bufferRef.current = [];
    filteredZRef.current = 0;
    readingsRef.current = [];
    setLiveBpm(null);
    setResult(null);
    setChartPoints("");
    setSecondsLeft(SESSION_SECONDS);
    setPhase("tracking");

    progressAnim.setValue(1);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: SESSION_SECONDS * 1000,
      useNativeDriver: false,
    }).start();

    let remaining = SESSION_SECONDS;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setSecondsLeft(remaining);
      if (remaining <= 0) stopTracking(true);
    }, 1000);

    Accelerometer.setUpdateInterval(SAMPLE_RATE_MS);
    
    // Flag to skip the first heavy gravity reading spike
    let isInitialized = false; 

    subscriptionRef.current = Accelerometer.addListener(({ z }) => {
      setRawZ(parseFloat(z.toFixed(4)));
      const now = Date.now();
      
      if (!isInitialized) {
        filteredZRef.current = z; // Snap to gravity initially
        isInitialized = true;
      } else {
        filteredZRef.current = lowPass(filteredZRef.current, z, SMOOTHING_ALPHA);
      }

      bufferRef.current.push({ val: filteredZRef.current, timestamp: now });
      if (bufferRef.current.length > WINDOW_SIZE) bufferRef.current.shift();
      
      // Update Chart logic
      if (bufferRef.current.length > 10) {
         const values = bufferRef.current.map(s => s.val);
         const min = Math.min(...values);
         const max = Math.max(...values);
         const range = max - min === 0 ? 1 : max - min;
         
         const pointsString = bufferRef.current.map((s, i) => {
            const x = (i / WINDOW_SIZE) * CHART_WIDTH;
            // Normalize between 0 and CHART_HEIGHT, flip Y so peaks go up
            const normalizedY = ((s.val - min) / range);
            const y = CHART_HEIGHT - (normalizedY * CHART_HEIGHT);
            return `${x},${y}`;
         }).join(' ');
         
         setChartPoints(pointsString);
      }

      // Calculate BPM less frequently to save UI thread performance
      if (bufferRef.current.length % 20 === 0) {
        const est = estimateBreathsPerMinute(bufferRef.current);
        if (est !== null) {
          setLiveBpm(est);
          readingsRef.current.push(est);
        }
      }
    });
  }, [stopTracking, progressAnim]);

  useEffect(() => () => stopTracking(false), [stopTracking]);

  if (phase === "done" && result) {
    return <ResultScreen result={result} colors={colors} onReset={() => stopTracking(false)} />;
  }

  const ringAnimColor = progressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [colors.destructive, colors.primary, colors.positive],
  });

  const liveBpmColor = getBpmColor(liveBpm, colors);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titleText}>Breathing Tracker</Text>

      {phase === "idle" && (
        <Text style={styles.subText}>
          Place your phone flat on your chest, then tap Start.
        </Text>
      )}

      {/* Timer ring */}
      <View style={styles.ringContainer}>
        <View style={styles.ringBg} />
        {phase === "tracking" && (
          <Animated.View
            style={[
              styles.ringFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
                backgroundColor: ringAnimColor,
              },
            ]}
          />
        )}
        <View style={styles.ringInner}>
          {phase === "tracking" ? (
            <>
              <Text style={styles.countdown}>{secondsLeft}</Text>
              <Text style={styles.subText}>seconds left</Text>
            </>
          ) : (
            <Text style={styles.idleIcon}>🫁</Text>
          )}
        </View>
      </View>

      {/* Live Waveform Chart */}
      {phase === "tracking" && (
        <View style={styles.subSectionView}>
          <Text style={styles.subTitle}>Breathing Waveform (Z-Axis)</Text>
          <View style={{ width: CHART_WIDTH, height: CHART_HEIGHT, backgroundColor: colors.surfaceRaised, borderRadius: 8, overflow: 'hidden' }}>
             <Svg width="100%" height="100%">
               <Polyline points={chartPoints} fill="none" stroke={colors.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
             </Svg>
          </View>
          <Text style={styles.subText}>Watch for rhythmic peaks as you inhale.</Text>
        </View>
      )}

      {/* Live BPM card */}
      {phase === "tracking" && (
        <View style={styles.sectionView}>
          <Text style={styles.subTitle}>Live estimate</Text>
          <Text style={[styles.bpmValue, { color: liveBpmColor }]}>
            {liveBpm !== null ? liveBpm : "—"}
          </Text>
          <Text style={styles.subText}>breaths / min</Text>
          {liveBpm !== null ? (
            <Text style={[styles.bpmTag, { color: liveBpmColor }]}>
              {bpmLabel(liveBpm)}
            </Text>
          ) : (
            <Text style={styles.subText}>
              Calibrating… keep still and breathe normally
            </Text>
          )}
        </View>
      )}

      {phase === "idle" && (
        <Pressable style={styles.buttonPrimary} onPress={startTracking}>
          <Text style={styles.buttonPrimaryText}>Start 1-minute recording</Text>
        </Pressable>
      )}

      {phase === "tracking" && (
        <Pressable style={styles.buttonSecondary} onPress={() => stopTracking(false)}>
          <Text style={styles.buttonSecondaryText}>Cancel</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

// ─── Results Screen (Remains mostly unchanged) ────────────────────────────────
function ResultScreen({ result, colors, onReset }: { result: SessionResult; colors: Colors; onReset: () => void; }) {
  const styles = getStyles(colors);
  const color = getBpmColor(result.avgBpm, colors);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titleText}>Results</Text>
      <View style={styles.sectionView}>
        <Text style={styles.subTitle}>Average breathing rate</Text>
        <Text style={[styles.bpmValue, { color }]}>{result.avgBpm}</Text>
        <Text style={styles.subText}>breaths / min</Text>
      </View>
      <Pressable style={styles.buttonPrimary} onPress={onReset}>
        <Text style={styles.buttonPrimaryText}>Record again</Text>
      </Pressable>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const getStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: colors.background, alignItems: "center", padding: 24, paddingTop: 60, gap: 20, paddingBottom: 150 },
    titleText: { fontSize: 26, fontWeight: "700", color: colors.textPrimary },
    subTitle: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
    subText: { fontSize: 13, color: colors.textSecondary, textAlign: "justify" },
    sectionView: { display: "flex", justifyContent: "center", alignItems: "center", width: "100%", gap: 8, padding: 24, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
    subSectionView: { display: "flex", justifyContent: "center", width: "100%", gap: 8, padding: 16, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
    ringContainer: { width: 200, height: 200, justifyContent: "center", alignItems: "center" },
    ringBg: { position: "absolute", width: 200, height: 200, borderRadius: 100, borderWidth: 8, borderColor: colors.border },
    ringFill: { position: "absolute", bottom: -20, left: 0, height: 4, borderRadius: 2 },
    ringInner: { alignItems: "center", gap: 4 },
    countdown: { fontSize: 64, fontWeight: "800", color: colors.textPrimary, lineHeight: 72 },
    idleIcon: { fontSize: 64 },
    bpmValue: { fontSize: 72, fontWeight: "800", lineHeight: 80 },
    bpmTag: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
    buttonPrimary: { width: "100%", backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: "center" },
    buttonPrimaryText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: "700" },
    buttonSecondary: { width: "100%", backgroundColor: colors.surfaceRaised, paddingVertical: 16, borderRadius: 14, alignItems: "center", borderWidth: 1, borderColor: colors.border },
    buttonSecondaryText: { color: colors.textSecondary, fontSize: 16, fontWeight: "600" },
  });