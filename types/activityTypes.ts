export type ActivityData = Record<string, {
    id: string;
    title: string;
    discipline: string;
    category: string;
    overview: string;
    equipment: string[];
    instructions: string[];
    curriculumLinks: string[];
}>

export type Activity5Data = {
    memberData: {
        MemberCode: string,
        avgSpeed: number,
        avgJerk: number,
        maxJerk: number,
        range: number
    }[]
}

export type Activity6Data = {
    memberData: {
        MemberCode: string,
        DMRT: number,
        NDMRT: number,
        TRACC: number
    }[]
}

export type Activity7Data = {
    memberData: {
        MemberCode: string,
        restBPM: number,
        activityBPM: number,
    }[]
}

export type ActivitySummary = {
    id: string;
    title: string;
    attempts: number;
    topScore: number;
    topTeamScore: number;
};

export type Activity1Data = {
    memberData: {
        MemberCode: string;
        bestFallDuration: number;
        dropCount: number;
        drops: { withParachute: boolean; fallDurationSec: number; videoUri: string }[];
    }[];
};

export type Activity2Data = {
    memberData: {
        MemberCode: string;
        maxDb: number;
        overallAvgDb: number;
        readings: { action: string; peakDb: number; avgDb: number; location: string }[];
    }[];
};

export type Activity3Data = {
    memberData: {
        MemberCode: string;
        trialCount: number;
        trials: { material: string; distanceCm: number; notes: string; photoUri: string }[];
    }[];
};

export type Activity4Data = {
    memberData: {
        MemberCode: string;
        bestScore: number;
        bestPeakMagnitude: number;
        iterations: {
            description: string;
            peakMagnitude: number;
            avgMagnitude: number;
            iterationScore: number;
        }[];
    }[];
};

export interface Act7SessionResult {
	avgBpm: number;
	minBpm: number;
	maxBpm: number;
	readings: number[];
}

export interface BreathingSample {
	val: number;
	timestamp: number;
}