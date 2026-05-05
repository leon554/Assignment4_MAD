import { Colors } from "@/theme/theme";

export interface Sample {
    ax: number;
    ay: number;
    az: number;
    magnitude: number;
    jerk: number;
    timestamp: number;
}

export type Round = 1 | 2;
export type Phase = "idle" | "round_intro" | "recording" | "cooldown" | "between_rounds" | "done";
export type Movement = 1 | 2 | 3;

export interface MovementResult {
    movement: Movement;
    label: string;
    avgSpeed: number;
    avgJerk: number;
    maxJerk: number;
    rangeOfMotion: number;
    smoothnessLabel: string;
    smoothnessColor: string;
}

export interface RoundResult {
    round: Round;
    movements: MovementResult[];
    hardestMovement: Movement;
}

export interface SessionResult {
    round1: RoundResult;
    round2: RoundResult;
}

export interface RoundConfig {
    title: string;
    subtitle: string;
    emoji: string;
    hapticEnabled: boolean;
}

export interface StretchTrackerStyles {
    [key: string]: any;
}

export interface ResultScreenProps {
    result: SessionResult;
    colors: Colors;
    onReset: () => void;
}
