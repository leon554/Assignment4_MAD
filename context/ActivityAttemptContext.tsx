import React, { createContext, useContext, useState } from 'react';

interface ActivityAttemptContext {
    currentActivityId: string;
    currentAttemptId: string;
    attemptData: Map<string, any>;
    setCurrentActivityId: (id: string) => void;
    setCurrentAttemptId: (id: string) => void;
    setAttemptData: (data: Map<string, any>) => void;
    setAttemptDataValue: (key: string, value: any) => void;
}

const ActivityAttemptContext = createContext<ActivityAttemptContext>({
    currentActivityId: "",
    currentAttemptId: "",
    attemptData: new Map<string, any>(),
    setCurrentActivityId: () => {},
    setCurrentAttemptId: () => {},
    setAttemptData: () => {},
    setAttemptDataValue: () => {},
});

export const ActivityAttemptProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentActivityId, setCurrentActivityId] = useState("");
    const [currentAttemptId, setCurrentAttemptId] = useState("");
    const [attemptData, setAttemptData] = useState<Map<string, any>>(new Map());

    const setAttemptDataValue = (key: string, value: any) => {
        setAttemptData(prev => new Map(prev).set(key, value));
    };

    return (
        <ActivityAttemptContext.Provider value={{
            currentActivityId,
            currentAttemptId,
            attemptData,
            setCurrentActivityId,
            setCurrentAttemptId,
            setAttemptData,
            setAttemptDataValue,
        }}>
            {children}
        </ActivityAttemptContext.Provider>
    );
};

export const useActivityAttempt = () => useContext(ActivityAttemptContext);