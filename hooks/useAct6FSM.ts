import { useState } from "react";
import { Act6Event, Act6State, send } from "../activityData/FSM/activity6FSM";



export function useAct6FSM(initialState: Act6State) : {
    state: Act6State["state"]
    context: Act6State["context"]
    send: (event: Act6Event) => boolean
} {
    const [machineState, setMachineState] = useState<Act6State>(initialState);

    function dispatch(event: Act6Event) {
        const [nextState, didTransition] = send(event, machineState);
        setMachineState(nextState);
        return didTransition;
    }

    return {
        state: machineState.state,
        context: machineState.context,
        send: dispatch,
    };
}
