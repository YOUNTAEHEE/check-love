/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * 소개팅 앱 'CheckLove'의 테마 색상입니다.
 * 라이트/다크 모드에 따라 다른 색상이 적용됩니다.
 */

const primaryColorLight = "#FF4B6E"; // 메인 핑크 색상
const secondaryColorLight = "#FF8FA0"; // 보조 핑크 색상
const accentColorLight = "#6F5CE5"; // 보라색 액센트

const primaryColorDark = "#FF6B88"; // 다크모드 메인 핑크
const secondaryColorDark = "#FF9FB0"; // 다크모드 보조 핑크
const accentColorDark = "#8A7AEE"; // 다크모드 보라색 액센트

export default {
  light: {
    text: "#333333",
    background: "#FFFFFF",
    primary: primaryColorLight,
    secondary: secondaryColorLight,
    accent: accentColorLight,
    subtle: "#F5F5F7",
    tabIconDefault: "#CCCCCC",
    tabIconSelected: primaryColorLight,
    error: "#FF3B30",
    success: "#34C759",
    warning: "#FFCC00",
    border: "#E5E5E5",
    card: "#FFFFFF",
    cardShadow: "rgba(0, 0, 0, 0.05)",
  },
  dark: {
    text: "#F2F2F7",
    background: "#121212",
    primary: primaryColorDark,
    secondary: secondaryColorDark,
    accent: accentColorDark,
    subtle: "#1E1E1E",
    tabIconDefault: "#8E8E93",
    tabIconSelected: primaryColorDark,
    error: "#FF453A",
    success: "#30D158",
    warning: "#FFD60A",
    border: "#38383A",
    card: "#1C1C1E",
    cardShadow: "rgba(0, 0, 0, 0.3)",
  },
};
