import { TeamMember } from "@/types/dbTypes";

export type Act7Context = {
    restBreathing: Map<string, number>
    activityBreathing: Map<string, number>
    teamMembers: TeamMember[]
    currentTeamMember: TeamMember
    currentMemberIndex: number
    message: string
    prevState: Act7State["state"]
};

export type Act7State =
    | { state: "restInstructions"; context: Act7Context }
    | { state: "restBreathingRecord"; context: Act7Context }
    | { state: "activityInstructions"; context: Act7Context }
    | { state: "activityBreathingRecord"; context: Act7Context }
    | { state: "switchTeamMates"; context: Act7Context }
    | { state: "done"; context: Act7Context }

export type Act7Event =
    | { name: "record"; data: number}
    | { name: "nextStep";}


export function getDefaultInitialStateAct7(teamMembers: TeamMember[] | null): Act7State{
    return {
        state: "restInstructions",
        context: {
            restBreathing: new Map<string, number>(),
            activityBreathing: new Map<string, number>(),
            teamMembers: [...teamMembers || []],
            currentTeamMember: teamMembers![0],
            currentMemberIndex: 1,
            message: "",
            prevState: "restInstructions"
        }
    }
}  
function setContext(this: Act7Context, context: Partial<Act7Context>): Act7Context {
    return { ...this, ...context };
}

export function send(event: Act7Event, currentState: Act7State): [Act7State, boolean] {
    const setCtx = setContext.bind(currentState.context);

    switch (currentState.state) {
        case "restBreathingRecord":
            return handleRestBreathingRecord(event, currentState, setCtx)
        case "activityBreathingRecord":
            return handleActivityBreathingRecord(event, currentState, setCtx)
        case "switchTeamMates":
            return handleSwitchTeamMates(event, currentState, setCtx)
        case "restInstructions":
            return handleRestInstructions(event, currentState, setCtx)
        case "activityInstructions":
            return handleActivityInstructions(event, currentState, setCtx)
        case "done":
            return [currentState, true]
    }
}

function handleRestBreathingRecord(event: Act7Event, currentState: Act7State, setCtx: (context: Partial<Act7Context>) => Act7Context) : [Act7State, boolean] {
    const ctx = currentState.context
    
    if (event.name === "record") {
        const nextIndex = ctx.currentMemberIndex + 1
        const nextMember = ctx.teamMembers[ctx.currentMemberIndex] 

        if(!nextMember){
            return [{ state: "activityInstructions", context: setCtx({ 
                restBreathing: new Map(ctx.restBreathing).set(ctx.currentTeamMember.memberCode, event.data),
                currentTeamMember: ctx.teamMembers[0],
                currentMemberIndex: 1,
            }) }, true];
        }else{
            return [{ state: "switchTeamMates", context: setCtx({ 
                restBreathing: new Map(ctx.restBreathing).set(ctx.currentTeamMember.memberCode, event.data),
                currentTeamMember: nextMember,
                currentMemberIndex: nextIndex,
                message: `${nextMember.name}'s Turn`,
                prevState: "restBreathingRecord"
            }) }, true];
        }

    }
    return [currentState, false];
}

function handleActivityBreathingRecord(event: Act7Event, currentState: Act7State, setCtx: (context: Partial<Act7Context>) => Act7Context) : [Act7State, boolean] {
    const ctx = currentState.context
    
    if (event.name === "record") {
        const nextIndex = ctx.currentMemberIndex + 1
        const nextMember = ctx.teamMembers[ctx.currentMemberIndex]

        if(!nextMember){
            return [{ state: "done", context: setCtx({ 
                activityBreathing: new Map(ctx.activityBreathing).set(ctx.currentTeamMember.memberCode, event.data),
                currentTeamMember: ctx.teamMembers[0],
                currentMemberIndex: 1,
            }) }, true];
        }else{
            return [{ state: "switchTeamMates", context: setCtx({ 
                activityBreathing: new Map(ctx.activityBreathing).set(ctx.currentTeamMember.memberCode, event.data),
                currentTeamMember: nextMember,
                currentMemberIndex: nextIndex,
                message: `${nextMember.name}'s Turn`,
                prevState: "activityBreathingRecord"
            }) }, true];
        }

    }
    return [currentState, false];
}

function handleSwitchTeamMates(event: Act7Event, currentState: Act7State, setCtx: (context: Partial<Act7Context>) => Act7Context) : [Act7State, boolean] {
    const ctx = currentState.context
    
    if (event.name === "nextStep") {
    
        return [{ state: ctx.prevState, context: setCtx({ 
            message: "",
        }) }, true];

    }
    return [currentState, false];
}

function handleRestInstructions(event: Act7Event, currentState: Act7State, setCtx: (context: Partial<Act7Context>) => Act7Context) : [Act7State, boolean] {
    if (event.name === "nextStep") {
        return [{ state: "restBreathingRecord", context: setCtx({})}, true];
    }
    return [currentState, false];
}

function handleActivityInstructions(event: Act7Event, currentState: Act7State, setCtx: (context: Partial<Act7Context>) => Act7Context) : [Act7State, boolean] {
    if (event.name === "nextStep") {
        return [{ state: "activityBreathingRecord", context: setCtx({})}, true];
    }
    return [currentState, false];
}
