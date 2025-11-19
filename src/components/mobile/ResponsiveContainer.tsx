import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveContainerProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableGutters?: boolean;
}

/**
 * Responsive container that adapts padding and layout for mobile
 */
export function ResponsiveContainer({
  children,
  maxWidth = 'lg',
  disableGutters = false,
}: ResponsiveContainerProps) {
  const { isMobile } = useResponsive();

  return (
    <Container
      maxWidth={maxWidth}
      disableGutters={disableGutters || isMobile}
      sx={{
        px: isMobile ? 1 : 3,
        py: isMobile ? 1 : 2,
      }}
    >
      {children}
    </Container>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  spacing?: number;
}

/**
 * Responsive grid that adjusts spacing for mobile
 */
export function ResponsiveGrid({ children, spacing = 2 }: ResponsiveGridProps) {
  const { isMobile } = useResponsive();

  return (
    <Box
      sx={{
        display: 'grid',
        gap: isMobile ? 1 : spacing,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        },
      }}
    >
      {children}
    </Box>
  );
}

interface ResponsiveStackProps {
  children: ReactNode;
  spacing?: number;
  direction?: 'row' | 'column';
}

/**
 * Responsive stack that switches between row and column based on screen size
 */
export function ResponsiveStack({
  children,
  spacing = 2,
  direction = 'row',
}: ResponsiveStackProps) {
  const { isMobile } = useResponsive();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : direction,
        gap: isMobile ? 1 : spacing,
        alignItems: direction === 'row' && !isMobile ? 'center' : 'stretch',
      }}
    >
      {children}
    </Box>
  );
}

interface MobileOnlyProps {
  children: ReactNode;
}

/**
 * Show content only on mobile devices
 */
export function MobileOnly({ children }: MobileOnlyProps) {
  const { isMobile } = useResponsive();
  return isMobile ? <>{children}</> : null;
}

interface DesktopOnlyProps {
  children: ReactNode;
}

/**
 * Show content only on desktop devices
 */
export function DesktopOnly({ children }: DesktopOnlyProps) {
  const { isDesktop } = useResponsive();
  return isDesktop ? <>{children}</> : null;
}

interface ResponsiveShowProps {
  mobile?: ReactNode;
  desktop?: ReactNode;
}

/**
 * Show different content based on device type
 */
export function ResponsiveShow({ mobile, desktop }: ResponsiveShowProps) {
  const { isMobile } = useResponsive();
  return <>{isMobile ? mobile : desktop}</>;
}
