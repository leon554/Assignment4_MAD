import { Act2Event, Act2State, send } from "@/activityData/FSM/activity2FSM";
import { useState } from "react";

export function useAct2FSM(initialState: Act2State): {
    state: Act2State["state"];
    context: Act2State["context"];
    send: (event: Act2Event) => boolean;
} {
    const [machineState, setMachineState] = useState<Act2State>(initialState);

    function dispatch(event: Act2Event) {
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
