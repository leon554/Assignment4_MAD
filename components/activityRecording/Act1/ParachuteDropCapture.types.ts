import { DropData } from "@/activityData/FSM/activity1FSM";

export type Phase = "idle" | "timing" | "review";

export interface ParachuteDropCaptureProps {
    withParachute: boolean;
    dropNumber: number;
    onRecord: (data: DropData) => void;
    onSkip?: () => void;
}
