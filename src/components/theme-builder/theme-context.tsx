import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ColorScheme, ThemeExport, SavedTheme, ExtendedColor, CoreColors, Palettes, LegacyThemeExport } from "@/types/schema";
import targetTheme from "../../../target.generated.json";
import { getTagHex, getExtendedHex, ThemeTarget, ExtendedTagName } from "@/theme";
import { generateAllPalettes, generateContrastSchemes } from "@/lib/color-utils";
import { themeStorage } from "@/lib/theme-storage";
import { getDefaultTheme } from "./theme-defaults";

interface ThemeContextType {
  lightTheme: ColorScheme;
  darkTheme: ColorScheme;
  extendedColors: ExtendedColor[];
  currentEditingTheme: "light" | "dark";
  previewTheme: "light" | "dark";
  appDarkMode: boolean;
  themeName: string;
  seedColor: string;
  currentThemeId: string | null;
  savedThemes: SavedTheme[];
  recentThemes: SavedTheme[];
  switchEditingTheme: (theme: "light" | "dark") => void;
  updateColor: (key: keyof ColorScheme, value: string) => void;
  updateExtendedColor: (name: ExtendedTagName, value: string) => void;
  getExtendedColorValue: (name: ExtendedTagName) => string | undefined;
  getExtendedHex: (theme: ThemeTarget, name: ExtendedTagName) => string | undefined; // Add this line
  setThemeName: (name: string) => void;
  setSeedColor: (color: string) => void;
  generatePalette: () => void;
  exportTheme: () => ThemeExport;
  importTheme: (theme: ThemeExport) => void;
  resetToDefaults: () => void;
  // Enhanced save/load functionality
  saveCurrentTheme: (name?: string) => Promise<string>;
  saveThemeAs: (name: string) => Promise<string>;
  loadSavedTheme: (id: string) => Promise<boolean>;
  deleteSavedTheme: (id: string) => Promise<boolean>;
  duplicateTheme: (id: string, newName?: string) => Promise<string>;
  renameTheme: (id: string, newName: string) => Promise<boolean>;
  refreshSavedThemes: () => Promise<void>;
  exportThemeToFile: (id?: string) => Promise<void>;
  importThemeFromFile: (file: File) => Promise<boolean>;
  // New: control preview theme mode
  setPreviewThemeMode: (mode: "light" | "dark") => void;
}

// Default Material Design 3 color schemes
const defaultLightTheme: ColorScheme = getDefaultTheme("light");
const defaultDarkTheme: ColorScheme = getDefaultTheme("dark");

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  appDarkMode: boolean;
  onThemeModeChange?: (mode: "light" | "dark") => void;
}

export function ThemeProvider({ children, appDarkMode, onThemeModeChange }: ThemeProviderProps) {
  const [lightTheme, setLightTheme] = useState<ColorScheme>(defaultLightTheme);
  const [darkTheme, setDarkTheme] = useState<ColorScheme>(defaultDarkTheme);
  const [extendedColors, setExtendedColors] = useState<ExtendedColor[]>([]);
  const [currentEditingTheme, setCurrentEditingTheme] = useState<"light" | "dark">("light");
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");

  // Sync previewTheme with appDarkMode
  useEffect(() => {
    setPreviewTheme(appDarkMode ? "dark" : "light");
  }, [appDarkMode]);
  const [themeName, setThemeName] = useState<string>("Custom Theme");
  const [seedColor, setSeedColor] = useState<string>("#6750A4");
  const [currentThemeId, setCurrentThemeId] = useState<string | null>(null);
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>([]);
  const [recentThemes, setRecentThemes] = useState<SavedTheme[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedLightTheme = localStorage.getItem("materialThemeBuilder_lightTheme");
    const savedDarkTheme = localStorage.getItem("materialThemeBuilder_darkTheme");
    const savedExtendedColors = localStorage.getItem("materialThemeBuilder_extendedColors");
    const savedThemeName = localStorage.getItem("materialThemeBuilder_themeName");
    const savedSeedColor = localStorage.getItem("materialThemeBuilder_seedColor");

    if (savedLightTheme) {
      try {
        setLightTheme(JSON.parse(savedLightTheme));
      } catch (e) {
        console.warn("Failed to parse saved light theme");
      }
    }

    if (savedDarkTheme) {
      try {
        setDarkTheme(JSON.parse(savedDarkTheme));
      } catch (e) {
        console.warn("Failed to parse saved dark theme");
      }
    }

    if (savedExtendedColors) {
      try {
        setExtendedColors(JSON.parse(savedExtendedColors));
      } catch (e) {
        console.warn("Failed to parse saved extended colors");
      }
    }

    if (savedThemeName) {
      setThemeName(savedThemeName);
    }

    if (savedSeedColor) {
      setSeedColor(savedSeedColor);
    }

    // If no saved theme, hydrate from target.generated.json
    if (!savedLightTheme || !savedDarkTheme || !savedExtendedColors) {
      try {
        const t: ThemeTarget = targetTheme as ThemeTarget;
        if (t?.schemes?.light) setLightTheme(prev => ({ ...prev, ...t.schemes.light }));
        if (t?.schemes?.dark) setDarkTheme(prev => ({ ...prev, ...t.schemes.dark }));
        if (Array.isArray(t?.extendedColors)) setExtendedColors(t.extendedColors);
        if (t?.themeName) setThemeName(t.themeName);
        if (t?.seed) setSeedColor(t.seed);
      } catch (err) {
        console.warn("Failed to hydrate from target.generated.json", err);
      }
    }
  }, []);

  // Save to localStorage when values change
  useEffect(() => {
    localStorage.setItem("materialThemeBuilder_lightTheme", JSON.stringify(lightTheme));
  }, [lightTheme]);

  useEffect(() => {
    localStorage.setItem("materialThemeBuilder_darkTheme", JSON.stringify(darkTheme));
  }, [darkTheme]);

  useEffect(() => {
    localStorage.setItem("materialThemeBuilder_extendedColors", JSON.stringify(extendedColors));
  }, [extendedColors]);

  useEffect(() => {
    localStorage.setItem("materialThemeBuilder_themeName", themeName);
  }, [themeName]);

  useEffect(() => {
    localStorage.setItem("materialThemeBuilder_seedColor", seedColor);
  }, [seedColor]);

  const switchEditingTheme = (theme: "light" | "dark") => {
    setCurrentEditingTheme(theme);
  };

  const updateColor = (key: keyof ColorScheme, value: string) => {
    if (currentEditingTheme === "light") {
      setLightTheme(prev => ({ ...prev, [key]: value }));
    } else {
      setDarkTheme(prev => ({ ...prev, [key]: value }));
    }
  };

  const updateExtendedColor = (name: ExtendedTagName, value: string) => {
    setExtendedColors(prev => 
      prev.map(ec => 
        ec.name === name 
          ? { ...ec, color: value }
          : ec
      )
    );
  };

  const getExtendedColorValue = (name: ExtendedTagName): string | undefined => {
    return extendedColors.find(ec => ec.name === name)?.color;
  };

  // Simple color derivation based on seed color
  const generatePalette = () => {
    const seed = seedColor;
    
    // Parse hex color to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 103, g: 80, b: 164 }; // Fallback to default primary
    };

    // Convert RGB to hex
    const rgbToHex = (r: number, g: number, b: number) => {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    // Advanced Material Design 3 color generation using HSL
    const hexToHsl = (hex: string): [number, number, number] => {
      const rgb = hexToRgb(hex);
      const r = rgb.r / 255;
      const g = rgb.g / 255;
      const b = rgb.b / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

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
    };

    const hslToHex = (h: number, s: number, l: number): string => {
      h = h / 360;
      s = s / 100;
      l = l / 100;

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

      return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
    };

    // Material Design color generation with proper tonal relationships
    const [seedH, seedS, seedL] = hexToHsl(seed);
    
    const generateVariant = (hueShift: number, satAdjust: number, lightAdjust: number) => {
      const newH = (seedH + hueShift) % 360;
      const newS = Math.max(0, Math.min(100, seedS + satAdjust));
      const newL = Math.max(0, Math.min(100, seedL + lightAdjust));
      return hslToHex(newH, newS, newL);
    };

    // Generate new light theme with Material Design 3 principles
    const newLightTheme: ColorScheme = {
      // Primary colors
      primary: seed,
      onPrimary: seedL > 50 ? "#000000" : "#FFFFFF",
      primaryContainer: generateVariant(0, -20, 35),
      onPrimaryContainer: generateVariant(0, 0, -40),
      
      // Secondary colors (30° hue shift for harmony)
      secondary: generateVariant(30, -15, -10),
      onSecondary: "#FFFFFF",
      secondaryContainer: generateVariant(30, -20, 40),
      onSecondaryContainer: generateVariant(30, 0, -35),
      
      // Tertiary colors (60° hue shift for vibrancy)
      tertiary: generateVariant(60, -10, -5),
      onTertiary: "#FFFFFF",
      tertiaryContainer: generateVariant(60, -20, 45),
      onTertiaryContainer: generateVariant(60, 0, -30),
      
      // Error colors (Material Design standard)
      error: "#BA1A1A",
      onError: "#FFFFFF",
      errorContainer: "#FFDAD6",
      onErrorContainer: "#410002",
      
      // Surface colors
      surface: "#FEF7FF",
      onSurface: "#1C1B1F",
      surfaceVariant: generateVariant(0, -30, 85),
      onSurfaceVariant: generateVariant(0, -10, 30),
      surfaceDim: generateVariant(0, -40, 75),
      surfaceBright: "#FEF7FF",
      surfaceContainer: generateVariant(0, -35, 90),
      surfaceContainerLow: generateVariant(0, -40, 95),
      surfaceContainerHigh: generateVariant(0, -30, 88),
      surfaceContainerHighest: generateVariant(0, -25, 85),
      surfaceContainerLowest: "#FFFFFF",
      
      // Background
      background: "#FEF7FF",
      onBackground: "#1C1B1F",
      
      // Outline
      outline: generateVariant(0, -20, 50),
      outlineVariant: generateVariant(0, -30, 75),
      
      // Additional Material 3 colors
      surfaceTint: seed,
      shadow: "#000000",
      scrim: "#000000",
      inverseSurface: "#313030",
      inverseOnSurface: "#F4F0EF",
      inversePrimary: generateVariant(0, 0, 30),
      
      // Fixed colors
      primaryFixed: generateVariant(0, -20, 35),
      onPrimaryFixed: generateVariant(0, 0, -40),
      primaryFixedDim: generateVariant(0, 0, 30),
      onPrimaryFixedVariant: generateVariant(0, 0, -25),
      
      secondaryFixed: generateVariant(30, -20, 40),
      onSecondaryFixed: generateVariant(30, 0, -40),
      secondaryFixedDim: generateVariant(30, -15, 20),
      onSecondaryFixedVariant: generateVariant(30, 0, -20),
      
      tertiaryFixed: generateVariant(60, -20, 45),
      onTertiaryFixed: generateVariant(60, 0, -40),
      tertiaryFixedDim: generateVariant(60, -10, 25),
      onTertiaryFixedVariant: generateVariant(60, 0, -15),
    };

    // Generate new dark theme with appropriate contrast adjustments
    const newDarkTheme: ColorScheme = {
      // Primary colors for dark theme
      primary: generateVariant(0, 0, 30),
      onPrimary: generateVariant(0, 0, -40),
      primaryContainer: generateVariant(0, -10, -25),
      onPrimaryContainer: generateVariant(0, -10, 40),
      
      // Secondary colors
      secondary: generateVariant(30, -15, 20),
      onSecondary: generateVariant(30, 0, -35),
      secondaryContainer: generateVariant(30, -10, -20),
      onSecondaryContainer: generateVariant(30, -10, 45),
      
      // Tertiary colors
      tertiary: generateVariant(60, -10, 25),
      onTertiary: generateVariant(60, 0, -30),
      tertiaryContainer: generateVariant(60, -10, -15),
      onTertiaryContainer: generateVariant(60, -10, 50),
      
      // Error colors for dark theme
      error: "#FFB4AB",
      onError: "#690005",
      errorContainer: "#93000A",
      onErrorContainer: "#FFDAD6",
      
      // Surface colors for dark theme
      surface: "#1C1B1F",
      onSurface: "#E6E1E5",
      surfaceVariant: generateVariant(0, -20, 15),
      onSurfaceVariant: generateVariant(0, -10, 70),
      surfaceDim: generateVariant(0, -30, 8),
      surfaceBright: generateVariant(0, -20, 25),
      surfaceContainer: generateVariant(0, -25, 18),
      surfaceContainerLow: generateVariant(0, -30, 12),
      surfaceContainerHigh: generateVariant(0, -20, 22),
      surfaceContainerHighest: generateVariant(0, -15, 28),
      surfaceContainerLowest: "#0E0E0E",
      
      // Background
      background: "#1C1B1F",
      onBackground: "#E6E1E5",
      
      // Outline
      outline: generateVariant(0, -20, 45),
      outlineVariant: generateVariant(0, -30, 25),
      
      // Additional Material 3 colors
      surfaceTint: generateVariant(0, 0, 30),
      shadow: "#000000",
      scrim: "#000000",
      inverseSurface: "#E6E1E5",
      inverseOnSurface: "#313030",
      inversePrimary: seed,
      
      // Fixed colors
      primaryFixed: generateVariant(0, -20, 35),
      onPrimaryFixed: generateVariant(0, 0, -40),
      primaryFixedDim: generateVariant(0, 0, 30),
      onPrimaryFixedVariant: generateVariant(0, 0, -25),
      
      secondaryFixed: generateVariant(30, -20, 40),
      onSecondaryFixed: generateVariant(30, 0, -40),
      secondaryFixedDim: generateVariant(30, -15, 20),
      onSecondaryFixedVariant: generateVariant(30, 0, -20),
      
      tertiaryFixed: generateVariant(60, -20, 45),
      onTertiaryFixed: generateVariant(60, 0, -40),
      tertiaryFixedDim: generateVariant(60, -10, 25),
      onTertiaryFixedVariant: generateVariant(60, 0, -15),
    };

    const newExtendedColors: ExtendedColor[] = [
      // Warning colors
      { name: "warningText", color: "#FBBF24", description: "warning text color", fallback: "#FBBF24", harmonized: false },
      { name: "warningBackground", color: "#92400E", description: "warning background color", fallback: "#92400E", harmonized: false },
      { name: "warningBorder", color: "#FEF3C7", description: "warning border color", fallback: "#FEF3C7", harmonized: false },

      // Information colors
      { name: "informationText", color: generateVariant(180, 0, 40), description: "information text color", fallback: "#e5ebd5", harmonized: false },
      { name: "informationBackground", color: generateVariant(180, -10, -20), description: "information background color", fallback: "#353d1e", harmonized: false },
      { name: "informationBorder", color: generateVariant(180, -10, 85), description: "information border color", fallback: "#ffffff", harmonized: false },

      // Success colors
      { name: "successText", color: "#34D399", description: "success text color", fallback: "#047857", harmonized: false },
      { name: "successBackground", color: "#047857", description: "success background color", fallback: "#D1FAE5", harmonized: false },
      { name: "successBorder", color: "#D1FAE5", description: "success border color", fallback: "#065F46", harmonized: false },

      // Default colors (derived from primary)
      { name: "defaultText", color: generateVariant(0, 0, 30), description: "default text color", fallback: "#6750A4", harmonized: false },
      { name: "defaultBackground", color: generateVariant(0, -10, -25), description: "default background color", fallback: "#d0cdda", harmonized: false },
      { name: "defaultBorder", color: generateVariant(0, -10, 40), description: "default border color", fallback: "#110d1b", harmonized: false },

      // Error colors (Material Design standard, already in scheme, but also as extended for consistency)
      { name: "errorText", color: "#EF4444", description: "error text color", fallback: "#EF4444", harmonized: false },
      { name: "errorBackground", color: "#7F1D1D", description: "error background color", fallback: "#7F1D1D", harmonized: false },
      { name: "errorBorder", color: "#F87171", description: "error border color", fallback: "#F87171", harmonized: false },

      // Tag colors (using values from target.json as a starting point)
      { name: "blueTagText", color: "#1668DC", description: "blue tag text color", fallback: "#1668DC", harmonized: false },
      { name: "blueTagBackground", color: "#E6F4FF", description: "blue tag background color", fallback: "#E6F4FF", harmonized: false },
      { name: "blueTagBorder", color: "#91CAFF", description: "blue tag border color", fallback: "#91CAFF", harmonized: false },

      { name: "cyanTagText", color: "#13A8A8", description: "cyan tag text color", fallback: "#13A8A8", harmonized: false },
      { name: "cyanTagBackground", color: "#E6FFFB", description: "cyan tag background color", fallback: "#E6FFFB", harmonized: false },
      { name: "cyanTagBorder", color: "#87E8DE", description: "cyan tag border color", fallback: "#87E8DE", harmonized: false },

      { name: "geekblueTagText", color: "#2B4ACB", description: "geekblue tag text color", fallback: "#2B4ACB", harmonized: false },
      { name: "geekblueTagBackground", color: "#F0F5FF", description: "geekblue tag background color", fallback: "#F0F5FF", harmonized: false },
      { name: "geekblueTagBorder", color: "#ADC6FF", description: "geekblue tag border color", fallback: "#ADC6FF", harmonized: false },

      { name: "goldTagText", color: "#D89614", description: "gold tag text color", fallback: "#D89614", harmonized: false },
      { name: "goldTagBackground", color: "#FFFBE6", description: "gold tag background color", fallback: "#FFFBE6", harmonized: false },
      { name: "goldTagBorder", color: "#FFD666", description: "gold tag border color", fallback: "#FFD666", harmonized: false },

      { name: "greenTagText", color: "#49AA19", description: "green tag text color", fallback: "#49AA19", harmonized: false },
      { name: "greenTagBackground", color: "#F6FFED", description: "green tag background color", fallback: "#F6FFED", harmonized: false },
      { name: "greenTagBorder", color: "#B7EB8F", description: "green tag border color", fallback: "#B7EB8F", harmonized: false },

      { name: "limeTagText", color: "#8BBB11", description: "lime tag text color", fallback: "#8BBB11", harmonized: false },
      { name: "limeTagBackground", color: "#FCFFE6", description: "lime tag background color", fallback: "#FCFFE6", harmonized: false },
      { name: "limeTagBorder", color: "#EAFF8F", description: "lime tag border color", fallback: "#EAFF8F", harmonized: false },

      { name: "magentaTagText", color: "#CB2B83", description: "magenta tag text color", fallback: "#CB2B83", harmonized: false },
      { name: "magentaTagBackground", color: "#FFF0F6", description: "magenta tag background color", fallback: "#FFF0F6", harmonized: false },
      { name: "magentaTagBorder", color: "#FFADD2", description: "magenta tag border color", fallback: "#FFADD2", harmonized: false },

      { name: "orangeTagText", color: "#D87A16", description: "orange tag text color", fallback: "#D87A16", harmonized: false },
      { name: "orangeTagBackground", color: "#FFF7E6", description: "orange tag background color", fallback: "#FFF7E6", harmonized: false },
      { name: "orangeTagBorder", color: "#FFD591", description: "orange tag border color", fallback: "#FFD591", harmonized: false },

      { name: "purpleTagText", color: "#722ED1", description: "purple tag text color", fallback: "#722ED1", harmonized: false },
      { name: "purpleTagBackground", color: "#F9F0FF", description: "purple tag background color", fallback: "#F9F0FF", harmonized: false },
      { name: "purpleTagBorder", color: "#D3ADF7", description: "purple tag border color", fallback: "#D3ADF7", harmonized: false },

      { name: "redTagText", color: "#D32029", description: "red tag text color", fallback: "#D32029", harmonized: false },
      { name: "redTagBackground", color: "#FFF2F0", description: "red tag background color", fallback: "#FFF2F0", harmonized: false },
      { name: "redTagBorder", color: "#FFCCC7", description: "red tag border color", fallback: "#FFCCC7", harmonized: false },

      { name: "volcanoTagText", color: "#D84A1B", description: "volcano tag text color", fallback: "#D84A1B", harmonized: false },
      { name: "volcanoTagBackground", color: "#FFF2E8", description: "volcano tag background color", fallback: "#FFF2E8", harmonized: false },
      { name: "volcanoTagBorder", color: "#FFBB96", description: "volcano tag border color", fallback: "#FFBB96", harmonized: false },
    ];

    setExtendedColors(newExtendedColors);

    setLightTheme(newLightTheme);
    setDarkTheme(newDarkTheme);
  };

  const exportTheme = (): ThemeExport => {
    // Generate core colors from current seed and theme colors
    const coreColors: CoreColors = {
      primary: seedColor,
      secondary: lightTheme.secondary,
      tertiary: lightTheme.tertiary, 
      neutral: "#FFFFFF" // Default neutral
    };

    // Generate all tonal palettes
    const palettes = generateAllPalettes(
      coreColors.primary,
      coreColors.secondary,
      coreColors.tertiary,
      coreColors.neutral
    );

    // Generate contrast schemes
    const contrastSchemes = generateContrastSchemes(lightTheme, darkTheme);

    // Create Material Theme Builder format
    const currentDate = new Date();
    const description = `TYPE: CUSTOM
Material Theme Builder export ${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')} ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}:${String(currentDate.getSeconds()).padStart(2, '0')}`;

    return {
      description,
      seed: seedColor,
      coreColors,
      extendedColors,
      schemes: {
        light: lightTheme,
        dark: darkTheme,
        ...contrastSchemes
      },
      palettes,
      timestamp: currentDate.toISOString(),
    };
  };

  const importTheme = (theme: any) => {
    // Check if this is the new Material Theme Builder format or legacy format
    const isNewFormat = theme.description && theme.coreColors && theme.palettes;
    
    if (isNewFormat) {
      // Import from Material Theme Builder format
      if (theme.schemes?.light) {
        setLightTheme(prev => ({ ...prev, ...theme.schemes.light }));
      }
      if (theme.schemes?.dark) {
        setDarkTheme(prev => ({ ...prev, ...theme.schemes.dark }));
      }
      
      // Import extended colors
      if (Array.isArray(theme.extendedColors)) {
        setExtendedColors(theme.extendedColors);
      }
      
      // Extract theme name from description or use default
      const descriptionMatch = theme.description?.match(/TYPE:\s*(\w+)/);
      const themeType = descriptionMatch ? descriptionMatch[1] : "CUSTOM";
      setThemeName(`${themeType} Theme`);
      setSeedColor(theme.seed || "#6750A4");
    } else {
      // Import from legacy format
      if (theme.schemes?.light) {
        setLightTheme(prev => ({ ...prev, ...theme.schemes.light }));
      }
      if (theme.schemes?.dark) {
        setDarkTheme(prev => ({ ...prev, ...theme.schemes.dark }));
      }

      // Import extended colors separately
      if (Array.isArray(theme.extendedColors)) {
        setExtendedColors(theme.extendedColors);
      }

      setThemeName(theme.themeName || "Imported Theme");
      setSeedColor(theme.seed || "#6750A4");
    }
  };

  const resetToDefaults = () => {
    setLightTheme(defaultLightTheme);
    setDarkTheme(defaultDarkTheme);
    
    // Reset extended colors to defaults from target.generated.json
    try {
      const t: ThemeTarget = targetTheme as ThemeTarget;
      if (Array.isArray(t?.extendedColors)) {
        setExtendedColors(t.extendedColors);
      }
    } catch (err) {
      console.warn("Failed to reset extended colors", err);
    }
    
    setThemeName("Custom Theme");
    setSeedColor("#6750A4");
    setCurrentThemeId(null);
  };

  // Enhanced save/load functionality
  const refreshSavedThemes = async () => {
    try {
      const themes = await themeStorage.getAllSavedThemes();
      const recent = await themeStorage.getRecentThemes();
      setSavedThemes(themes);
      setRecentThemes(recent);
    } catch (error) {
      console.error("Failed to refresh saved themes:", error);
    }
  };

  // Load saved themes on mount
  useEffect(() => {
    refreshSavedThemes();
  }, []);

  // Auto-save current theme periodically
  useEffect(() => {
    const autoSaveTimer = setInterval(async () => {
      try {
        const currentTheme = exportTheme();
        await themeStorage.autoSaveTheme(currentTheme);
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveTimer);
  }, [lightTheme, darkTheme, themeName, seedColor]);

  const saveCurrentTheme = async (name?: string): Promise<string> => {
    try {
      const theme = exportTheme();
      const id = await themeStorage.saveTheme(theme, name);
      setCurrentThemeId(id);
      await refreshSavedThemes();
      return id;
    } catch (error) {
      console.error("Failed to save theme:", error);
      throw error;
    }
  };

  const saveThemeAs = async (name: string): Promise<string> => {
    try {
      const theme = exportTheme();
      const id = await themeStorage.saveThemeAs(theme, name);
      setCurrentThemeId(id);
      setThemeName(name);
      await refreshSavedThemes();
      return id;
    } catch (error) {
      console.error("Failed to save theme as:", error);
      throw error;
    }
  };

  const loadSavedTheme = async (id: string): Promise<boolean> => {
    try {
      const theme = await themeStorage.loadTheme(id);
      if (theme) {
        importTheme(theme);
        setCurrentThemeId(id);
        await refreshSavedThemes();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to load theme:", error);
      return false;
    }
  };

  const deleteSavedTheme = async (id: string): Promise<boolean> => {
    try {
      const success = await themeStorage.deleteTheme(id);
      if (success) {
        if (currentThemeId === id) {
          setCurrentThemeId(null);
        }
        await refreshSavedThemes();
      }
      return success;
    } catch (error) {
      console.error("Failed to delete theme:", error);
      return false;
    }
  };

  const duplicateTheme = async (id: string, newName?: string): Promise<string> => {
    try {
      const newId = await themeStorage.duplicateTheme(id, newName);
      await refreshSavedThemes();
      return newId;
    } catch (error) {
      console.error("Failed to duplicate theme:", error);
      throw error;
    }
  };

  const renameTheme = async (id: string, newName: string): Promise<boolean> => {
    try {
      const success = await themeStorage.renameTheme(id, newName);
      if (success) {
        if (currentThemeId === id) {
          setThemeName(newName);
        }
        await refreshSavedThemes();
      }
      return success;
    } catch (error) {
      console.error("Failed to rename theme:", error);
      return false;
    }
  };

  const exportThemeToFile = async (id?: string): Promise<void> => {
    try {
      if (id) {
        await themeStorage.exportThemeToFile(id);
      } else {
        // Export current theme
        const tempId = await saveCurrentTheme();
        await themeStorage.exportThemeToFile(tempId);
      }
    } catch (error) {
      console.error("Failed to export theme to file:", error);
      throw error;
    }
  };

  const importThemeFromFile = async (file: File): Promise<boolean> => {
    try {
      const savedTheme = await themeStorage.importThemeFromFile(file);
      importTheme(savedTheme);
      setCurrentThemeId(savedTheme.id);
      await refreshSavedThemes();
      return true;
    } catch (error) {
      console.error("Failed to import theme from file:", error);
      return false;
    }
  };

  const value: ThemeContextType = {
    lightTheme,
    darkTheme,
    extendedColors,
    currentEditingTheme,
    previewTheme,
    appDarkMode,
    themeName,
    seedColor,
    currentThemeId,
    savedThemes,
    recentThemes,
    switchEditingTheme,
    updateColor,
    updateExtendedColor,
    getExtendedColorValue,
    getExtendedHex, // Add this line
    setThemeName,
    setSeedColor,
    generatePalette,
    exportTheme,
    importTheme,
    resetToDefaults,
    // Enhanced save/load functionality
    saveCurrentTheme,
    saveThemeAs,
    loadSavedTheme,
    deleteSavedTheme,
    duplicateTheme,
    renameTheme,
    refreshSavedThemes,
    exportThemeToFile,
    importThemeFromFile,
    setPreviewThemeMode: (mode: "light" | "dark") => { setPreviewTheme(mode); onThemeModeChange?.(mode); },
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
