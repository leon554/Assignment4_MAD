

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