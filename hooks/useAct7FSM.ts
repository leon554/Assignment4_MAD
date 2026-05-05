import { Act7Event, Act7State, send } from "@/activityData/FSM/activity7FSM";
import { useState } from "react";




export function useAct7FSM(initialState: Act7State) : {
    state: Act7State["state"]
    context: Act7State["context"]
    send: (event: Act7Event) => boolean
} {
    const [machineState, setMachineState] = useState<Act7State>(initialState);

    function dispatch(event: Act7Event) {
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
