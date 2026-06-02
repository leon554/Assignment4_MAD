import { Colors } from "@/theme/theme";
import { BreathingSample } from "@/types/activityTypes";

export function getBpmColor(bpm: number | null, colors: Colors): string {
    if (bpm === null) return colors.textDisabled;
    if (bpm < 12) return colors.destructive;
    if (bpm <= 20) return colors.positive;
    return colors.destructive;
}

export function lowPass(prev: number, next: number, alpha: number): number {
	return alpha * next + (1 - alpha) * prev;
}

export function estimateBreathsPerMinute(samples: BreathingSample[], breathFreqMax: number, breathFreqMin: number): number | null {
	if (samples.length < 40) return null;
	const values = samples.map((s) => s.val);
	const mean = values.reduce((a, b) => a + b, 0) / values.length;
	const centred = values.map((v) => v - mean);

	const maxAmp = Math.max(...centred);
	const minAmp = Math.min(...centred);
	const amplitude = maxAmp - minAmp;

	if (amplitude < 0.005) return null;

	const threshold = amplitude * 0.25; 
	let crossings = 0;
	let isPositive = centred[0] > 0;

	for (let i = 1; i < centred.length; i++) {
		if (isPositive && centred[i] < -threshold) {
			crossings++;
			isPositive = false;
		} else if (!isPositive && centred[i] > threshold) {
			crossings++;
			isPositive = true;
		}
	}

	const duration =
		(samples[samples.length - 1].timestamp - samples[0].timestamp) / 1000;
	if (duration === 0) return null;

	const bpm = (crossings / 2 / duration) * 60;
	if (bpm < breathFreqMin * 60 || bpm > breathFreqMax * 60) return null;
	return Math.round(bpm);
}

export function bpmLabel(bpm: number): string {
	if (bpm < 12) return "Slow";
	if (bpm <= 20) return "Normal";
	return "Elevated";
}