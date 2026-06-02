import React, { useState } from 'react';
import {
    TextInput as RNTextInput, TextInputProps as RNTextInputProps, StyleSheet, Text, TouchableOpacity,
    useColorScheme, View, ViewStyle,
} from 'react-native';
import { Colors, darkColors, lightColors } from '../theme/theme';

type InputVariant = 'default' | 'error' | 'success' | 'disabled';

interface TextInputProps extends RNTextInputProps {
    label?: string;
    helperText?: string;
    variant?: InputVariant;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    colors?: Colors;
}

export const TextInput: React.FC<TextInputProps> = ({
    label,
    helperText,
    variant = 'default',
    leftIcon,
    rightIcon,
    colors,
    secureTextEntry,
    editable,
    style,
    ...rest
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const scheme = useColorScheme();
    const themeColors = colors ?? (scheme === 'dark' ? darkColors : lightColors);

    const isDisabled = variant === 'disabled' || editable === false;

    const borderColor = (): string => {
        if (variant === 'error') return themeColors.destructive;
        if (variant === 'success') return themeColors.positive;
        if (isDisabled) return themeColors.border;
        if (isFocused) return themeColors.primary;
        return themeColors.border;
    };

    const helperColor = (): string => {
        if (variant === 'error') return themeColors.destructive;
        if (variant === 'success') return themeColors.positive;
        return themeColors.textSecondary;
    };

    const containerStyle: ViewStyle = {
        borderWidth: 1.5,
        borderColor: borderColor(),
        borderRadius: 10,
        backgroundColor: isDisabled ? themeColors.surfaceRaised : themeColors.surface,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
    };

    return (
        <View style={styles.wrapper}>
            {label && (
                <Text style={[styles.label, { color: themeColors.textPrimary }]}>
                    {label}
                </Text>
            )}

            <View style={containerStyle}>
                {leftIcon && (
                    <View style={styles.leftIcon}>{leftIcon}</View>
                )}
                <RNTextInput
                    style={[
                        styles.input,
                        { color: isDisabled ? themeColors.textDisabled : themeColors.textPrimary },
                        style,
                    ]}
                    placeholderTextColor={themeColors.textDisabled}
                    editable={!isDisabled}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...rest}
                />

                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
                        style={styles.rightIcon}
                    >
                        <Text style={{ color: themeColors.textSecondary, fontSize: 13 }}>
                            {isPasswordVisible ? 'Hide' : 'Show'}
                        </Text>
                    </TouchableOpacity>
                )}

                {rightIcon && !secureTextEntry && (
                    <View style={styles.rightIcon}>{rightIcon}</View>
                )}
            </View>

            {helperText && (
                <Text style={[styles.helperText, { color: helperColor() }]}>
                    {helperText}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 0.1,
    },
    input: {
        flex: 1,
        fontSize: 15,
        padding: 0,  
    },
    leftIcon: {
        marginRight: 10,
    },
    rightIcon: {
       marginLeft: 10,
    },
    helperText: {
        fontSize: 12,
        letterSpacing: 0.1,
    },
});
export default TextInput;
