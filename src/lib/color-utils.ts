/**
 * Color conversion utilities for hex, HSV, and HCT color spaces
 */

import type { ColorScheme } from '../types/schema';

export interface HSVColor {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
}

export interface HCTColor {
  h: number; // 0-360
  c: number; // 0-150 (typical range)
  t: number; // 0-100
}

export interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): RGBColor | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

/**
 * Convert RGB to HSV
 */
export function rgbToHsv(r: number, g: number, b: number): HSVColor {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  const s = max === 0 ? 0 : (diff / max) * 100;
  const v = max * 100;

  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff) % 6;
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else {
      h = (r - g) / diff + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h: Math.round(h), s: Math.round(s), v: Math.round(v) };
}

/**
 * Convert HSV to RGB
 */
export function hsvToRgb(h: number, s: number, v: number): RGBColor {
  s /= 100;
  v /= 100;
  
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

/**
 * Convert hex to HSV
 */
export function hexToHsv(hex: string): HSVColor | null {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsv(rgb.r, rgb.g, rgb.b) : null;
}

/**
 * Convert HSV to hex
 */
export function hsvToHex(h: number, s: number, v: number): string {
  const rgb = hsvToRgb(h, s, v);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Convert RGB to HCT (approximate implementation)
 * HCT is Google's perceptually uniform color space
 * This is a simplified version - for production use, consider using @material/material-color-utilities
 */
export function rgbToHct(r: number, g: number, b: number): HCTColor {
  // Convert to linear RGB first
  const linearR = r / 255;
  const linearG = g / 255;
  const linearB = b / 255;

  // Convert to LAB (simplified)
  const x = linearR * 0.4124 + linearG * 0.3576 + linearB * 0.1805;
  const y = linearR * 0.2126 + linearG * 0.7152 + linearB * 0.0722;
  const z = linearR * 0.0193 + linearG * 0.1192 + linearB * 0.9505;

  // Convert to HCT approximation
  const hsv = rgbToHsv(r, g, b);
  
  return {
    h: hsv.h,
    c: Math.round(hsv.s * 1.5), // Approximate chroma mapping
    t: Math.round(y * 100) // Tone approximation
  };
}

/**
 * Convert HCT to RGB (approximate implementation)
 */
export function hctToRgb(h: number, c: number, t: number): RGBColor {
  // This is a simplified conversion
  // For accurate HCT conversion, use @material/material-color-utilities
  const s = Math.min(100, c / 1.5);
  const v = Math.min(100, t + (c * 0.3));
  
  return hsvToRgb(h, s, v);
}

/**
 * Convert hex to HCT
 */
export function hexToHct(hex: string): HCTColor | null {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHct(rgb.r, rgb.g, rgb.b) : null;
}

/**
 * Convert HCT to hex
 */
export function hctToHex(h: number, c: number, t: number): string {
  const rgb = hctToRgb(h, c, t);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Validate hex color
 */
export function isValidHex(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Normalize hex color (convert 3-digit to 6-digit)
 */
export function normalizeHex(hex: string): string {
  if (hex.length === 4) {
    return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  return hex;
}

/**
 * Generate a tonal palette for a given seed color
 * Creates a Material Design 3 compliant tonal palette with tones from 0-100
 */
export function generateTonalPalette(seedHex: string): { "0": string; "5": string; "10": string; "15": string; "20": string; "25": string; "30": string; "35": string; "40": string; "50": string; "60": string; "70": string; "80": string; "90": string; "95": string; "98": string; "99": string; "100": string; } {
  const hct = hexToHct(seedHex);
  if (!hct) {
    // Fallback palette if color conversion fails
    return {
      "0": "#000000",
      "5": "#0D0D0D",
      "10": "#1A1A1A",
      "15": "#262626",
      "20": "#333333",
      "25": "#404040",
      "30": "#4D4D4D",
      "35": "#595959",
      "40": "#666666",
      "50": "#808080",
      "60": "#999999",
      "70": "#B3B3B3",
      "80": "#CCCCCC",
      "90": "#E6E6E6",
      "95": "#F2F2F2",
      "98": "#FAFAFA",
      "99": "#FDFDFD",
      "100": "#FFFFFF"
    } as const;
  }

  // Generate tonal palette using HCT color space
  // Keep hue and chroma constant, vary tone
  const palette: { [key: string]: string } = {};
  const tones = [0, 5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100];
  
  tones.forEach(tone => {
    // Adjust chroma based on tone for better color harmony
    let adjustedChroma = hct.c;
    
    // Reduce chroma at extreme tones for better perceptual uniformity
    if (tone <= 10 || tone >= 95) {
      adjustedChroma = Math.max(0, hct.c * 0.1);
    } else if (tone <= 20 || tone >= 90) {
      adjustedChroma = Math.max(0, hct.c * 0.3);
    } else if (tone <= 30 || tone >= 80) {
      adjustedChroma = Math.max(0, hct.c * 0.6);
    }
    
    palette[tone.toString()] = hctToHex(hct.h, adjustedChroma, tone);
  });

  return palette as { "0": string; "5": string; "10": string; "15": string; "20": string; "25": string; "30": string; "35": string; "40": string; "50": string; "60": string; "70": string; "80": string; "90": string; "95": string; "98": string; "99": string; "100": string; };
}

/**
 * Generate all palettes needed for Material Theme Builder format
 */
export function generateAllPalettes(primarySeed: string, secondarySeed: string, tertiarySeed: string, neutralSeed: string) {
  return {
    primary: generateTonalPalette(primarySeed),
    secondary: generateTonalPalette(secondarySeed),
    tertiary: generateTonalPalette(tertiarySeed),
    neutral: generateTonalPalette(neutralSeed),
    "neutral-variant": generateTonalPalette(neutralSeed) // Use neutral seed for neutral-variant
  };
}

/**
 * Generate contrast scheme variants based on base light/dark schemes
 */
export function generateContrastSchemes(lightScheme: ColorScheme, darkScheme: ColorScheme) {
  // Helper function to adjust color brightness
  const adjustBrightness = (hex: string, factor: number): string => {
    const hct = hexToHct(hex);
    if (!hct) return hex;
    
    const newTone = Math.max(0, Math.min(100, hct.t * factor));
    return hctToHex(hct.h, hct.c, newTone);
  };

  // Helper function to increase contrast
  const increaseContrast = (hex: string, isLight: boolean, factor: number): string => {
    const hct = hexToHct(hex);
    if (!hct) return hex;
    
    let newTone = hct.t;
    if (isLight) {
      newTone = Math.max(0, hct.t - (factor * 20));
    } else {
      newTone = Math.min(100, hct.t + (factor * 20));
    }
    
    return hctToHex(hct.h, hct.c, newTone);
  };

  // Create properly typed ColorScheme objects
  const lightMediumContrast: ColorScheme = {
    primary: increaseContrast(lightScheme.primary, true, 0.5),
    onPrimary: increaseContrast(lightScheme.onPrimary, true, 0.5),
    primaryContainer: increaseContrast(lightScheme.primaryContainer, true, 0.5),
    onPrimaryContainer: increaseContrast(lightScheme.onPrimaryContainer, true, 0.5),
    secondary: increaseContrast(lightScheme.secondary, true, 0.5),
    onSecondary: increaseContrast(lightScheme.onSecondary, true, 0.5),
    secondaryContainer: increaseContrast(lightScheme.secondaryContainer, true, 0.5),
    onSecondaryContainer: increaseContrast(lightScheme.onSecondaryContainer, true, 0.5),
    tertiary: increaseContrast(lightScheme.tertiary, true, 0.5),
    onTertiary: increaseContrast(lightScheme.onTertiary, true, 0.5),
    tertiaryContainer: increaseContrast(lightScheme.tertiaryContainer, true, 0.5),
    onTertiaryContainer: increaseContrast(lightScheme.onTertiaryContainer, true, 0.5),
    error: increaseContrast(lightScheme.error, true, 0.5),
    onError: increaseContrast(lightScheme.onError, true, 0.5),
    errorContainer: increaseContrast(lightScheme.errorContainer, true, 0.5),
    onErrorContainer: increaseContrast(lightScheme.onErrorContainer, true, 0.5),
    surface: increaseContrast(lightScheme.surface, true, 0.5),
    onSurface: increaseContrast(lightScheme.onSurface, true, 0.5),
    surfaceVariant: increaseContrast(lightScheme.surfaceVariant, true, 0.5),
    onSurfaceVariant: increaseContrast(lightScheme.onSurfaceVariant, true, 0.5),
    surfaceDim: increaseContrast(lightScheme.surfaceDim, true, 0.5),
    surfaceBright: increaseContrast(lightScheme.surfaceBright, true, 0.5),
    surfaceContainer: increaseContrast(lightScheme.surfaceContainer, true, 0.5),
    surfaceContainerLow: increaseContrast(lightScheme.surfaceContainerLow, true, 0.5),
    surfaceContainerHigh: increaseContrast(lightScheme.surfaceContainerHigh, true, 0.5),
    surfaceContainerHighest: increaseContrast(lightScheme.surfaceContainerHighest, true, 0.5),
    surfaceContainerLowest: increaseContrast(lightScheme.surfaceContainerLowest, true, 0.5),
    background: increaseContrast(lightScheme.background, true, 0.5),
    onBackground: increaseContrast(lightScheme.onBackground, true, 0.5),
    outline: increaseContrast(lightScheme.outline, true, 0.5),
    outlineVariant: increaseContrast(lightScheme.outlineVariant, true, 0.5),
    
    // Additional Material 3 colors
    surfaceTint: increaseContrast(lightScheme.surfaceTint, true, 0.5),
    shadow: lightScheme.shadow,
    scrim: lightScheme.scrim,
    inverseSurface: increaseContrast(lightScheme.inverseSurface, true, 0.5),
    inverseOnSurface: increaseContrast(lightScheme.inverseOnSurface, true, 0.5),
    inversePrimary: increaseContrast(lightScheme.inversePrimary, true, 0.5),
    
    // Fixed colors
    primaryFixed: increaseContrast(lightScheme.primaryFixed, true, 0.5),
    onPrimaryFixed: increaseContrast(lightScheme.onPrimaryFixed, true, 0.5),
    primaryFixedDim: increaseContrast(lightScheme.primaryFixedDim, true, 0.5),
    onPrimaryFixedVariant: increaseContrast(lightScheme.onPrimaryFixedVariant, true, 0.5),
    
    secondaryFixed: increaseContrast(lightScheme.secondaryFixed, true, 0.5),
    onSecondaryFixed: increaseContrast(lightScheme.onSecondaryFixed, true, 0.5),
    secondaryFixedDim: increaseContrast(lightScheme.secondaryFixedDim, true, 0.5),
    onSecondaryFixedVariant: increaseContrast(lightScheme.onSecondaryFixedVariant, true, 0.5),
    
    tertiaryFixed: increaseContrast(lightScheme.tertiaryFixed, true, 0.5),
    onTertiaryFixed: increaseContrast(lightScheme.onTertiaryFixed, true, 0.5),
    tertiaryFixedDim: increaseContrast(lightScheme.tertiaryFixedDim, true, 0.5),
    onTertiaryFixedVariant: increaseContrast(lightScheme.onTertiaryFixedVariant, true, 0.5),
  };

  const lightHighContrast: ColorScheme = {
    primary: increaseContrast(lightScheme.primary, true, 1.0),
    onPrimary: increaseContrast(lightScheme.onPrimary, true, 1.0),
    primaryContainer: increaseContrast(lightScheme.primaryContainer, true, 1.0),
    onPrimaryContainer: increaseContrast(lightScheme.onPrimaryContainer, true, 1.0),
    secondary: increaseContrast(lightScheme.secondary, true, 1.0),
    onSecondary: increaseContrast(lightScheme.onSecondary, true, 1.0),
    secondaryContainer: increaseContrast(lightScheme.secondaryContainer, true, 1.0),
    onSecondaryContainer: increaseContrast(lightScheme.onSecondaryContainer, true, 1.0),
    tertiary: increaseContrast(lightScheme.tertiary, true, 1.0),
    onTertiary: increaseContrast(lightScheme.onTertiary, true, 1.0),
    tertiaryContainer: increaseContrast(lightScheme.tertiaryContainer, true, 1.0),
    onTertiaryContainer: increaseContrast(lightScheme.onTertiaryContainer, true, 1.0),
    error: increaseContrast(lightScheme.error, true, 1.0),
    onError: increaseContrast(lightScheme.onError, true, 1.0),
    errorContainer: increaseContrast(lightScheme.errorContainer, true, 1.0),
    onErrorContainer: increaseContrast(lightScheme.onErrorContainer, true, 1.0),
    surface: increaseContrast(lightScheme.surface, true, 1.0),
    onSurface: increaseContrast(lightScheme.onSurface, true, 1.0),
    surfaceVariant: increaseContrast(lightScheme.surfaceVariant, true, 1.0),
    onSurfaceVariant: increaseContrast(lightScheme.onSurfaceVariant, true, 1.0),
    surfaceDim: increaseContrast(lightScheme.surfaceDim, true, 1.0),
    surfaceBright: increaseContrast(lightScheme.surfaceBright, true, 1.0),
    surfaceContainer: increaseContrast(lightScheme.surfaceContainer, true, 1.0),
    surfaceContainerLow: increaseContrast(lightScheme.surfaceContainerLow, true, 1.0),
    surfaceContainerHigh: increaseContrast(lightScheme.surfaceContainerHigh, true, 1.0),
    surfaceContainerHighest: increaseContrast(lightScheme.surfaceContainerHighest, true, 1.0),
    surfaceContainerLowest: increaseContrast(lightScheme.surfaceContainerLowest, true, 1.0),
    background: increaseContrast(lightScheme.background, true, 1.0),
    onBackground: increaseContrast(lightScheme.onBackground, true, 1.0),
    outline: increaseContrast(lightScheme.outline, true, 1.0),
    outlineVariant: increaseContrast(lightScheme.outlineVariant, true, 1.0),
    
    // Additional Material 3 colors
    surfaceTint: increaseContrast(lightScheme.surfaceTint, true, 1.0),
    shadow: lightScheme.shadow,
    scrim: lightScheme.scrim,
    inverseSurface: increaseContrast(lightScheme.inverseSurface, true, 1.0),
    inverseOnSurface: increaseContrast(lightScheme.inverseOnSurface, true, 1.0),
    inversePrimary: increaseContrast(lightScheme.inversePrimary, true, 1.0),
    
    // Fixed colors
    primaryFixed: increaseContrast(lightScheme.primaryFixed, true, 1.0),
    onPrimaryFixed: increaseContrast(lightScheme.onPrimaryFixed, true, 1.0),
    primaryFixedDim: increaseContrast(lightScheme.primaryFixedDim, true, 1.0),
    onPrimaryFixedVariant: increaseContrast(lightScheme.onPrimaryFixedVariant, true, 1.0),
    
    secondaryFixed: increaseContrast(lightScheme.secondaryFixed, true, 1.0),
    onSecondaryFixed: increaseContrast(lightScheme.onSecondaryFixed, true, 1.0),
    secondaryFixedDim: increaseContrast(lightScheme.secondaryFixedDim, true, 1.0),
    onSecondaryFixedVariant: increaseContrast(lightScheme.onSecondaryFixedVariant, true, 1.0),
    
    tertiaryFixed: increaseContrast(lightScheme.tertiaryFixed, true, 1.0),
    onTertiaryFixed: increaseContrast(lightScheme.onTertiaryFixed, true, 1.0),
    tertiaryFixedDim: increaseContrast(lightScheme.tertiaryFixedDim, true, 1.0),
    onTertiaryFixedVariant: increaseContrast(lightScheme.onTertiaryFixedVariant, true, 1.0),
  };

  const darkMediumContrast: ColorScheme = {
    primary: increaseContrast(darkScheme.primary, false, 0.5),
    onPrimary: increaseContrast(darkScheme.onPrimary, false, 0.5),
    primaryContainer: increaseContrast(darkScheme.primaryContainer, false, 0.5),
    onPrimaryContainer: increaseContrast(darkScheme.onPrimaryContainer, false, 0.5),
    secondary: increaseContrast(darkScheme.secondary, false, 0.5),
    onSecondary: increaseContrast(darkScheme.onSecondary, false, 0.5),
    secondaryContainer: increaseContrast(darkScheme.secondaryContainer, false, 0.5),
    onSecondaryContainer: increaseContrast(darkScheme.onSecondaryContainer, false, 0.5),
    tertiary: increaseContrast(darkScheme.tertiary, false, 0.5),
    onTertiary: increaseContrast(darkScheme.onTertiary, false, 0.5),
    tertiaryContainer: increaseContrast(darkScheme.tertiaryContainer, false, 0.5),
    onTertiaryContainer: increaseContrast(darkScheme.onTertiaryContainer, false, 0.5),
    error: increaseContrast(darkScheme.error, false, 0.5),
    onError: increaseContrast(darkScheme.onError, false, 0.5),
    errorContainer: increaseContrast(darkScheme.errorContainer, false, 0.5),
    onErrorContainer: increaseContrast(darkScheme.onErrorContainer, false, 0.5),
    surface: increaseContrast(darkScheme.surface, false, 0.5),
    onSurface: increaseContrast(darkScheme.onSurface, false, 0.5),
    surfaceVariant: increaseContrast(darkScheme.surfaceVariant, false, 0.5),
    onSurfaceVariant: increaseContrast(darkScheme.onSurfaceVariant, false, 0.5),
    surfaceDim: increaseContrast(darkScheme.surfaceDim, false, 0.5),
    surfaceBright: increaseContrast(darkScheme.surfaceBright, false, 0.5),
    surfaceContainer: increaseContrast(darkScheme.surfaceContainer, false, 0.5),
    surfaceContainerLow: increaseContrast(darkScheme.surfaceContainerLow, false, 0.5),
    surfaceContainerHigh: increaseContrast(darkScheme.surfaceContainerHigh, false, 0.5),
    surfaceContainerHighest: increaseContrast(darkScheme.surfaceContainerHighest, false, 0.5),
    surfaceContainerLowest: increaseContrast(darkScheme.surfaceContainerLowest, false, 0.5),
    background: increaseContrast(darkScheme.background, false, 0.5),
    onBackground: increaseContrast(darkScheme.onBackground, false, 0.5),
    outline: increaseContrast(darkScheme.outline, false, 0.5),
    outlineVariant: increaseContrast(darkScheme.outlineVariant, false, 0.5),
    
    // Additional Material 3 colors
    surfaceTint: increaseContrast(darkScheme.surfaceTint, false, 0.5),
    shadow: darkScheme.shadow,
    scrim: darkScheme.scrim,
    inverseSurface: increaseContrast(darkScheme.inverseSurface, false, 0.5),
    inverseOnSurface: increaseContrast(darkScheme.inverseOnSurface, false, 0.5),
    inversePrimary: increaseContrast(darkScheme.inversePrimary, false, 0.5),
    
    // Fixed colors
    primaryFixed: increaseContrast(darkScheme.primaryFixed, false, 0.5),
    onPrimaryFixed: increaseContrast(darkScheme.onPrimaryFixed, false, 0.5),
    primaryFixedDim: increaseContrast(darkScheme.primaryFixedDim, false, 0.5),
    onPrimaryFixedVariant: increaseContrast(darkScheme.onPrimaryFixedVariant, false, 0.5),
    
    secondaryFixed: increaseContrast(darkScheme.secondaryFixed, false, 0.5),
    onSecondaryFixed: increaseContrast(darkScheme.onSecondaryFixed, false, 0.5),
    secondaryFixedDim: increaseContrast(darkScheme.secondaryFixedDim, false, 0.5),
    onSecondaryFixedVariant: increaseContrast(darkScheme.onSecondaryFixedVariant, false, 0.5),
    
    tertiaryFixed: increaseContrast(darkScheme.tertiaryFixed, false, 0.5),
    onTertiaryFixed: increaseContrast(darkScheme.onTertiaryFixed, false, 0.5),
    tertiaryFixedDim: increaseContrast(darkScheme.tertiaryFixedDim, false, 0.5),
    onTertiaryFixedVariant: increaseContrast(darkScheme.onTertiaryFixedVariant, false, 0.5),
  };

  const darkHighContrast: ColorScheme = {
    primary: increaseContrast(darkScheme.primary, false, 1.0),
    onPrimary: increaseContrast(darkScheme.onPrimary, false, 1.0),
    primaryContainer: increaseContrast(darkScheme.primaryContainer, false, 1.0),
    onPrimaryContainer: increaseContrast(darkScheme.onPrimaryContainer, false, 1.0),
    secondary: increaseContrast(darkScheme.secondary, false, 1.0),
    onSecondary: increaseContrast(darkScheme.onSecondary, false, 1.0),
    secondaryContainer: increaseContrast(darkScheme.secondaryContainer, false, 1.0),
    onSecondaryContainer: increaseContrast(darkScheme.onSecondaryContainer, false, 1.0),
    tertiary: increaseContrast(darkScheme.tertiary, false, 1.0),
    onTertiary: increaseContrast(darkScheme.onTertiary, false, 1.0),
    tertiaryContainer: increaseContrast(darkScheme.tertiaryContainer, false, 1.0),
    onTertiaryContainer: increaseContrast(darkScheme.onTertiaryContainer, false, 1.0),
    error: increaseContrast(darkScheme.error, false, 1.0),
    onError: increaseContrast(darkScheme.onError, false, 1.0),
    errorContainer: increaseContrast(darkScheme.errorContainer, false, 1.0),
    onErrorContainer: increaseContrast(darkScheme.onErrorContainer, false, 1.0),
    surface: increaseContrast(darkScheme.surface, false, 1.0),
    onSurface: increaseContrast(darkScheme.onSurface, false, 1.0),
    surfaceVariant: increaseContrast(darkScheme.surfaceVariant, false, 1.0),
    onSurfaceVariant: increaseContrast(darkScheme.onSurfaceVariant, false, 1.0),
    surfaceDim: increaseContrast(darkScheme.surfaceDim, false, 1.0),
    surfaceBright: increaseContrast(darkScheme.surfaceBright, false, 1.0),
    surfaceContainer: increaseContrast(darkScheme.surfaceContainer, false, 1.0),
    surfaceContainerLow: increaseContrast(darkScheme.surfaceContainerLow, false, 1.0),
    surfaceContainerHigh: increaseContrast(darkScheme.surfaceContainerHigh, false, 1.0),
    surfaceContainerHighest: increaseContrast(darkScheme.surfaceContainerHighest, false, 1.0),
    surfaceContainerLowest: increaseContrast(darkScheme.surfaceContainerLowest, false, 1.0),
    background: increaseContrast(darkScheme.background, false, 1.0),
    onBackground: increaseContrast(darkScheme.onBackground, false, 1.0),
    outline: increaseContrast(darkScheme.outline, false, 1.0),
    outlineVariant: increaseContrast(darkScheme.outlineVariant, false, 1.0),
    
    // Additional Material 3 colors
    surfaceTint: increaseContrast(darkScheme.surfaceTint, false, 1.0),
    shadow: darkScheme.shadow,
    scrim: darkScheme.scrim,
    inverseSurface: increaseContrast(darkScheme.inverseSurface, false, 1.0),
    inverseOnSurface: increaseContrast(darkScheme.inverseOnSurface, false, 1.0),
    inversePrimary: increaseContrast(darkScheme.inversePrimary, false, 1.0),
    
    // Fixed colors
    primaryFixed: increaseContrast(darkScheme.primaryFixed, false, 1.0),
    onPrimaryFixed: increaseContrast(darkScheme.onPrimaryFixed, false, 1.0),
    primaryFixedDim: increaseContrast(darkScheme.primaryFixedDim, false, 1.0),
    onPrimaryFixedVariant: increaseContrast(darkScheme.onPrimaryFixedVariant, false, 1.0),
    
    secondaryFixed: increaseContrast(darkScheme.secondaryFixed, false, 1.0),
    onSecondaryFixed: increaseContrast(darkScheme.onSecondaryFixed, false, 1.0),
    secondaryFixedDim: increaseContrast(darkScheme.secondaryFixedDim, false, 1.0),
    onSecondaryFixedVariant: increaseContrast(darkScheme.onSecondaryFixedVariant, false, 1.0),
    
    tertiaryFixed: increaseContrast(darkScheme.tertiaryFixed, false, 1.0),
    onTertiaryFixed: increaseContrast(darkScheme.onTertiaryFixed, false, 1.0),
    tertiaryFixedDim: increaseContrast(darkScheme.tertiaryFixedDim, false, 1.0),
    onTertiaryFixedVariant: increaseContrast(darkScheme.onTertiaryFixedVariant, false, 1.0),
  };

  return {
    "light-medium-contrast": lightMediumContrast,
    "light-high-contrast": lightHighContrast,
    "dark-medium-contrast": darkMediumContrast,
    "dark-high-contrast": darkHighContrast
  };
}
