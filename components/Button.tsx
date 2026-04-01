import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  useColorScheme,
  ViewStyle,
} from 'react-native';
import { Colors, darkColors, lightColors } from '../theme/theme';

// types

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  /** button */
  label: string;
  /** visual style */
  variant?: ButtonVariant;
  /** size preset */
  size?: ButtonSize;
  /** loading and disable */
  loading?: boolean;
  /** full width of parent fill */
  fullWidth?: boolean;
  /** icon shown to the left of the label */
  leftIcon?: React.ReactNode;
  /** icon shown to the right of the label */
  rightIcon?: React.ReactNode;
  /** optional override automatic dark/light detection */
  colors?: Colors;
}

// component

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  colors,
  disabled,
  style,
  ...rest
}) => {
  // detects if device is in dark or light mode
  // darkColors or lightColors from theme.ts
  const scheme = useColorScheme();
  const themeColors = colors ?? (scheme === 'dark' ? darkColors : lightColors);

  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle[] = [
    styles.base,
    sizeStyles(size).container,
    variantContainerStyle(variant, themeColors),
    fullWidth ? styles.fullWidth : {},
    isDisabled ? styles.disabled : {},
    style as ViewStyle,
  ];

  const textStyle: TextStyle[] = [
    styles.label,
    sizeStyles(size).label,
    variantTextStyle(variant, themeColors),
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={isDisabled}
      style={containerStyle}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? themeColors.textOnPrimary : themeColors.primary}
        />
      ) : (
        <>
          {leftIcon}
          <Text style={textStyle}>{label}</Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

// varient

function variantContainerStyle(variant: ButtonVariant, c: Colors): ViewStyle {
  switch (variant) {
    case 'primary':
      return { backgroundColor: c.primary };
    case 'secondary':
      return { backgroundColor: c.surfaceRaised };
    case 'outline':
      return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: c.primary };
    case 'ghost':
      return { backgroundColor: 'transparent' };
    case 'destructive':
      return { backgroundColor: c.destructive };
  }
}

function variantTextStyle(variant: ButtonVariant, c: Colors): TextStyle {
  switch (variant) {
    case 'primary':
      return { color: c.textOnPrimary };
    case 'secondary':
      return { color: c.textPrimary };
    case 'outline':
      return { color: c.primary };
    case 'ghost':
      return { color: c.primary };
    case 'destructive':
      return { color: c.textOnPrimary };
  }
}

// sizing

function sizeStyles(size: ButtonSize): { container: ViewStyle; label: TextStyle } {
  switch (size) {
    case 'sm':
      return {
        container: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, gap: 6 },
        label: { fontSize: 13, lineHeight: 18 },
      };
    case 'md':
      return {
        container: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, gap: 8 },
        label: { fontSize: 15, lineHeight: 22 },
      };
    case 'lg':
      return {
        container: { paddingVertical: 18, paddingHorizontal: 32, borderRadius: 14, gap: 10 },
        label: { fontSize: 17, lineHeight: 24 },
      };
  }
}

// base styles  

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default Button;