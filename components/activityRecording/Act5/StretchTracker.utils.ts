import { MovementData } from "@/activityData/FSM/activity5FSM";
import { Colors } from "@/theme/theme";
import { CHART_HEIGHT, CHART_WIDTH, WINDOW_SIZE } from "./StretchTracker.constants";
import { Sample, SessionResult } from "./StretchTracker.types";

import {
    MODERATE_THRESHOLD,
    MOVEMENT_LABELS,
    SMOOTH_THRESHOLD,
} from "./StretchTracker.constants";
import { Movement, MovementResult, Round, RoundResult } from "./StretchTracker.types";

export function magnitude(ax: number, ay: number, az: number): number {
    return Math.sqrt(ax * ax + ay * ay + az * az);
}

export function computeJerk(prev: number, curr: number, dt: number): number {
    if (dt === 0) return 0;
    return Math.abs((curr - prev) / dt);
}

export function smoothnessLabel(avgJerk: number, colors: Colors): { label: string; color: string } {
    if (avgJerk < SMOOTH_THRESHOLD) return { label: "Smooth", color: colors.positive };
    if (avgJerk < MODERATE_THRESHOLD) return { label: "Moderate", color: colors.primary };
    return { label: "Jerky", color: colors.destructive };
}

export function computeRangeOfMotion(samples: Sample[]): number {
    if (samples.length === 0) return 0;
    const mags = samples.map((s) => s.magnitude);
    return parseFloat((Math.max(...mags) - Math.min(...mags)).toFixed(3));
}

export function buildResult(
    movement: Movement,
    label: string,
    samples: Sample[],
    colors: Colors
): MovementResult {
    if (samples.length === 0) {
        return {
            movement,
            label,
            avgSpeed: 0,
            avgJerk: 0,
            maxJerk: 0,
            rangeOfMotion: 0,
            smoothnessLabel: "No data",
            smoothnessColor: colors.textDisabled,
        };
    }
    const avgSpeed = parseFloat(
        (samples.reduce((a, s) => a + s.magnitude, 0) / samples.length).toFixed(3)
    );
    const avgJerk = parseFloat(
        (samples.reduce((a, s) => a + s.jerk, 0) / samples.length).toFixed(4)
    );
    const maxJerk = parseFloat(Math.max(...samples.map((s) => s.jerk)).toFixed(4));
    const rangeOfMotion = computeRangeOfMotion(samples);
    const { label: sLabel, color: sColor } = smoothnessLabel(avgJerk, colors);
    return { movement, label, avgSpeed, avgJerk, maxJerk, rangeOfMotion, smoothnessLabel: sLabel, smoothnessColor: sColor };
}

export function buildRoundResult(
    round: Round,
    buffers: Record<Movement, Sample[]>,
    colors: Colors
): RoundResult {
    const movements = ([1, 2, 3] as Movement[]).map((m) =>
        buildResult(m, MOVEMENT_LABELS[m], buffers[m], colors)
    );
    const hardest = movements.reduce((a, b) => (a.avgJerk > b.avgJerk ? a : b));
    return { round, movements, hardestMovement: hardest.movement };
}

export function buildChartPoints(samples: Sample[]): string {
    const values = samples.map((s) => s.magnitude);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min === 0 ? 1 : max - min;

    return samples
        .map((s, i) => {
            const px = (i / WINDOW_SIZE) * CHART_WIDTH;
            const normalizedY = (s.magnitude - min) / range;
            const py = CHART_HEIGHT - normalizedY * CHART_HEIGHT;
            return `${px},${py}`;
        })
        .join(" ");
}

export function aggregateSession(result: SessionResult): MovementData {
    const movements = [...result.round1.movements, ...result.round2.movements];
    const avgResults = movements.reduce((a, c) => {
        a.avgJerk += c.avgJerk;
        a.maxJerk += c.maxJerk;
        a.avgSpeed += c.avgSpeed;
        a.rangeOfMotion += c.rangeOfMotion;
        return a;
    });

    return {
        avgJerk: avgResults.avgJerk / 3,
        maxJerk: avgResults.maxJerk / 3,
        avgSpeed: avgResults.avgSpeed / 3,
        range: avgResults.rangeOfMotion / 3,
    };
}