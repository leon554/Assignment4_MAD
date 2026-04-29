import useColorPalette from '@/hooks/useColorPalette';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface Props {
    handleSubmit: (time: number) => void;
}

type TestState = "waiting" | "ready" | "go" | "done";

export default function ReactionTimeTest({ handleSubmit }: Props) {
    const colors = useColorPalette();
    const [testState, setTestState] = useState<TestState>("waiting");
    const startTime = useRef<number>(0);
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [reactionTime, setLocalReactionTime] = useState(0)

    useEffect(() => {
        return () => {
            if (timeout.current) clearTimeout(timeout.current);
        };
    }, []);

    const handlePress = () => {
        switch (testState) {
            case "waiting":
                setTestState("ready");
                timeout.current = setTimeout(() => {
                    startTime.current = Date.now();
                    setTestState("go");
                }, 2000 + Math.random() * 3000);
                break;

            case "ready":
                clearTimeout(timeout.current!);
                setTestState("waiting");
                break;

            case "go":
               
                setLocalReactionTime(Date.now() - startTime.current)
                setTestState("done");
                break;

            case "done":
                handleSubmit(reactionTime);
                setTestState("waiting");
                break;
        }
    };

    const backgrounds: Record<TestState, string> = {
        waiting: colors.surface,
        ready: "#f59e0b",
        go: "#22c55e",
        done: colors.surface,
    };

    const labels: Record<TestState, string> = {
        waiting: "Tap to start",
        ready: "Wait...",
        go: "TAP NOW!",
        done: `${reactionTime}ms, click to continue`,
    };

    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: backgrounds[testState] }]}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            <Text style={[styles.label, { color: colors.textPrimary }]}>
                {labels[testState]}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: "80%",
        height: 220,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2
    },
    label: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        paddingHorizontal: 16,
    },
});