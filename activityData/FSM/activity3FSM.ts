import { TeamMember } from "@/types/dbTypes";

export type FanMaterial = "paper" | "cardboard";
export type FanDistance = 15 | 30 | 45;

export const FAN_DISTANCES: FanDistance[] = [15, 30, 45];
export const FAN_MATERIALS: FanMaterial[] = ["paper", "cardboard"];

export type FanTrial = {
    material: FanMaterial;
    distanceCm: FanDistance;
    photoUri: string;
    notes: string;
};

export type Act3MemberData = {
    trials: FanTrial[];
};

export type Act3Context = {
    memberData: Map<string, Act3MemberData>;
    teamMembers: TeamMember[];
    currentTeamMember: TeamMember;
    currentMemberIndex: number;
    currentMaterialIndex: number;
    currentDistanceIndex: number;
    prevState: Act3State["state"];
    message: string;
};

export type Act3State =
    | { state: "start"; context: Act3Context }
    | { state: "trial"; context: Act3Context }
    | { state: "switchTeamMates"; context: Act3Context }
    | { state: "done"; context: Act3Context };

export type Act3Event =
    | { name: "nextStep" }
    | { name: "recordTrial"; data: FanTrial }
    | { name: "skipTrial" };

export function getDefaultInitialStateAct3(teamMembers: TeamMember[] | null): Act3State {
    return {
        state: "start",
        context: {
            memberData: new Map<string, Act3MemberData>(),
            teamMembers: [...(teamMembers ?? [])],
            currentTeamMember: teamMembers![0],
            currentMemberIndex: 1,
            currentMaterialIndex: 0,
            currentDistanceIndex: 0,
            prevState: "trial",
            message: "",
        },
    };
}

function setContext(this: Act3Context, patch: Partial<Act3Context>): Act3Context {
    return { ...this, ...patch };
}

function getMemberData(ctx: Act3Context): Act3MemberData {
    return ctx.memberData.get(ctx.currentTeamMember.memberCode) ?? { trials: [] };
}

function advanceTrialIndices(
    matIdx: number,
    distIdx: number
): { matIdx: number; distIdx: number; done: boolean } {
    const nextDist = distIdx + 1;
    if (nextDist < FAN_DISTANCES.length) {
        return { matIdx, distIdx: nextDist, done: false };
    }
    const nextMat = matIdx + 1;
    if (nextMat < FAN_MATERIALS.length) {
        return { matIdx: nextMat, distIdx: 0, done: false };
    }
    return { matIdx, distIdx, done: true };
}

function advanceToNextMemberOrDone(
    ctx: Act3Context,
    setCtx: (p: Partial<Act3Context>) => Act3Context
): Act3State {
    const next = ctx.teamMembers[ctx.currentMemberIndex];
    if (!next) {
        return { state: "done", context: setCtx({ currentTeamMember: ctx.teamMembers[0] }) };
    }
    return {
        state: "switchTeamMates",
        context: setCtx({
            currentTeamMember: next,
            currentMemberIndex: ctx.currentMemberIndex + 1,
            currentMaterialIndex: 0,
            currentDistanceIndex: 0,
            message: `${next.name}'s turn next!`,
        }),
    };
}

export function send(event: Act3Event, currentState: Act3State): [Act3State, boolean] {
    const setCtx = setContext.bind(currentState.context);

    switch (currentState.state) {
        case "start":
            if (event.name === "nextStep") {
                return [{ state: "trial", context: setCtx({ message: "" }) }, true];
            }
            break;

        case "trial": {
            const ctx = currentState.context;

            if (event.name === "recordTrial") {
                const prev = getMemberData(ctx);
                const newTrials = [...prev.trials, event.data];
                const newMap = new Map(ctx.memberData).set(ctx.currentTeamMember.memberCode, { trials: newTrials });
                const next = advanceTrialIndices(ctx.currentMaterialIndex, ctx.currentDistanceIndex);

                if (next.done) {
                    return [advanceToNextMemberOrDone({ ...ctx, memberData: newMap }, setCtx.bind({ ...ctx, memberData: newMap })), true];
                }
                return [
                    {
                        state: "trial",
                        context: setCtx({
                            memberData: newMap,
                            currentMaterialIndex: next.matIdx,
                            currentDistanceIndex: next.distIdx,
                        }),
                    },
                    true,
                ];
            }

            if (event.name === "skipTrial") {
                const next = advanceTrialIndices(ctx.currentMaterialIndex, ctx.currentDistanceIndex);
                if (next.done) {
                    return [advanceToNextMemberOrDone(ctx, setCtx), true];
                }
                return [
                    {
                        state: "trial",
                        context: setCtx({
                            currentMaterialIndex: next.matIdx,
                            currentDistanceIndex: next.distIdx,
                        }),
                    },
                    true,
                ];
            }

            if (event.name === "nextStep") {
                return [advanceToNextMemberOrDone(ctx, setCtx), true];
            }
            break;
        }

        case "switchTeamMates":
            if (event.name === "nextStep") {
                return [{ state: "trial", context: setCtx({ message: "", currentMaterialIndex: 0, currentDistanceIndex: 0 }) }, true];
            }
            break;

        case "done":
            return [currentState, false];
    }

    return [currentState, false];
}
