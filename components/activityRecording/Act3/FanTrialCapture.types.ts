import { FanDistance, FanMaterial, FanTrial } from "@/activityData/FSM/activity3FSM";

export type Phase = "idle" | "review";

export interface FanTrialCaptureProps {
    material: FanMaterial;
    distance: FanDistance;
    trialNumber: number;
    totalTrials: number;
    onRecord: (data: FanTrial) => void;
    onSkip: () => void;
}
