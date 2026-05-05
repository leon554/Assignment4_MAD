import { TeamMember } from "@/types/dbTypes";

export type Act5Context = {
    memberData: Map<string, MovementData>
    teamMembers: TeamMember[]
    currentTeamMember: TeamMember
    currentMemberIndex: number
    message: string
    prevState: Act5State["state"]
};

export type MovementData = {
    avgSpeed: number,
    avgJerk: number,
    maxJerk: number,
    range: number
}

export type Act5State =
    | { state: "start"; context: Act5Context }
    | { state: "movementRecord"; context: Act5Context }
    | { state: "switchTeamMates"; context: Act5Context }
    | { state: "done"; context: Act5Context }

export type Act5Event =
    | { name: "record"; data: MovementData}
    | { name: "nextStep";}


export function getDefaultInitialStateAct5(teamMembers: TeamMember[] | null): Act5State{
    return {
        state: "start",
        context: {
            memberData: new Map<string, MovementData>(),
            teamMembers: [...teamMembers || []],
            currentTeamMember: teamMembers![0],
            currentMemberIndex: 1,
            message: "",
            prevState: "movementRecord"
        }
    }
}  
function setContext(this: Act5Context, context: Partial<Act5Context>): Act5Context {
    return { ...this, ...context };
}

export function send(event: Act5Event, currentState: Act5State): [Act5State, boolean] {
    const setCtx = setContext.bind(currentState.context);

    switch (currentState.state) {
        case "start":
            return handleStart(event, currentState, setCtx)
        case "movementRecord":
            return handleMovementRecord(event, currentState, setCtx)
        case "switchTeamMates":
            return handleSwitchTeamMates(event, currentState, setCtx)
        case "done":
            return [currentState, true]
    }
}

function handleMovementRecord(event: Act5Event, currentState: Act5State, setCtx: (context: Partial<Act5Context>) => Act5Context) : [Act5State, boolean] {
    const ctx = currentState.context
    
    if (event.name === "record") {
        const nextIndex = ctx.currentMemberIndex + 1
        const nextMember = ctx.teamMembers[ctx.currentMemberIndex] 

        if(!nextMember){
            return [{ state: "done", context: setCtx({ 
                memberData: new Map(ctx.memberData).set(ctx.currentTeamMember.memberCode, event.data),
                currentTeamMember: ctx.teamMembers[0],
                currentMemberIndex: 1,
            }) }, true];
        }else{
            return [{ state: "switchTeamMates", context: setCtx({ 
                memberData: new Map(ctx.memberData).set(ctx.currentTeamMember.memberCode, event.data),
                currentTeamMember: nextMember,
                currentMemberIndex: nextIndex,
                message: `${nextMember.name}'s Turn`,
                prevState: "movementRecord"
            }) }, true];
        }

    }
    return [currentState, false];
}

function handleStart(event: Act5Event, currentState: Act5State, setCtx: (context: Partial<Act5Context>) => Act5Context) : [Act5State, boolean] {
    const ctx = currentState.context
    
    if (event.name === "nextStep") {
    
        return [{ state: ctx.prevState, context: setCtx({ 
            message: "",
        }) }, true];

    }
    return [currentState, false];
}

function handleSwitchTeamMates(event: Act5Event, currentState: Act5State, setCtx: (context: Partial<Act5Context>) => Act5Context) : [Act5State, boolean] {
    if (event.name === "nextStep") {
        return [{ state: "movementRecord", context: setCtx({ 
            message: "",
        }) }, true];
    }
    return [currentState, false];
}
