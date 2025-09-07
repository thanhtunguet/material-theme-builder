// Schema types for theme builder
import type { ExtendedTagName } from '../theme/extended-tags.generated';

export interface ExtendedColor {
  name: ExtendedTagName;
  color: string;
  description: string;
  fallback: string;
  harmonized: false;
}

export interface ColorScheme {
  // Primary colors
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  
  // Secondary colors
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  
  // Tertiary colors
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  
  // Error colors
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  
  // Surface colors
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainer: string;
  surfaceContainerLow: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  surfaceContainerLowest: string;
  
  // Background colors
  background: string;
  onBackground: string;
  
  // Outline colors
  outline: string;
  outlineVariant: string;
  
  // Additional Material 3 colors
  surfaceTint: string;
  shadow: string;
  scrim: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
  
  // Fixed colors
  primaryFixed: string;
  onPrimaryFixed: string;
  primaryFixedDim: string;
  onPrimaryFixedVariant: string;
  
  secondaryFixed: string;
  onSecondaryFixed: string;
  secondaryFixedDim: string;
  onSecondaryFixedVariant: string;
  
  tertiaryFixed: string;
  onTertiaryFixed: string;
  tertiaryFixedDim: string;
  onTertiaryFixedVariant: string;

}

// Core colors for Material Theme Builder
export interface CoreColors {
  primary: string;
  secondary: string;
  tertiary: string;
  neutral: string;
}

// Tonal palette for a single color family
export interface TonalPalette {
  "0": string;
  "5": string;
  "10": string;
  "15": string;
  "20": string;
  "25": string;
  "30": string;
  "35": string;
  "40": string;
  "50": string;
  "60": string;
  "70": string;
  "80": string;
  "90": string;
  "95": string;
  "98": string;
  "99": string;
  "100": string;
}

// All tonal palettes
export interface Palettes {
  primary: TonalPalette;
  secondary: TonalPalette;
  tertiary: TonalPalette;
  neutral: TonalPalette;
  "neutral-variant": TonalPalette;
}

// Enhanced theme schemes with all contrast variants
export interface ThemeSchemes {
  light: ColorScheme;
  "light-medium-contrast": ColorScheme;
  "light-high-contrast": ColorScheme;
  dark: ColorScheme;
  "dark-medium-contrast": ColorScheme;
  "dark-high-contrast": ColorScheme;
}

// Material Theme Builder export format
export interface ThemeExport {
  description: string;
  seed: string;
  coreColors: CoreColors;
  extendedColors: ExtendedColor[];
  schemes: ThemeSchemes;
  palettes: Palettes;
  timestamp: string;
}

// Legacy format for backward compatibility
export interface LegacyThemeExport {
  themeName: string;
  seed: string;
  schemes: {
    light: ColorScheme;
    dark: ColorScheme;
  };
  extendedColors: ExtendedColor[];
  timestamp: string;
}

// Helper function to extract theme name from Material Theme Builder format
export function getThemeNameFromExport(theme: ThemeExport | LegacyThemeExport): string {
  if ('themeName' in theme) {
    // Legacy format
    return theme.themeName;
  } else if ('description' in theme) {
    // New Material Theme Builder format
    const match = theme.description?.match(/TYPE:\s*(\w+)/);
    return match ? `${match[1]} Theme` : 'Custom Theme';
  }
  return 'Custom Theme';
}

export interface SavedTheme extends ThemeExport {
  id: string;
  createdAt: string;
  updatedAt: string;
  isAutoSave?: boolean;
  // For backward compatibility
  themeName?: string;
}