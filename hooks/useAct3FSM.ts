import { Act3Event, Act3State, send } from "@/activityData/FSM/activity3FSM";
import { useState } from "react";

export function useAct3FSM(initialState: Act3State): {
    state: Act3State["state"];
    context: Act3State["context"];
    send: (event: Act3Event) => boolean;
} {
    const [machineState, setMachineState] = useState<Act3State>(initialState);

    function dispatch(event: Act3Event) {
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
