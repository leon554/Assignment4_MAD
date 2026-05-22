import { FanMaterial } from "@/activityData/FSM/activity3FSM";

export function getMaterialLabel(material: FanMaterial): string {
    return material === "paper" ? "Paper" : "Cardboard";
}

export function getMaterialColor(material: FanMaterial): string {
    return material === "paper" ? "#1976d2" : "#6d4c41";
}
