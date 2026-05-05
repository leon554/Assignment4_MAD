
import { Act5Event, Act5State, send } from "@/activityData/FSM/activity5FSM";
import { useState } from "react";

export function useAct5FSM(initialState: Act5State) : {
    state: Act5State["state"]
    context: Act5State["context"]
    send: (event: Act5Event) => boolean
} {
    const [machineState, setMachineState] = useState<Act5State>(initialState);

    function dispatch(event: Act5Event) {
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
