import { ColorScheme } from "@/types/schema";

// Helper function to convert hex to HSL
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

// Helper function to convert HSL to hex
function hslToHex(h: number, s: number, l: number): string {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Generate tonal palette from a base color
function generateTonalPalette(baseColor: string, lightness: number): string {
  const [h, s] = hexToHsl(baseColor);
  return hslToHex(h, s, lightness);
}

export function getDefaultTheme(variant: "light" | "dark", seedColor = "#0E5DF7"): ColorScheme {
  const [h, s] = hexToHsl(seedColor);

  if (variant === "light") {
    return {
      // Primary colors
      primary: seedColor,
      onPrimary: "#FFFFFF",
      primaryContainer: generateTonalPalette(seedColor, 90),
      onPrimaryContainer: generateTonalPalette(seedColor, 10),

      // Secondary colors
      secondary: "#625B71",
      onSecondary: "#FFFFFF",
      secondaryContainer: "#E8DEF8",
      onSecondaryContainer: "#1E192B",

      // Tertiary colors
      tertiary: "#7D5260",
      onTertiary: "#FFFFFF",
      tertiaryContainer: "#FFD8E4",
      onTertiaryContainer: "#31111D",

      // Error colors
      error: "#BA1A1A",
      onError: "#FFFFFF",
      errorContainer: "#FFDAD6",
      onErrorContainer: "#410002",

      // Surface colors
      surface: "#FFFBFE",
      onSurface: "#1C1B1F",
      surfaceVariant: "#E7E0EC",
      onSurfaceVariant: "#49454F",
      surfaceDim: "#DDD8DD",
      surfaceBright: "#FFFBFE",
      surfaceContainer: "#F3EDF7",
      surfaceContainerLow: "#F7F2FA",
      surfaceContainerHigh: "#ECE6F0",
      surfaceContainerHighest: "#E6E0E9",
      surfaceContainerLowest: "#FFFFFF",

      // Background colors
      background: "#FFFBFE",
      onBackground: "#1C1B1F",

      // Outline colors
      outline: "#79747E",
      outlineVariant: "#CAC4D0",
      
      // Additional Material 3 colors
      surfaceTint: seedColor,
      shadow: "#000000",
      scrim: "#000000",
      inverseSurface: "#313030",
      inverseOnSurface: "#F4F0EF",
      inversePrimary: generateTonalPalette(seedColor, 80),
      
      // Fixed colors
      primaryFixed: generateTonalPalette(seedColor, 90),
      onPrimaryFixed: generateTonalPalette(seedColor, 10),
      primaryFixedDim: generateTonalPalette(seedColor, 80),
      onPrimaryFixedVariant: generateTonalPalette(seedColor, 30),
      
      secondaryFixed: "#E8DEFF",
      onSecondaryFixed: "#1E153B",
      secondaryFixedDim: "#CCC0F0",
      onSecondaryFixedVariant: "#4A4169",
      
      tertiaryFixed: "#FCDAE0",
      onTertiaryFixed: "#29161B",
      tertiaryFixedDim: "#DFBEC4",
      onTertiaryFixedVariant: "#584146",
    };
  } else {
    return {
      // Primary colors
      primary: generateTonalPalette(seedColor, 80),
      onPrimary: generateTonalPalette(seedColor, 20),
      primaryContainer: generateTonalPalette(seedColor, 30),
      onPrimaryContainer: generateTonalPalette(seedColor, 90),

      // Secondary colors
      secondary: "#CCC2DC",
      onSecondary: "#332D41",
      secondaryContainer: "#4A4458",
      onSecondaryContainer: "#E8DEF8",

      // Tertiary colors
      tertiary: "#EFB8C8",
      onTertiary: "#492532",
      tertiaryContainer: "#633B48",
      onTertiaryContainer: "#FFD8E4",

      // Error colors
      error: "#FFB4AB",
      onError: "#690005",
      errorContainer: "#93000A",
      onErrorContainer: "#FFDAD6",

      // Surface colors
      surface: "#141218",
      onSurface: "#E6E0E9",
      surfaceVariant: "#49454F",
      onSurfaceVariant: "#CAC4D0",
      surfaceDim: "#141218",
      surfaceBright: "#3B383E",
      surfaceContainer: "#211F26",
      surfaceContainerLow: "#1C1B1F",
      surfaceContainerHigh: "#2B2930",
      surfaceContainerHighest: "#36343B",
      surfaceContainerLowest: "#0E0E0E",

      // Background colors
      background: "#141218",
      onBackground: "#E6E0E9",

      // Outline colors
      outline: "#938F99",
      outlineVariant: "#49454F",
      
      // Additional Material 3 colors
      surfaceTint: generateTonalPalette(seedColor, 80),
      shadow: "#000000",
      scrim: "#000000",
      inverseSurface: "#E6E0E9",
      inverseOnSurface: "#313030",
      inversePrimary: seedColor,
      
      // Fixed colors
      primaryFixed: generateTonalPalette(seedColor, 90),
      onPrimaryFixed: generateTonalPalette(seedColor, 10),
      primaryFixedDim: generateTonalPalette(seedColor, 80),
      onPrimaryFixedVariant: generateTonalPalette(seedColor, 30),
      
      secondaryFixed: "#E8DEFF",
      onSecondaryFixed: "#1E153B",
      secondaryFixedDim: "#CCC0F0",
      onSecondaryFixedVariant: "#4A4169",
      
      tertiaryFixed: "#FCDAE0",
      onTertiaryFixed: "#29161B",
      tertiaryFixedDim: "#DFBEC4",
      onTertiaryFixedVariant: "#584146",
    };
  }
}

export function generateDarkTheme(lightTheme: ColorScheme): ColorScheme {
  // Auto-generate dark theme from light theme with proper contrast adjustments
  return getDefaultTheme("dark", lightTheme.primary);
}