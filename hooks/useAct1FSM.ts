import { Act1Event, Act1State, send } from "@/activityData/FSM/activity1FSM";
import { useState } from "react";

export function useAct1FSM(initialState: Act1State): {
    state: Act1State["state"];
    context: Act1State["context"];
    send: (event: Act1Event) => boolean;
} {
    const [machineState, setMachineState] = useState<Act1State>(initialState);

    function dispatch(event: Act1Event) {
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
