import { TeamMember } from "@/types/dbTypes";

export type SoundAction =
    | "dropping_objects"
    | "talking"
    | "walking"
    | "stamping";

export const SOUND_ACTIONS: SoundAction[] = [
    "dropping_objects",
    "talking",
    "walking",
    "stamping",
];

export const SOUND_ACTION_LABELS: Record<SoundAction, string> = {
    dropping_objects: "Dropping Objects",
    talking: "Talking",
    walking: "Walking",
    stamping: "Stamping Feet",
};

export type SoundReading = {
    action: SoundAction;
    peakDb: number;
    avgDb: number;
    location: string;
};

export type Act2MemberData = {
    readings: SoundReading[];
    maxDb: number;
    overallAvgDb: number;
};

export type Act2Context = {
    memberData: Map<string, Act2MemberData>;
    teamMembers: TeamMember[];
    currentTeamMember: TeamMember;
    currentMemberIndex: number;
    currentActionIndex: number;
    prevState: Act2State["state"];
    message: string;
};

export type Act2State =
    | { state: "start"; context: Act2Context }
    | { state: "measuring"; context: Act2Context }
    | { state: "switchTeamMates"; context: Act2Context }
    | { state: "done"; context: Act2Context };

export type Act2Event =
    | { name: "nextStep" }
    | { name: "recordReading"; data: SoundReading }
    | { name: "skipAction" };

export function getDefaultInitialStateAct2(teamMembers: TeamMember[] | null): Act2State {
    return {
        state: "start",
        context: {
            memberData: new Map<string, Act2MemberData>(),
            teamMembers: [...(teamMembers ?? [])],
            currentTeamMember: teamMembers![0],
            currentMemberIndex: 1,
            currentActionIndex: 0,
            prevState: "measuring",
            message: "",
        },
    };
}

function setContext(this: Act2Context, patch: Partial<Act2Context>): Act2Context {
    return { ...this, ...patch };
}

function getMemberData(ctx: Act2Context): Act2MemberData {
    return (
        ctx.memberData.get(ctx.currentTeamMember.memberCode) ?? {
            readings: [],
            maxDb: 0,
            overallAvgDb: 0,
        }
    );
}

function computeStats(readings: SoundReading[]): { maxDb: number; overallAvgDb: number } {
    if (readings.length === 0) return { maxDb: 0, overallAvgDb: 0 };
    const maxDb = Math.max(...readings.map((r) => r.peakDb));
    const overallAvgDb = readings.reduce((s, r) => s + r.avgDb, 0) / readings.length;
    return { maxDb, overallAvgDb };
}

function advanceToNextMemberOrDone(
    ctx: Act2Context,
    setCtx: (p: Partial<Act2Context>) => Act2Context
): Act2State {
    const next = ctx.teamMembers[ctx.currentMemberIndex];
    if (!next) {
        return { state: "done", context: setCtx({ currentTeamMember: ctx.teamMembers[0] }) };
    }
    return {
        state: "switchTeamMates",
        context: setCtx({
            currentTeamMember: next,
            currentMemberIndex: ctx.currentMemberIndex + 1,
            currentActionIndex: 0,
            message: `${next.name}'s turn next!`,
        }),
    };
}

export function send(event: Act2Event, currentState: Act2State): [Act2State, boolean] {
    const setCtx = setContext.bind(currentState.context);

    switch (currentState.state) {
        case "start":
            if (event.name === "nextStep") {
                return [{ state: "measuring", context: setCtx({ message: "" }) }, true];
            }
            break;

        case "measuring": {
            const ctx = currentState.context;

            if (event.name === "recordReading") {
                const prev = getMemberData(ctx);
                const newReadings = [...prev.readings, event.data];
                const stats = computeStats(newReadings);
                const updated: Act2MemberData = { readings: newReadings, ...stats };
                const newMap = new Map(ctx.memberData).set(ctx.currentTeamMember.memberCode, updated);
                const nextActionIndex = ctx.currentActionIndex + 1;

                if (nextActionIndex < SOUND_ACTIONS.length) {
                    return [
                        { state: "measuring", context: setCtx({ memberData: newMap, currentActionIndex: nextActionIndex }) },
                        true,
                    ];
                }
                return [advanceToNextMemberOrDone({ ...ctx, memberData: newMap }, setCtx.bind({ ...ctx, memberData: newMap })), true];
            }

            if (event.name === "skipAction") {
                const nextActionIndex = ctx.currentActionIndex + 1;
                if (nextActionIndex < SOUND_ACTIONS.length) {
                    return [{ state: "measuring", context: setCtx({ currentActionIndex: nextActionIndex }) }, true];
                }
                return [advanceToNextMemberOrDone(ctx, setCtx), true];
            }

            if (event.name === "nextStep") {
                return [advanceToNextMemberOrDone(ctx, setCtx), true];
            }
            break;
        }

        case "switchTeamMates":
            if (event.name === "nextStep") {
                return [{ state: "measuring", context: setCtx({ message: "" }) }, true];
            }
            break;

        case "done":
            return [currentState, false];
    }

    return [currentState, false];
}
