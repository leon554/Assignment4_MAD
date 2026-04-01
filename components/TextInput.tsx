import React, { useState } from 'react';
import {
    TextInput as RNTextInput,
    TextInputProps as RNTextInputProps,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
    ViewStyle,
} from 'react-native';
import { Colors, darkColors, lightColors } from '../theme/theme';

// types

type InputVariant = 'default' | 'error' | 'success' | 'disabled';

interface TextInputProps extends RNTextInputProps {
  /** label shown above the input */
  label?: string;
  /** helper/ error message shown below the input */
  helperText?: string;
  /** visual state of the input */
  variant?: InputVariant;
  /** icon  on the left of input */
  leftIcon?: React.ReactNode;
  /** icon on right of the input */
  rightIcon?: React.ReactNode;
  /** optional - override automatic dark/light detection */
  colors?: Colors;
}

// component

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

  // detects if device is in dark or light mode
  // darkColors or lightColors from theme.ts
  const scheme = useColorScheme();
  const themeColors = colors ?? (scheme === 'dark' ? darkColors : lightColors);

  const isDisabled = variant === 'disabled' || editable === false;

  // border color based on the variant/state of input

  const borderColor = (): string => {
    if (variant === 'error') return themeColors.destructive;
    if (variant === 'success') return themeColors.positive;
    if (isDisabled) return themeColors.border;
    if (isFocused) return themeColors.primary;
    return themeColors.border;
  };

  // helper text color based on the variant

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

      {/* label */}
      {label && (
        <Text style={[styles.label, { color: themeColors.textPrimary }]}>
          {label}
        </Text>
      )}

      {/* input */}
      <View style={containerStyle}>

        {/* left icon */}
        {leftIcon && (
          <View style={styles.leftIcon}>{leftIcon}</View>
        )}

        {/* text input */}
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

        {/* password toggle */}
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

        {/* right icon */}
        {rightIcon && !secureTextEntry && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}

      </View>

      {/* error text */}
      {helperText && (
        <Text style={[styles.helperText, { color: helperColor() }]}>
          {helperText}
        </Text>
      )}

    </View>
  );
};

// styles

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
    padding: 0,  // removes default Android padding
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
