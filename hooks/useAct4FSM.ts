import { Act4Event, Act4State, send } from "@/activityData/FSM/activity4FSM";
import { useState } from "react";

export function useAct4FSM(initialState: Act4State): {
    state: Act4State["state"];
    context: Act4State["context"];
    send: (event: Act4Event) => boolean;
} {
    const [machineState, setMachineState] = useState<Act4State>(initialState);

    function dispatch(event: Act4Event) {
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
