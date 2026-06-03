import React from 'react';
import { Text, View } from 'react-native';

export default function StarRating({ rating, color }: { rating: number; color: string }) {
    return (
        <View style={{ flexDirection: 'row', gap: 2 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <Text key={i} style={{ fontSize: 12, color: i <= rating ? color : '#CCCCCC' }}>
                    ★
                </Text>
            ))}
        </View>
    );
}