// 主题配置 - 每个主题包含完整的颜色色阶
// 注:nameKey 是 i18n key(theme.default 等),由消费者用 t() 翻译
export const themes = {
  default: {
    nameKey: 'theme.default',
    colors: {
      pink: {
        50: '#FFE4E1',
        100: '#FFB7B2',
        200: '#FF9AA2',
        300: '#FFDAC1',
        400: '#FF6B6B',
        500: '#FF4757',
      },
      peach: {
        50: '#FFF0E6',
        100: '#FFDAC1',
        200: '#FFB7B2',
        300: '#FF9AA2',
        400: '#FF7F50',
      },
      mint: {
        50: '#E8F5E9',
        100: '#B5EAD7',
        200: '#C7CEEA',
        300: '#A8E6CF',
        400: '#26DE81',
      },
      sky: {
        50: '#E3F2FD',
        100: '#C7CEEA',
        200: '#B5EAD7',
        300: '#A8D8EA',
        400: '#4FC3F7',
      },
    },
  },
  lavender: {
    nameKey: 'theme.lavender',
    colors: {
      pink: {
        50: '#F3E5F5',
        100: '#D4B5E0',
        200: '#C9A0DC',
        300: '#E6E6FA',
        400: '#9370DB',
        500: '#8A2BE2',
      },
      peach: {
        50: '#F5F0FF',
        100: '#E6E6FA',
        200: '#D4B5E0',
        300: '#C9A0DC',
        400: '#BA55D3',
      },
      mint: {
        50: '#F0FFF4',
        100: '#C9A0DC',
        200: '#D4B5E0',
        300: '#B5EAD7',
        400: '#9B59B6',
      },
      sky: {
        50: '#E8EAF6',
        100: '#E6E6FA',
        200: '#C9A0DC',
        300: '#A8D8EA',
        400: '#7E57C2',
      },
    },
  },
  mint: {
    nameKey: 'theme.mint',
    colors: {
      pink: {
        50: '#E8F8F5',
        100: '#A8E6CF',
        200: '#B5EAD7',
        300: '#C7F9CC',
        400: '#4CAF50',
        500: '#2ECC71',
      },
      peach: {
        50: '#F0FFF4',
        100: '#C7F9CC',
        200: '#A8E6CF',
        300: '#B5EAD7',
        400: '#27AE60',
      },
      mint: {
        50: '#E8F5E9',
        100: '#80ED99',
        200: '#C7F9CC',
        300: '#A8E6CF',
        400: '#00C853',
      },
      sky: {
        50: '#E0F7FA',
        100: '#B5EAD7',
        200: '#80ED99',
        300: '#A8D8EA',
        400: '#00BCD4',
      },
    },
  },
  sky: {
    nameKey: 'theme.sky',
    colors: {
      pink: {
        50: '#E1F5FE',
        100: '#A8D8EA',
        200: '#87CEEB',
        300: '#B0E0E6',
        400: '#4682B4',
        500: '#3498DB',
      },
      peach: {
        50: '#E0F7FA',
        100: '#B0E0E6',
        200: '#A8D8EA',
        300: '#87CEEB',
        400: '#5DADE2',
      },
      mint: {
        50: '#E8F8F8',
        100: '#87CEEB',
        200: '#A8D8EA',
        300: '#B5EAD7',
        400: '#48C9B0',
      },
      sky: {
        50: '#E3F2FD',
        100: '#B0E0E6',
        200: '#87CEEB',
        300: '#ADD8E6',
        400: '#2980B9',
      },
    },
  },
  cream: {
    nameKey: 'theme.cream',
    colors: {
      pink: {
        50: '#FFFDE7',
        100: '#FFF5BA',
        200: '#FFEAA7',
        300: '#FDCB6E',
        400: '#F39C12',
        500: '#F1C40F',
      },
      peach: {
        50: '#FFFEF0',
        100: '#FDCB6E',
        200: '#FFF5BA',
        300: '#FFEAA7',
        400: '#F5B041',
      },
      mint: {
        50: '#FFFFF0',
        100: '#FFEAA7',
        200: '#FFF5BA',
        300: '#F7DC6F',
        400: '#F4D03F',
      },
      sky: {
        50: '#FFF9E6',
        100: '#FDCB6E',
        200: '#FFEAA7',
        300: '#87CEEB',
        400: '#F5B041',
      },
    },
  },
  berry: {
    nameKey: 'theme.berry',
    colors: {
      pink: {
        50: '#FCE4EC',
        100: '#E8A0BF',
        200: '#DDA0DD',
        300: '#F4C2C2',
        400: '#C71585',
        500: '#E91E63',
      },
      peach: {
        50: '#FFF0F5',
        100: '#F4C2C2',
        200: '#E8A0BF',
        300: '#DDA0DD',
        400: '#EC407A',
      },
      mint: {
        50: '#F3E5F5',
        100: '#DDA0DD',
        200: '#E8A0BF',
        300: '#C7CEEA',
        400: '#9C27B0',
      },
      sky: {
        50: '#FCE4EC',
        100: '#F4C2C2',
        200: '#DDA0DD',
        300: '#A8D8EA',
        400: '#E91E63',
      },
    },
  },
};

export type ThemeName = keyof typeof themes;

export function getThemeColors(themeName: ThemeName) {
  return themes[themeName].colors;
}

export function applyTheme(themeName: ThemeName) {
  const colors = getThemeColors(themeName);

  // Apply colors to CSS variables with Tailwind naming convention
  Object.entries(colors).forEach(([colorName, shades]) => {
    Object.entries(shades).forEach(([shade, color]) => {
      const cssVar = `--color-${colorName}-${shade}`;
      document.documentElement.style.setProperty(cssVar, color);
    });
  });

  // Also set the legacy variables for compatibility
  Object.entries(colors).forEach(([colorName, shades]) => {
    Object.entries(shades).forEach(([shade, color]) => {
      const legacyVar = `--${colorName}-${shade}`;
      document.documentElement.style.setProperty(legacyVar, color);
    });
  });

  // Save to localStorage
  localStorage.setItem('todo-theme', themeName);
}

export function initTheme() {
  const savedTheme = localStorage.getItem('todo-theme') as ThemeName;
  const theme = savedTheme || 'default';
  applyTheme(theme);
  return theme;
}
