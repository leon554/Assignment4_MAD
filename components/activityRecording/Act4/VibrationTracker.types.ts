import { StructureIteration } from "@/activityData/FSM/activity4FSM";

export type Phase = "build" | "testing" | "result";

export interface VibrationTrackerProps {
    iterationNumber: number;
    maxIterations: number;
    onRecord: (data: StructureIteration) => void;
    onFinish: () => void;
}
