import { SoundAction, SoundReading } from "@/activityData/FSM/activity2FSM";

export type Phase = "idle" | "recording" | "review";

export interface SoundMeterProps {
    action: SoundAction;
    actionNumber: number;
    totalActions: number;
    onRecord: (data: SoundReading) => void;
    onSkip: () => void;
}
