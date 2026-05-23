import { TeamMember } from "@/types/dbTypes";

export type DropData = {
    videoUri: string;
    fallDurationSec: number;
    withParachute: boolean;
};

export type Act1MemberData = {
    drops: DropData[];
    bestFallDuration: number;
};

export type Act1Context = {
    memberData: Map<string, Act1MemberData>;
    teamMembers: TeamMember[];
    currentTeamMember: TeamMember;
    currentMemberIndex: number;
    currentDropIndex: number;
    prevState: Act1State["state"];
    message: string;
};

export type Act1State =
    | { state: "start"; context: Act1Context }
    | { state: "baselineDrop"; context: Act1Context }
    | { state: "parachuteDrop"; context: Act1Context }
    | { state: "switchTeamMates"; context: Act1Context }
    | { state: "done"; context: Act1Context };

export type Act1Event =
    | { name: "nextStep" }
    | { name: "recordBaseline"; data: DropData }
    | { name: "recordParachute"; data: DropData }
    | { name: "skipDrop" };

export function getDefaultInitialStateAct1(teamMembers: TeamMember[] | null): Act1State {
    return {
        state: "start",
        context: {
            memberData: new Map<string, Act1MemberData>(),
            teamMembers: [...(teamMembers ?? [])],
            currentTeamMember: teamMembers![0],
            currentMemberIndex: 1,
            currentDropIndex: 0,
            prevState: "baselineDrop",
            message: "",
        },
    };
}

function setContext(this: Act1Context, patch: Partial<Act1Context>): Act1Context {
    return { ...this, ...patch };
}

function getMemberData(ctx: Act1Context): Act1MemberData {
    return (
        ctx.memberData.get(ctx.currentTeamMember.memberCode) ?? {
            drops: [],
            bestFallDuration: 0,
        }
    );
}

function advanceToNextMemberOrDone(
    ctx: Act1Context,
    setCtx: (p: Partial<Act1Context>) => Act1Context
): Act1State {
    const next = ctx.teamMembers[ctx.currentMemberIndex];
    if (!next) {
        return { state: "done", context: setCtx({ currentTeamMember: ctx.teamMembers[0] }) };
    }
    return {
        state: "switchTeamMates",
        context: setCtx({
            currentTeamMember: next,
            currentMemberIndex: ctx.currentMemberIndex + 1,
            currentDropIndex: 0,
            message: `${next.name}'s turn next!`,
        }),
    };
}

export function send(event: Act1Event, currentState: Act1State): [Act1State, boolean] {
    const setCtx = setContext.bind(currentState.context);

    switch (currentState.state) {
        case "start":
            if (event.name === "nextStep") {
                return [{ state: "baselineDrop", context: setCtx({ message: "" }) }, true];
            }
            break;

        case "baselineDrop": {
            const ctx = currentState.context;
            if (event.name === "recordBaseline") {
                const prev = getMemberData(ctx);
                const updated: Act1MemberData = {
                    drops: [...prev.drops, event.data],
                    bestFallDuration: Math.max(prev.bestFallDuration, event.data.fallDurationSec), // ✅ fixed
                };
                return [
                    {
                        state: "parachuteDrop",
                        context: setCtx({
                            memberData: new Map(ctx.memberData).set(
                                ctx.currentTeamMember.memberCode,
                                updated
                            ),
                            currentDropIndex: 1,
                        }),
                    },
                    true,
                ];
            }
            if (event.name === "skipDrop") {
                return [{ state: "parachuteDrop", context: setCtx({ currentDropIndex: 1 }) }, true];
            }
            break;
        }

        case "parachuteDrop": {
            const ctx = currentState.context;
            if (event.name === "recordParachute") {
                const prev = getMemberData(ctx);
                const newDrop = event.data;
                const updatedDrops = [...prev.drops, newDrop];
                const best = Math.max(prev.bestFallDuration, newDrop.fallDurationSec);
                const updated: Act1MemberData = { drops: updatedDrops, bestFallDuration: best };
                const newMap = new Map(ctx.memberData).set(ctx.currentTeamMember.memberCode, updated);

                if (ctx.currentDropIndex < 3) {
                    return [
                        {
                            state: "parachuteDrop",
                            context: setCtx({
                                memberData: newMap,
                                currentDropIndex: ctx.currentDropIndex + 1,
                            }),
                        },
                        true,
                    ];
                }
                return [
                    advanceToNextMemberOrDone(
                        { ...ctx, memberData: newMap },
                        setCtx.bind({ ...ctx, memberData: newMap })
                    ),
                    true,
                ];
            }
            if (event.name === "skipDrop") {
                const prev = getMemberData(ctx);
                if (ctx.currentDropIndex >= 3 || prev.drops.length === 0) {
                    return [advanceToNextMemberOrDone(ctx, setCtx), true];
                }
                return [
                    {
                        state: "parachuteDrop",
                        context: setCtx({ currentDropIndex: ctx.currentDropIndex + 1 }),
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
                return [{ state: "baselineDrop", context: setCtx({ message: "" }) }, true];
            }
            break;

        case "done":
            return [currentState, false];
    }

    return [currentState, false];
}