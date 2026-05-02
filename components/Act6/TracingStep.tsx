import useColorPalette from '@/hooks/useColorPalette'
import { Colors } from '@/theme/theme'
import {
    Canvas,
    Circle,
    Paint,
    Path,
    Skia,
} from '@shopify/react-native-skia'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import {
    cancelAnimation,
    Easing,
    runOnJS,
    useDerivedValue,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated'
import Button from '../Button'

// ── Constants ─────────────────────────────────────────────────────────────────
const ORBIT_RADIUS = 110
const CIRCLE_RADIUS = 18
const TRACE_TOLERANCE = 44         // px — full score within this band around the path
const TRACE_DURATION_MS = 5000
const ANIMATION_PERIOD_MS = 3500
const TRAIL_MAX_POINTS = 80        // how many finger trail points to keep on screen

// ── Types ─────────────────────────────────────────────────────────────────────
interface TracePoint {
    x: number
    y: number
    t: number
}

interface TracingResults {
    accuracy: number
    avgDelay: number
}

interface Props {
    onRecord: (accuracy: number) => void
}

// ── JS-thread helpers (used only for scoring after tracing ends) ───────────────
function circlePositionJS(
    elapsedMs: number,
    cx: number,
    cy: number
): { x: number; y: number } {
    const angle =
        ((elapsedMs % ANIMATION_PERIOD_MS) / ANIMATION_PERIOD_MS) * 2 * Math.PI -
        Math.PI / 2
    return {
        x: cx + ORBIT_RADIUS * Math.cos(angle),
        y: cy + ORBIT_RADIUS * Math.sin(angle),
    }
}

function ptDist(ax: number, ay: number, bx: number, by: number) {
    return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2)
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function TracingStep({ onRecord }: Props) {
    const colors = useColorPalette()
    const styles = getStyles(colors)

    const [phase, setPhase] = useState<'idle' | 'tracing' | 'results'>('idle')
    const [results, setResults] = useState<TracingResults | null>(null)
    const [countdown, setCountdown] = useState(TRACE_DURATION_MS / 1000)
    const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 })

    // Center derived from measured canvas — updated as shared values so the
    // UI-thread worklets can read them without crossing the bridge
    const centerX = useSharedValue(0)
    const centerY = useSharedValue(0)

    useEffect(() => {
        centerX.value = canvasSize.w / 2
        centerY.value = canvasSize.h / 2
    }, [canvasSize])

    // ── Animation ─────────────────────────────────────────────────────────────
    // progress: 0 → 1 = one full revolution
    const progress = useSharedValue(0)

    // Dot position — derived entirely on UI thread, fed directly into Skia
    const dotX = useDerivedValue(() =>
        centerX.value + ORBIT_RADIUS * Math.cos(progress.value * 2 * Math.PI - Math.PI / 2)
    )
    const dotY = useDerivedValue(() =>
        centerY.value + ORBIT_RADIUS * Math.sin(progress.value * 2 * Math.PI - Math.PI / 2)
    )

    const startAnimation = useCallback(() => {
        progress.value = 0
        progress.value = withRepeat(
            withTiming(1, { duration: ANIMATION_PERIOD_MS, easing: Easing.linear }),
            -1,
            false
        )
    }, [progress])

    const stopAnimation = useCallback(() => {
        cancelAnimation(progress)
    }, [progress])

    // ── Finger trail (Skia path, rebuilt on JS thread from gesture events) ────
    const [trailPath, setTrailPath] = useState(() => Skia.Path.Make())
    const trailPointsRef = useRef<{ x: number; y: number }[]>([])

    const rebuildTrail = useCallback((pts: { x: number; y: number }[]) => {
        const p = Skia.Path.Make()
        if (pts.length === 0) return setTrailPath(p)
        p.moveTo(pts[0].x, pts[0].y)
        for (let i = 1; i < pts.length; i++) p.lineTo(pts[i].x, pts[i].y)
        setTrailPath(p)
    }, [])

    // ── Trace recording ───────────────────────────────────────────────────────
    const tracePointsRef = useRef<TracePoint[]>([])
    const traceStartRef = useRef(0)
    const traceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // ── Scoring ───────────────────────────────────────────────────────────────
    const finalize = useCallback(() => {
        const points = tracePointsRef.current
        const cx = canvasSize.w / 2
        const cy = canvasSize.h / 2

        if (points.length === 0) {
            setResults({ accuracy: 0, avgDelay: 0 })
            setPhase('results')
            onRecord(0)
            return
        }

        let totalScore = 0
        let totalDelay = 0
        const orbitCircumference = 2 * Math.PI * ORBIT_RADIUS
        const pxPerMs = orbitCircumference / ANIMATION_PERIOD_MS

        for (const pt of points) {
            const dx = pt.x - cx
            const dy = pt.y - cy
            const distFromCenter = Math.sqrt(dx * dx + dy * dy)
            const distFromPath = Math.abs(distFromCenter - ORBIT_RADIUS)
            totalScore += Math.max(0, 1 - distFromPath / TRACE_TOLERANCE)

            const dotAt = circlePositionJS(pt.t - traceStartRef.current, cx, cy)
            const lag = ptDist(pt.x, pt.y, dotAt.x, dotAt.y)
            totalDelay += lag / pxPerMs
        }

        const accuracy = Math.round((totalScore / points.length) * 100)
        const avgDelay = Math.round(totalDelay / points.length)

        setResults({ accuracy, avgDelay })
        setPhase('results')
        onRecord(accuracy)
    }, [onRecord, canvasSize])

    const beginTrace = useCallback(() => {
        tracePointsRef.current = []
        trailPointsRef.current = []
        traceStartRef.current = Date.now()
        setTrailPath(Skia.Path.Make())
        setCountdown(TRACE_DURATION_MS / 1000)
        setPhase('tracing')
        startAnimation()

        countdownRef.current = setInterval(() => {
            setCountdown(prev => Math.max(0, prev - 1))
        }, 1000)

        traceTimerRef.current = setTimeout(() => {
            if (countdownRef.current) clearInterval(countdownRef.current)
            stopAnimation()
            finalize()
        }, TRACE_DURATION_MS)
    }, [startAnimation, stopAnimation, finalize])

    useEffect(() => {
        return () => {
            stopAnimation()
            if (traceTimerRef.current) clearTimeout(traceTimerRef.current)
            if (countdownRef.current) clearInterval(countdownRef.current)
        }
    }, [stopAnimation])

    // ── Gesture (RNGH Gesture API — cleaner than PanResponder) ───────────────
    const gesture = Gesture.Pan()
        .onUpdate(e => {
            'worklet'
            // Record for scoring on JS thread
            runOnJS((x: number, y: number, t: number) => {
                tracePointsRef.current.push({ x, y, t })

                // Rolling window for the trail visual
                const pts = trailPointsRef.current
                pts.push({ x, y })
                if (pts.length > TRAIL_MAX_POINTS) pts.shift()
                rebuildTrail([...pts])
            })(e.x, e.y, Date.now())
        })
        .minDistance(0)

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>

            {/* ── IDLE ── */}
            {phase === 'idle' && (
                <View style={styles.sectionView}>
                    <Button label="Start Tracing" onPress={beginTrace} fullWidth={true} />
                </View>
            )}

            {/* ── TRACING ── */}
            {phase === 'tracing' && (
                <View
                    style={styles.canvasWrapper}
                    onLayout={e => {
                        const { width, height } = e.nativeEvent.layout
                        setCanvasSize({ w: width, h: height })
                    }}
                >
                    <GestureDetector gesture={gesture}>
                        <Canvas style={styles.canvas}>
                            {/* Orbit guide ring */}
                            <Circle
                                cx={centerX}
                                cy={centerY}
                                r={ORBIT_RADIUS}
                            >
                                <Paint
                                    color={colors.border}
                                    style="stroke"
                                    strokeWidth={1.5}
                                />
                            </Circle>

                            {/* Finger trail */}
                            <Path
                                path={trailPath}
                                style="stroke"
                                strokeWidth={3}
                                strokeCap="round"
                                strokeJoin="round"
                                color={colors.primary + '55'} // 33% opacity trail
                            />

                            {/* Moving dot */}
                            <Circle cx={dotX} cy={dotY} r={CIRCLE_RADIUS} color={colors.primary} />
                        </Canvas>
                    </GestureDetector>

                    {/* Countdown — sits outside canvas so it doesn't interfere with gestures */}
                    <View style={styles.tracingHint} pointerEvents="none">
                        <Text style={styles.countdownText}>{countdown}s</Text>
                        <Text style={styles.hintText}>Keep your finger on the dot</Text>
                    </View>
                </View>
            )}

            {/* ── RESULTS ── */}
            {phase === 'results' && results && (
                <View style={styles.sectionView}>
                    <Text style={styles.titleText}>Tracing Results</Text>

                    <View style={styles.resultsCard}>
                        <View style={styles.metricRow}>
                            <View style={styles.metric}>
                                <Text style={styles.metricValue}>{results.accuracy}%</Text>
                                <Text style={styles.metricLabel}>Accuracy</Text>
                            </View>
                            <View style={styles.metricDivider} />
                            <View style={styles.metric}>
                                <Text style={styles.metricValue}>{results.avgDelay} ms</Text>
                                <Text style={styles.metricLabel}>Avg Delay</Text>
                            </View>
                        </View>

                        <View style={styles.barTrack}>
                            <View
                                style={[
                                    styles.barFill,
                                    { width: `${results.accuracy}%` as any },
                                ]}
                            />
                        </View>
                    </View>

                    <Button
                        label="Next"
                        onPress={() => onRecord(results.accuracy)}
                        fullWidth={true}
                    />
                </View>
            )}
        </View>
    )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const getStyles = (colors: Colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },

        // ── Canvas area ──
        canvasWrapper: {
            flex: 1,
        },
        canvas: {
            flex: 1,
        },

        // ── Shared section layout ──
        sectionView: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            gap: 30,
            padding: 40,
        },
        titleText: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.textPrimary,
        },

        // ── Tracing overlay ──
        tracingHint: {
            position: 'absolute',
            bottom: 40,
            left: 0,
            right: 0,
            alignItems: 'center',
            gap: 6,
        },
        countdownText: {
            fontSize: 36,
            fontWeight: '700',
            color: colors.primary,
        },
        hintText: {
            fontSize: 14,
            color: colors.textSecondary,
        },

        // ── Results card ──
        resultsCard: {
            width: '100%',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 24,
            gap: 20,
            backgroundColor: colors.surface,
        },
        metricRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
        },
        metric: {
            alignItems: 'center',
            flex: 1,
            gap: 4,
        },
        metricValue: {
            fontSize: 28,
            fontWeight: '700',
            color: colors.textPrimary,
        },
        metricLabel: {
            fontSize: 12,
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        metricDivider: {
            width: 1,
            height: 44,
            backgroundColor: colors.border,
        },
        barTrack: {
            height: 6,
            borderRadius: 3,
            backgroundColor: colors.border,
            overflow: 'hidden',
        },
        barFill: {
            height: 6,
            borderRadius: 3,
            backgroundColor: colors.primary,
        },
    })