export function getDropLabel(withParachute: boolean, dropNumber: number): string {
    return withParachute
        ? `Parachute Drop — Attempt ${dropNumber}`
        : "Baseline Drop (no parachute)";
}
