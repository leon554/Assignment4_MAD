import { TeamMember } from "@/types/dbTypes";

export type VibrationSample = {
    ax: number;
    ay: number;
    az: number;
    magnitude: number;
    timestamp: number;
};

export type StructureIteration = {
    description: string;
    peakMagnitude: number;
    avgMagnitude: number;
    iterationScore: number;
};

export type Act4MemberData = {
    iterations: StructureIteration[];
    bestPeakMagnitude: number;
    bestScore: number;
};

export type Act4Context = {
    memberData: Map<string, Act4MemberData>;
    teamMembers: TeamMember[];
    currentTeamMember: TeamMember;
    currentMemberIndex: number;
    currentIteration: number;
    prevState: Act4State["state"];
    message: string;
};

export type Act4State =
    | { state: "start"; context: Act4Context }
    | { state: "iterating"; context: Act4Context }
    | { state: "switchTeamMates"; context: Act4Context }
    | { state: "done"; context: Act4Context };

export type Act4Event =
    | { name: "nextStep" }
    | { name: "recordVibration"; data: StructureIteration }
    | { name: "finishMember" };

const MAX_SCORE = 5000;
const SCORE_SCALE = 1000;

export function computeIterationScore(peakMagnitude: number): number {
    const clamped = Math.min(peakMagnitude, 50);
    return Math.max(0, Math.round(MAX_SCORE - clamped * SCORE_SCALE));
}

export function getDefaultInitialStateAct4(teamMembers: TeamMember[] | null): Act4State {
    return {
        state: "start",
        context: {
            memberData: new Map<string, Act4MemberData>(),
            teamMembers: [...(teamMembers ?? [])],
            currentTeamMember: teamMembers![0],
            currentMemberIndex: 1,
            currentIteration: 1,
            prevState: "iterating",
            message: "",
        },
    };
}

function setContext(this: Act4Context, patch: Partial<Act4Context>): Act4Context {
    return { ...this, ...patch };
}

function getMemberData(ctx: Act4Context): Act4MemberData {
    return (
        ctx.memberData.get(ctx.currentTeamMember.memberCode) ?? {
            iterations: [],
            bestPeakMagnitude: Infinity,
            bestScore: 0,
        }
    );
}

function advanceToNextMemberOrDone(
    ctx: Act4Context,
    setCtx: (p: Partial<Act4Context>) => Act4Context
): Act4State {
    const next = ctx.teamMembers[ctx.currentMemberIndex];
    if (!next) {
        return { state: "done", context: setCtx({ currentTeamMember: ctx.teamMembers[0] }) };
    }
    return {
        state: "switchTeamMates",
        context: setCtx({
            currentTeamMember: next,
            currentMemberIndex: ctx.currentMemberIndex + 1,
            currentIteration: 1,
            message: `${next.name}'s turn next!`,
        }),
    };
}

const MAX_ITERATIONS = 3;

export function send(event: Act4Event, currentState: Act4State): [Act4State, boolean] {
    const setCtx = setContext.bind(currentState.context);

    switch (currentState.state) {
        case "start":
            if (event.name === "nextStep") {
                return [{ state: "iterating", context: setCtx({ message: "" }) }, true];
            }
            break;

        case "iterating": {
            const ctx = currentState.context;

            if (event.name === "recordVibration") {
                const prev = getMemberData(ctx);
                const newIterations = [...prev.iterations, event.data];
                const bestPeak = Math.min(prev.bestPeakMagnitude, event.data.peakMagnitude);
                const bestScore = Math.max(prev.bestScore, event.data.iterationScore);
                const updated: Act4MemberData = { iterations: newIterations, bestPeakMagnitude: bestPeak, bestScore };
                const newMap = new Map(ctx.memberData).set(ctx.currentTeamMember.memberCode, updated);

                if (ctx.currentIteration < MAX_ITERATIONS) {
                    return [
                        {
                            state: "iterating",
                            context: setCtx({ memberData: newMap, currentIteration: ctx.currentIteration + 1 }),
                        },
                        true,
                    ];
                }
                return [advanceToNextMemberOrDone({ ...ctx, memberData: newMap }, setCtx.bind({ ...ctx, memberData: newMap })), true];
            }

            if (event.name === "finishMember") {
                return [advanceToNextMemberOrDone(ctx, setCtx), true];
            }
            break;
        }

        case "switchTeamMates":
            if (event.name === "nextStep") {
                return [{ state: "iterating", context: setCtx({ message: "", currentIteration: 1 }) }, true];
            }
            break;

        case "done":
            return [currentState, false];
    }

    return [currentState, false];
}
