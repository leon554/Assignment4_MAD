import { SoundAction } from "@/activityData/FSM/activity2FSM";

export function dbfsToSpl(dbfs: number): number {
    return Math.max(0, Math.min(130, 120 + dbfs));
}

export function dbColor(db: number): string {
    if (db < 50) return "#4caf50";
    if (db < 70) return "#ff9800";
    return "#f44336";
}

export function dbBarPercent(db: number): number {
    return Math.min(100, (db / 120) * 100);
}

export function getActionHint(action: SoundAction): string {
    switch (action) {
        case "dropping_objects": return "Drop objects onto a hard surface.";
        case "talking":          return "Talk at a normal conversational volume.";
        case "walking":          return "Walk around the classroom.";
        case "stamping":         return "Stamp your feet firmly on the floor.";
    }
}
