export const palette = {
    purple: '#673AB7',
    purpleLight: '#9C6FE4',
    purpleDark: '#38006B',

    green: '#4CAF50',
    greenLight: '#80E27E',
    greenDark: '#087F23',

    red: '#F44336',
    redLight: '#FF7961',
    redDark: '#BA000D',

    white: '#FFFFFF',
    black: '#000000',

    grey100: '#FAFAFA',
    grey200: '#F5F5F5',
    grey300: '#E0E0E0',
    grey400: '#BDBDBD',
    grey500: '#9E9E9E',
    grey600: '#757575',
    grey700: '#616161',
    grey800: '#424242',
    grey900: '#212121',
} as const;

export type Colors = {
    primary: string;
    primaryLight: string;
    primaryDark: string;

    positive: string;
    positiveLight: string;
    positiveDark: string;
    destructive: string;
    destructiveLight: string;
    destructiveDark: string;

    background: string;
    surface: string;
    surfaceRaised: string;

    textPrimary: string;
    textSecondary: string;
    textDisabled: string;
    textOnPrimary: string;

    border: string;
    borderStrong: string;
};

export const lightColors: Colors = {
    primary: palette.purple,
    primaryLight: palette.purpleLight,
    primaryDark: palette.purpleDark,

    positive: palette.green,
    positiveLight: palette.greenLight,
    positiveDark: palette.greenDark,
    destructive: palette.red,
    destructiveLight: palette.redLight,
    destructiveDark: palette.redDark,

    background: palette.grey100,   
    surface: palette.white,
    surfaceRaised: palette.grey200,

    textPrimary: palette.grey900,
    textSecondary: palette.grey600,
    textDisabled: palette.grey400,
    textOnPrimary: palette.white,

    border: palette.grey300,
    borderStrong: palette.grey400,
};

export const darkColors: Colors = {
    primary: palette.purpleLight,   
    primaryLight: palette.purple,
    primaryDark: palette.purpleDark,

    positive: palette.greenLight,
    positiveLight: palette.green,
    positiveDark: palette.greenDark,
    destructive: palette.redLight,
    destructiveLight: palette.red,
    destructiveDark: palette.redDark,

    background: palette.grey900,  
    surface: palette.grey800,
    surfaceRaised: palette.grey700,

    textPrimary: palette.white,
    textSecondary: palette.grey400,
    textDisabled: palette.grey600,
    textOnPrimary: palette.white,

    border: palette.grey700,
    borderStrong: palette.grey600,
};


