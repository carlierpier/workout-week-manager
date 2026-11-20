import { useWindowDimensions } from 'react-native';

const WIDE_BREAKPOINT = 900;

export function useResponsive() {
  const { width } = useWindowDimensions();
  return { isWide: width >= WIDE_BREAKPOINT };
}
