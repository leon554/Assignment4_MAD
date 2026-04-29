import { TeamMember } from "@/types/dbTypes";

export type Act6Context = {
    dominantHandTime: Map<string, number>,
    nonDominantHandTime: Map<string, number>
    tracingAcc: Map<string, number>
    teamMembers: TeamMember[]
    currentTeamMember: TeamMember
    currentMemberIndex: number
    message: string
    prevState: Act6State["state"]
};

export type Act6State =
    | { state: "dominantHandReactionTime"; context: Act6Context }
    | { state: "nonDominantHandReactionTime"; context: Act6Context }
    | { state: "tracingAcc"; context: Act6Context }
    | { state: "switchTeamMates"; context: Act6Context }
    | { state: "dominantHandTestInstructions"; context: Act6Context }
    | { state: "NonDominantTestInstructions"; context: Act6Context }
    | { state: "tracingTestInstructions"; context: Act6Context }
    | { state: "done"; context: Act6Context }

export type Act6Event =
    | { name: "record"; data: number}
    | { name: "nextStep";}

function setContext(this: Act6Context, context: Partial<Act6Context>): Act6Context {
    return { ...this, ...context };
}

export function send(event: Act6Event, currentState: Act6State): [Act6State, boolean] {
    const setCtx = setContext.bind(currentState.context);

    switch (currentState.state) {
        case "dominantHandReactionTime":
            return handleDominantHandReactionTime(event, currentState, setCtx)
        case "nonDominantHandReactionTime":
            return handleNonDominantHandReactionTime(event, currentState, setCtx)
        case "tracingAcc":
            return handleTracingAcc(event, currentState, setCtx)
        case "switchTeamMates":
            return handleSwitchTeamMates(event, currentState, setCtx)
        case "dominantHandTestInstructions":
            return handleDominantInstructions(event, currentState, setCtx)
        case "NonDominantTestInstructions":
            return handleNonDominantInstructions(event, currentState, setCtx)
        case "tracingTestInstructions":
            return handleTracingInstructions(event, currentState, setCtx)
        case "done":
            return [currentState, true]
    }
}

function handleDominantHandReactionTime(event: Act6Event, currentState: Act6State, setCtx: (context: Partial<Act6Context>) => Act6Context) : [Act6State, boolean] {
    const ctx = currentState.context
    
    if (event.name === "record") {
        const nextIndex = ctx.currentMemberIndex + 1
        const nextMember = ctx.teamMembers[ctx.currentMemberIndex] 

        if(!nextMember){
            return [{ state: "NonDominantTestInstructions", context: setCtx({ 
                dominantHandTime: new Map(ctx.dominantHandTime).set(ctx.currentTeamMember.memberCode, event.data),
                currentTeamMember: ctx.teamMembers[0],
                currentMemberIndex: 1,
            }) }, true];
        }else{
            return [{ state: "switchTeamMates", context: setCtx({ 
                dominantHandTime: new Map(ctx.dominantHandTime).set(ctx.currentTeamMember.memberCode, event.data),
                currentTeamMember: nextMember,
                currentMemberIndex: nextIndex,
                message: `${nextMember.name}'s Turn`,
                prevState: "dominantHandReactionTime"
            }) }, true];
        }

    }
    return [currentState, false];
}

function handleNonDominantHandReactionTime(event: Act6Event, currentState: Act6State, setCtx: (context: Partial<Act6Context>) => Act6Context) : [Act6State, boolean] {
    const ctx = currentState.context
    
    if (event.name === "record") {
        const nextIndex = ctx.currentMemberIndex + 1
        const nextMember = ctx.teamMembers[ctx.currentMemberIndex]

        if(!nextMember){
            return [{ state: "tracingTestInstructions", context: setCtx({ 
                nonDominantHandTime: new Map(ctx.nonDominantHandTime).set(ctx.currentTeamMember.memberCode, event.data),
                currentTeamMember: ctx.teamMembers[0],
                currentMemberIndex: 1,
            }) }, true];
        }else{
            return [{ state: "switchTeamMates", context: setCtx({ 
                nonDominantHandTime: new Map(ctx.nonDominantHandTime).set(ctx.currentTeamMember.memberCode, event.data),
                currentTeamMember: nextMember,
                currentMemberIndex: nextIndex,
                message: `${nextMember.name}'s Turn`,
                prevState: "nonDominantHandReactionTime"
            }) }, true];
        }

    }
    return [currentState, false];
}

function handleTracingAcc(event: Act6Event, currentState: Act6State, setCtx: (context: Partial<Act6Context>) => Act6Context) : [Act6State, boolean] {
    const ctx = currentState.context
    
    if (event.name === "record") {
        const nextIndex = ctx.currentMemberIndex + 1
        const nextMember = ctx.teamMembers[ctx.currentMemberIndex]

        if(!nextMember){
            return [{ state: "done", context: setCtx({ 
                tracingAcc: new Map(ctx.tracingAcc).set(ctx.currentTeamMember.memberCode, event.data),
                currentTeamMember: ctx.teamMembers[0],
                currentMemberIndex: 1,
            }) }, true];
        }else{
            return [{ state: "switchTeamMates", context: setCtx({ 
                tracingAcc: new Map(ctx.tracingAcc).set(ctx.currentTeamMember.memberCode, event.data),
                currentTeamMember: nextMember,
                currentMemberIndex: nextIndex,
                message: `${nextMember.name}'s Turn`,
                prevState: "tracingAcc"
            }) }, true];
        }
    }
    return [currentState, false];
}

function handleSwitchTeamMates(event: Act6Event, currentState: Act6State, setCtx: (context: Partial<Act6Context>) => Act6Context) : [Act6State, boolean] {
    const ctx = currentState.context
    
    if (event.name === "nextStep") {
    
        return [{ state: ctx.prevState, context: setCtx({ 
            message: "",
        }) }, true];

    }
    return [currentState, false];
}

function handleDominantInstructions(event: Act6Event, currentState: Act6State, setCtx: (context: Partial<Act6Context>) => Act6Context) : [Act6State, boolean] {
    if (event.name === "nextStep") {
        return [{ state: "dominantHandReactionTime", context: setCtx({})}, true];
    }
    return [currentState, false];
}

function handleNonDominantInstructions(event: Act6Event, currentState: Act6State, setCtx: (context: Partial<Act6Context>) => Act6Context) : [Act6State, boolean] {
    if (event.name === "nextStep") {
        return [{ state: "nonDominantHandReactionTime", context: setCtx({})}, true];
    }
    return [currentState, false];
}

function handleTracingInstructions(event: Act6Event, currentState: Act6State, setCtx: (context: Partial<Act6Context>) => Act6Context) : [Act6State, boolean] {
    if (event.name === "nextStep") {
        return [{ state: "tracingAcc", context: setCtx({})}, true];
    }
    return [currentState, false];
}