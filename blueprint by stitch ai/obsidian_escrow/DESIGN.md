---
name: Obsidian Escrow
colors:
  surface: '#0d1515'
  surface-dim: '#0d1515'
  surface-bright: '#323b3b'
  surface-container-lowest: '#081010'
  surface-container-low: '#151d1d'
  surface-container: '#192121'
  surface-container-high: '#232b2c'
  surface-container-highest: '#2e3637'
  on-surface: '#dce4e4'
  on-surface-variant: '#b9caca'
  inverse-surface: '#dce4e4'
  inverse-on-surface: '#2a3232'
  outline: '#849495'
  outline-variant: '#3a494a'
  surface-tint: '#00dce5'
  primary: '#e9feff'
  on-primary: '#003739'
  primary-container: '#00f5ff'
  on-primary-container: '#006c71'
  inverse-primary: '#00696e'
  secondary: '#f5fff2'
  on-secondary: '#003919'
  secondary-container: '#36ff8b'
  on-secondary-container: '#007238'
  tertiary: '#fff9f0'
  on-tertiary: '#3a3000'
  tertiary-container: '#ffdb3f'
  on-tertiary-container: '#736000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#63f7ff'
  primary-fixed-dim: '#00dce5'
  on-primary-fixed: '#002021'
  on-primary-fixed-variant: '#004f53'
  secondary-fixed: '#61ff97'
  secondary-fixed-dim: '#00e476'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005227'
  tertiary-fixed: '#ffe16c'
  tertiary-fixed-dim: '#e7c427'
  on-tertiary-fixed: '#221b00'
  on-tertiary-fixed-variant: '#544600'
  background: '#0d1515'
  on-background: '#dce4e4'
  surface-variant: '#2e3637'
typography:
  headline-lg:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 20px
  margin: 32px
---

## Brand & Style
The design system embodies a "Hacker-Chic" aesthetic: high-end, secretive, and technically superior. It targets developers, security professionals, and high-stakes stakeholders who require a secure environment that feels like a premium digital vault.

The style is a fusion of **Glassmorphism** and **Technical Minimalism**. It utilizes ultra-dark surfaces with high-fidelity "liquid glass" effects. The UI should feel like a sophisticated heads-up display (HUD)—precise, data-dense, yet luxuriously polished. Key visual drivers include:
- **Volumetric Lighting:** Buttons and active states should appear to emit a soft, localized glow.
- **Micro-Depth:** Use of subtle 3D parallax on cards and modals to simulate physical layers of security.
- **Cyber-Precision:** Every edge, line, and transition must feel deliberate and mathematically perfect, mimicking high-end IDEs and terminal emulators.

## Colors
The palette is built on a foundation of "Obsidian" and "Graphite" to ensure maximum contrast for glowing elements.

- **Primary (Electric Cyan):** Used for interactive elements, primary actions, and "active" data streams. It represents connectivity and flow.
- **Secondary (Emerald Green):** Reserved for "Secure," "Success," and "Verified" states. It should feel like a steady, healthy heartbeat of the system.
- **Backgrounds:** The base layer is `#0A0A0B`. Overlays and containers use `#1A1A1C` with varying levels of transparency (60-80%) to allow background blurs to bleed through.
- **Functional Colors:** Use a muted crimson (#FF3B30) sparingly for critical alerts or unauthorized access attempts.

## Typography
Typography creates a hierarchy between "Human" interface elements and "System" data.

- **Geist (Sans):** Used for all primary UI navigation, headings, and body copy. It provides a clean, modern, and Swiss-inspired legibility that keeps the high-tech theme from becoming unreadable.
- **JetBrains Mono (Monospaced):** Used for all data-driven values, file paths, hashes, and labels. This font communicates technical accuracy.
- **Tracking:** Use tighter tracking for large headlines to emphasize the "Obsidian" weight, and wider tracking for monospaced labels to enhance the "HUD" feel.

## Layout & Spacing
The layout follows a **Rigid Grid** philosophy, inspired by modern IDEs. 

- **Sidebar-First:** A fixed 240px-280px left sidebar for navigation and file trees. 
- **Tabbed Workspace:** The main content area uses a persistent tab system for multi-tasking between escrow files.
- **Spacing:** Based on a 4px baseline. Use tight spacing (8px-16px) for data tables and tree views to maximize information density, but provide generous margins (32px+) around primary workspace containers to create a "premium" feel.
- **Breakpoints:**
  - Desktop: 1200px+ (12 columns)
  - Tablet: 768px - 1199px (8 columns, sidebar collapses to icons)
  - Mobile: <767px (4 columns, sidebar becomes an overlay drawer)

## Elevation & Depth
Depth is achieved through **Optical Refraction** rather than traditional dropshadows.

1.  **Base Layer:** `#0A0A0B` (Solid).
2.  **Mantle Layer:** `#1A1A1C` at 70% opacity with a `20px` backdrop blur. Used for sidebars and panels.
3.  **Floating Layer:** Elevated cards use a `1px` inner border (top-left weighted) in white at 10% opacity to simulate a glass edge catching the light.
4.  **Shadows:** Instead of black shadows, use "Glow Shadows"—thin, highly diffused blurs using the primary Cyan or Secondary Green at 5-10% opacity to suggest the element is hovering over a light source.

## Shapes
Shapes are "Soft-Tech." While the grid is rigid, corners are slightly rounded to maintain a premium, modern software feel (0.25rem - 0.75rem).

- **Buttons/Inputs:** 4px (Soft) for a precision-tool look.
- **Cards/Modals:** 12px (rounded-lg) to create a clear distinction from the background grid.
- **Indicators:** Tabs use "Morphing" indicators—pill-shaped glows that slide and stretch between states.

## Components

### Buttons & Controls
- **Primary Button:** Solid Cyan fill with a 0.5px white inner-glow border. On hover, apply a volumetric "liquid" ripple effect.
- **Ghost Button:** 1px Cyan border with 5% Cyan fill. Text uses JetBrains Mono for a technical look.

### Navigation & Trees
- **Sidebar Trees:** VS Code style. Use 16px chevron icons. Active items feature a vertical "light pipe" (2px wide) on the far left in Primary Cyan.
- **Tabs:** Borderless tabs with a floating glow-bar indicator that follows the cursor or active state with a high-spring animation.

### Data & Monitoring
- **High-Tech Widgets:** Use small sparklines (1px stroke) in Cyan. Backgrounds for widgets should be the "Liquid Glass" style—semi-transparent with a subtle moving gradient mask.
- **Input Fields:** Darker than the surface (#050505). On focus, the border "ignites" into a Cyan glow with a 2px outer blur.

### Feedback
- **Secure State:** Elements pulse with a very slow Emerald Green glow (4s duration).
- **Progress Bars:** Use a "segmented" look (vertical 2px gaps) to feel like hardware LEDs.