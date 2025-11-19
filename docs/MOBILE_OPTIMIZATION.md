# Mobile Optimization Guide

## 📱 Overview

This guide covers all mobile optimization strategies implemented in the Google Search Ranking Checker application.

---

## Table of Contents

1. [Responsive Design](#responsive-design)
2. [Mobile Components](#mobile-components)
3. [Touch Interactions](#touch-interactions)
4. [Performance Optimization](#performance-optimization)
5. [Progressive Web App (PWA)](#progressive-web-app-pwa)
6. [Testing](#testing)
7. [Best Practices](#best-practices)

---

## Responsive Design

### Breakpoints

The application uses Material-UI's default breakpoints:

```typescript
{
  xs: 0,      // Extra small (mobile)
  sm: 600,    // Small (tablet portrait)
  md: 900,    // Medium (tablet landscape)
  lg: 1200,   // Large (desktop)
  xl: 1536,   // Extra large (large desktop)
}
```

### Responsive Hooks

#### useResponsive

```typescript
import { useResponsive } from '@/hooks/useResponsive';

function MyComponent() {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <div>
      {isMobile && <MobileView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

**Available Properties:**
- `isMobile`: `true` on screens < 600px
- `isTablet`: `true` on screens 600px - 900px
- `isDesktop`: `true` on screens >= 900px
- `isLargeDesktop`: `true` on screens >= 1200px
- `isXLargeDesktop`: `true` on screens >= 1536px
- `isSmallScreen`: `true` on mobile or tablet

#### useOrientation

```typescript
import { useOrientation } from '@/hooks/useResponsive';

function MyComponent() {
  const { isPortrait, isLandscape } = useOrientation();

  return (
    <div style={{ flexDirection: isPortrait ? 'column' : 'row' }}>
      {/* Content */}
    </div>
  );
}
```

#### useTouchDevice

```typescript
import { useTouchDevice } from '@/hooks/useResponsive';

function MyComponent() {
  const isTouch = useTouchDevice();

  return (
    <Button
      size={isTouch ? 'large' : 'medium'}
      sx={{ minHeight: isTouch ? 44 : 36 }}
    >
      Touch-friendly Button
    </Button>
  );
}
```

#### useViewport

```typescript
import { useViewport } from '@/hooks/useResponsive';

function MyComponent() {
  const { width, height } = useViewport();

  return (
    <div>
      Viewport: {width}x{height}
    </div>
  );
}
```

---

## Mobile Components

### ResponsiveContainer

Automatically adjusts padding and gutters for mobile:

```typescript
import { ResponsiveContainer } from '@/components/mobile/ResponsiveContainer';

function MyPage() {
  return (
    <ResponsiveContainer maxWidth="lg">
      {/* Content with mobile-friendly padding */}
    </ResponsiveContainer>
  );
}
```

### ResponsiveGrid

Grid that adjusts columns based on screen size:

```typescript
import { ResponsiveGrid } from '@/components/mobile/ResponsiveContainer';

function MyComponent() {
  return (
    <ResponsiveGrid spacing={2}>
      <Card>Item 1</Card>
      <Card>Item 2</Card>
      <Card>Item 3</Card>
    </ResponsiveGrid>
  );
}

// Result:
// Mobile (xs): 1 column
// Tablet (sm): 2 columns
// Desktop (md+): 3 columns
```

### ResponsiveStack

Stack that switches between row and column:

```typescript
import { ResponsiveStack } from '@/components/mobile/ResponsiveContainer';

function MyComponent() {
  return (
    <ResponsiveStack spacing={2} direction="row">
      <Button>Action 1</Button>
      <Button>Action 2</Button>
      <Button>Action 3</Button>
    </ResponsiveStack>
  );
}

// Mobile: Stacked vertically (column)
// Desktop: Stacked horizontally (row)
```

### MobileOnly / DesktopOnly

Conditionally render content:

```typescript
import { MobileOnly, DesktopOnly } from '@/components/mobile/ResponsiveContainer';

function MyComponent() {
  return (
    <>
      <MobileOnly>
        <MobileBottomNav />
      </MobileOnly>

      <DesktopOnly>
        <DesktopSidebar />
      </DesktopOnly>
    </>
  );
}
```

### ResponsiveShow

Show different content for mobile vs desktop:

```typescript
import { ResponsiveShow } from '@/components/mobile/ResponsiveContainer';

function MyComponent() {
  return (
    <ResponsiveShow
      mobile={<MobileMenu />}
      desktop={<DesktopMenu />}
    />
  );
}
```

### MobileBottomNav

Bottom navigation for mobile devices:

```typescript
import { MobileBottomNav, useMobileBottomNav } from '@/components/mobile/MobileBottomNav';

function App() {
  const nav = useMobileBottomNav();

  return (
    <>
      <main>
        {nav.isSearch && <SearchView />}
        {nav.isHistory && <HistoryView />}
        {nav.isStats && <StatsView />}
        {nav.isSettings && <SettingsView />}
      </main>

      <MobileBottomNav value={nav.value} onChange={nav.onChange} />
    </>
  );
}
```

### MobileDrawer

Swipeable drawer for mobile:

```typescript
import { MobileDrawer, useMobileDrawer } from '@/components/mobile/MobileDrawer';

function MyComponent() {
  const drawer = useMobileDrawer();

  return (
    <>
      <Button onClick={drawer.onOpen}>Open Filters</Button>

      <MobileDrawer
        open={drawer.open}
        onOpen={drawer.onOpen}
        onClose={drawer.onClose}
        title="Filters"
        anchor="bottom"
      >
        <FilterOptions />
      </MobileDrawer>
    </>
  );
}
```

---

## Touch Interactions

### Tap Area Size

Minimum touch target sizes:
- **iOS**: 44x44 pixels
- **Android (Material Design)**: 48x48 pixels

```typescript
import { getTapAreaSize } from '@/utils/mobileUtils';

const tapSize = getTapAreaSize(); // 44 for iOS, 48 for Android

<Button
  sx={{
    minWidth: tapSize,
    minHeight: tapSize,
    p: 1,
  }}
>
  Touch-friendly
</Button>
```

### Swipe Gestures

Use Material-UI's SwipeableDrawer for native-like swipe:

```typescript
<SwipeableDrawer
  anchor="bottom"
  open={open}
  onClose={handleClose}
  onOpen={handleOpen}
  disableSwipeToOpen={false}
>
  {/* Content */}
</SwipeableDrawer>
```

### Pull-to-Refresh Prevention

```typescript
import { preventPullToRefresh } from '@/utils/mobileUtils';

useEffect(() => {
  const element = document.getElementById('scrollable-content');
  if (element) {
    const cleanup = preventPullToRefresh(element);
    return cleanup;
  }
}, []);
```

### Haptic Feedback

```typescript
import { vibrate } from '@/utils/mobileUtils';

function handleButtonClick() {
  vibrate(10); // Vibrate for 10ms
  // or
  vibrate([100, 50, 100]); // Pattern: vibrate, pause, vibrate
}
```

---

## Performance Optimization

### Code Splitting

```typescript
// App.tsx
const ResultsTable = lazy(() => import('./components/ResultsTable'));
const SearchHistory = lazy(() => import('./components/SearchHistory'));

function App() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <ResultsTable data={results} />
    </Suspense>
  );
}
```

### Image Optimization

```typescript
import { getOptimizedImageUrl } from '@/utils/mobileUtils';

function MyComponent() {
  const { isMobile } = useResponsive();

  const imageUrl = getOptimizedImageUrl('/image.jpg', {
    width: isMobile ? 400 : 800,
    quality: 80,
    format: 'webp',
  });

  return <img src={imageUrl} alt="Optimized" />;
}
```

### Network-Aware Loading

```typescript
import { isSlowNetwork, getNetworkInfo } from '@/utils/mobileUtils';

function MyComponent() {
  const [loadImages, setLoadImages] = useState(!isSlowNetwork());

  useEffect(() => {
    const networkInfo = getNetworkInfo();
    if (networkInfo?.saveData) {
      setLoadImages(false); // Respect user's data saver preference
    }
  }, []);

  return loadImages ? <FullImage /> : <LowResImage />;
}
```

### Reduced Motion

```typescript
import { prefersReducedMotion } from '@/utils/mobileUtils';

const shouldAnimate = !prefersReducedMotion();

<motion.div
  animate={{ opacity: shouldAnimate ? 1 : undefined }}
  transition={{ duration: shouldAnimate ? 0.3 : 0 }}
>
  {/* Content */}
</motion.div>
```

---

## Progressive Web App (PWA)

### Viewport Configuration

```html
<!-- index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="theme-color" content="#1976d2" />
```

### Install Prompts

```typescript
import { isStandalone } from '@/utils/mobileUtils';

function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!isStandalone()) {
      setShowPrompt(true);
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <Button onClick={handleInstall}>
      Install App
    </Button>
  );
}
```

### Share API

```typescript
import { shareContent } from '@/utils/mobileUtils';

async function handleShare() {
  const success = await shareContent({
    title: 'Search Results',
    text: 'Check out these search rankings!',
    url: window.location.href,
  });

  if (!success) {
    // Fallback: copy to clipboard
    await copyToClipboard(window.location.href);
    toast.success('Link copied to clipboard!');
  }
}
```

### Clipboard API

```typescript
import { copyToClipboard } from '@/utils/mobileUtils';

async function handleCopy(text: string) {
  const success = await copyToClipboard(text);

  if (success) {
    toast.success('Copied to clipboard!');
  } else {
    toast.error('Failed to copy');
  }
}
```

---

## Testing

### Responsive Testing

#### Chrome DevTools

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
3. Select device preset or custom dimensions
4. Test different screen sizes and orientations

#### Recommended Test Devices

- **iPhone SE** (375x667) - Small mobile
- **iPhone 12 Pro** (390x844) - Standard mobile
- **iPhone 12 Pro Max** (428x926) - Large mobile
- **iPad Mini** (768x1024) - Small tablet
- **iPad Pro** (1024x1366) - Large tablet

#### Test Checklist

- [ ] Touch targets are at least 44x44px (iOS) or 48x48px (Android)
- [ ] Text is readable without zooming (minimum 16px base font)
- [ ] Content fits viewport without horizontal scrolling
- [ ] Forms work well with mobile keyboards
- [ ] Swipe gestures work as expected
- [ ] Bottom navigation doesn't overlap content
- [ ] Modals/drawers are easy to dismiss
- [ ] Images load properly on slow networks
- [ ] Animations respect reduced motion preference

### Performance Testing

#### Lighthouse Mobile

```bash
# Install Lighthouse
npm install -g @lhci/cli

# Run mobile audit
lhci autorun --collect.settings.preset=mobile
```

**Target Scores:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 95

#### Real Device Testing

Test on actual devices whenever possible:
- iOS Safari
- Android Chrome
- Android Firefox
- Samsung Internet

---

## Best Practices

### 1. Mobile-First Design

Start with mobile layout, then enhance for larger screens:

```typescript
// ✅ Good: Mobile-first
<Box
  sx={{
    fontSize: 14,        // Mobile default
    sm: { fontSize: 16 }, // Tablet
    md: { fontSize: 18 }, // Desktop
  }}
/>

// ❌ Bad: Desktop-first
<Box
  sx={{
    fontSize: 18,
    sm: { fontSize: 14 },
  }}
/>
```

### 2. Touch-Friendly Spacing

```typescript
// ✅ Good: Adequate spacing
<Stack spacing={2}>
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</Stack>

// ❌ Bad: Too tight
<Stack spacing={0.5}>
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</Stack>
```

### 3. Readable Font Sizes

```typescript
// ✅ Good: Readable on mobile
<Typography
  variant="body1"
  sx={{ fontSize: { xs: 14, sm: 16 } }}
>
  Content
</Typography>

// ❌ Bad: Too small
<Typography sx={{ fontSize: 12 }}>
  Hard to read
</Typography>
```

### 4. Avoid Horizontal Scrolling

```typescript
// ✅ Good: Responsive width
<Container maxWidth="lg">
  <Box sx={{ width: '100%', overflow: 'hidden' }}>
    {/* Content */}
  </Box>
</Container>

// ❌ Bad: Fixed width
<Box sx={{ width: 1200 }}>
  {/* Causes horizontal scroll on mobile */}
</Box>
```

### 5. Optimize Images

```typescript
// ✅ Good: Responsive images
<img
  src={imageUrl}
  srcSet={`
    ${imageUrl}?w=400 400w,
    ${imageUrl}?w=800 800w,
    ${imageUrl}?w=1200 1200w
  `}
  sizes="(max-width: 600px) 400px, (max-width: 900px) 800px, 1200px"
  alt="Description"
  loading="lazy"
/>
```

### 6. Handle Orientation Changes

```typescript
const { isPortrait, isLandscape } = useOrientation();

<Box
  sx={{
    flexDirection: isPortrait ? 'column' : 'row',
    height: isLandscape ? '100vh' : 'auto',
  }}
>
  {/* Content adjusts to orientation */}
</Box>
```

### 7. Safe Area Insets (iOS Notch)

```css
/* Add to global CSS */
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### 8. Prevent Zoom on Input Focus

```html
<!-- Set minimum font size to 16px to prevent iOS zoom -->
<input style="font-size: 16px;" />
```

### 9. Use System Fonts for Performance

```typescript
const theme = createTheme({
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
  },
});
```

### 10. Test on Slow Networks

```bash
# Chrome DevTools: Network throttling
# Slow 3G: 400ms RTT, 400kb/s download, 400kb/s upload
```

---

## Platform-Specific Considerations

### iOS

- Use `-webkit-overflow-scrolling: touch` for smooth scrolling
- Respect safe area insets (notch)
- Test with Safari, not just Chrome
- Consider haptic feedback for important actions

### Android

- Use 48x48px minimum touch targets
- Test with Chrome and Samsung Internet
- Consider Material Design guidelines
- Support back button navigation

---

## Accessibility

### Touch Targets

```typescript
// Accessible touch target
<IconButton
  aria-label="Search"
  sx={{
    width: 48,
    height: 48,
    '@media (hover: none)': {
      // Touch devices
      width: 56,
      height: 56,
    },
  }}
>
  <SearchIcon />
</IconButton>
```

### Screen Reader Support

```typescript
<Button
  aria-label="Search for keywords"
  aria-describedby="search-help-text"
>
  Search
</Button>
<Typography id="search-help-text" variant="caption">
  Enter keywords to find search rankings
</Typography>
```

---

## Summary

Mobile optimization checklist:

- ✅ Responsive design with mobile-first approach
- ✅ Touch-friendly UI (44-48px touch targets)
- ✅ Performance optimizations (code splitting, lazy loading)
- ✅ PWA capabilities (install prompt, offline support)
- ✅ Network-aware loading
- ✅ Accessibility compliance
- ✅ Cross-platform testing
- ✅ Safe area insets for modern devices
- ✅ Reduced motion support
- ✅ Haptic feedback where appropriate

## Resources

- [Material-UI Responsive Design](https://mui.com/material-ui/customization/breakpoints/)
- [Web.dev Mobile Performance](https://web.dev/mobile/)
- [MDN Touch Events](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios)
- [Material Design for Android](https://m3.material.io/)
