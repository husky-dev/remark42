import { color, DualColors, parseColorStr } from 'utils/colors';
import { isStr, isUnknownDict } from 'utils/types';

// Types

export interface ThemeStyles {
  colors?: ThemeColors;
}

export const isThemeStyles = (val: unknown): val is ThemeStyles => {
  if (!isUnknownDict(val)) return false;
  if (val.colors && !isThemeColors(val.colors)) return false;
  return true;
};

interface ThemeColors {
  primary?: ThemeColor;
}

const isThemeColors = (val: unknown): val is ThemeColors => {
  if (!isUnknownDict(val)) return false;
  if (val.primary && !isThemeColor(val.primary)) return false;
  return true;
};

type ThemeColor = string | ThemeDualColors;

const isThemeColor = (val: unknown): val is ThemeColor => isStr(val) || isThemeDualColors(val);

interface ThemeDualColors {
  light: string;
  dark: string;
}

const isThemeDualColors = (val: unknown): val is ThemeDualColors =>
  isUnknownDict(val) && isStr(val.light) && isStr(val.dark);

// Functionality

export const setThemeStyles = (styles: ThemeStyles) => {
  if (styles.colors) {
    setColors(styles.colors);
  }
};

const setColors = (colors: ThemeColors) => {
  const { primary } = colors;
  // Primary
  if (isStr(primary)) {
    const val = parseColorStr(primary);
    if (val) {
      // Generate dark color from light
      setPrimaryColors({ light: val, dark: color(val).darken(0.1).object() });
    } else console.error('Invalid primary color format: ', primary);
  }
  if (isThemeDualColors(primary)) {
    const { light, dark } = primary;
    const lightVal = parseColorStr(light);
    const darkVal = parseColorStr(dark);
    if (lightVal && darkVal) {
      setPrimaryColors({ light: lightVal, dark: darkVal });
    } else console.error('Invalid primary color format: ', primary);
  }
};

const setPrimaryColors = (val: DualColors) => {
  const rootEl = document.documentElement;
  const darkRootEl = document.querySelector('.root.dark');
  const light = color(val.light); // #0aa, rgb(0, 170, 170)
  const dark = color(val.dark); // #099, rgb(0, 153, 153)
  /* Numerid variables  */
  rootEl.style.setProperty('--color9', light.hex()); // #0aa;
  rootEl.style.setProperty('--color15', light.darken(0.1).hex()); // #099, rgb(0, 153, 153)
  rootEl.style.setProperty('--color33', light.lighten(0.3).hex()); // #06c5c5, rgb(6,197,197) (equivalent rgb(77, 196, 196));
  rootEl.style.setProperty('--color40', light.lighten(0.6).hex()); // #9cdddb, rgb(156,221,219) (equivalent rgb(153, 221, 221));
  rootEl.style.setProperty('--color43', light.lighten(0.7).hex()); // #b7dddd, 	rgb(183,221,221)
  rootEl.style.setProperty('--color42', light.lighten(0.8).hex()); // #c6efef, rgb(198,239,239)
  rootEl.style.setProperty('--color48', light.darken(0.1).alpha(0.6).rgb()); // rgba(37, 156, 154, 0.6)
  rootEl.style.setProperty('--color47', light.darken(0.1).alpha(0.4).rgb()); // rgba(37, 156, 154, 0.4)
  /* Named variables */
  rootEl.style.setProperty('--primary-color', light.rgbBody()); // rgb(0, 170, 170)
  rootEl.style.setProperty('--primary-brighter-color', light.darken(0.1).rgbBody()); // rgb(0, 153, 153);
  rootEl.style.setProperty('--primary-darker-color', light.darken(0.4).rgbBody()); // rgb(0, 102, 102);
  if (darkRootEl instanceof HTMLElement) {
    darkRootEl.style.setProperty('--primary-color', dark.rgbBody()); // rgb(0, 153, 153)
    darkRootEl.style.setProperty('--primary-brighter-color', dark.lighten(0.1).rgbBody()); // rgb(0, 170, 170)
  }
};
