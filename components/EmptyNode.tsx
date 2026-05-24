import useColorPalette from '@/hooks/useColorPalette';
import React from 'react';
import { Text } from 'react-native';

export default function EmptyNode({ text }: { text: string }) {
    const colors = useColorPalette()
    return <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{text}</Text>;
}