---
name: FoodVault Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#00668a'
  on-secondary: '#ffffff'
  secondary-container: '#40c2fd'
  on-secondary-container: '#004d6a'
  tertiary: '#006229'
  on-tertiary: '#ffffff'
  tertiary-container: '#007e37'
  on-tertiary-container: '#c1ffc5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#6bff8f'
  tertiary-fixed-dim: '#4ae176'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005321'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 42px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  price-display:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style
The design system is engineered for high-conversion financial utility within the food and grocery sector. The brand personality is **authoritative yet energetic**, bridging the gap between the reliability of a fintech platform and the vibrancy of a modern consumer marketplace. 

The aesthetic follows a **Stripe-inspired Modernism**: high-clarity layouts, generous whitespace, and a focus on crisp information density. It prioritizes trust through structured alignment and professional polish, while using high-contrast "Electric Blue" and "Lime Green" to drive emotional engagement around savings and value. The visual language is lean, eliminating decorative clutter to ensure that price points and "vaulted" savings remain the focal point.

## Colors
The palette is dominated by **Electric Blue**, used strategically for primary actions and brand presence. 

- **Primary & Secondary:** Used for interactive elements and brand reinforcement. 
- **The "Savings" Green:** Lime Green (#22C55E) is reserved strictly for positive financial outcomes, discounts, and "money saved" indicators to build a strong Pavlovian association with value.
- **Urgency & Highlights:** Amber is used for limited-time offers or low-stock alerts, while Soft Purple is used for premium "Pro" tier features or membership highlights.
- **Structure:** Deep Navy ensures high-contrast readability for headers, while Slate and Muted variants handle secondary metadata.

## Typography
This design system utilizes **Hanken Grotesk** for headlines to provide a sharp, contemporary "tech" feel that communicates precision. **Inter** is used for body copy and UI labels due to its exceptional legibility at small sizes and neutral character.

Numerical data, specifically pricing and savings totals, should always use the `price-display` or `headline` roles with a heavier weight (700) to ensure they are the first items scanned on any page.

## Layout & Spacing
The layout uses a **12-column fluid grid** for desktop, transitioning to a **4-column grid** for mobile. 

- **Desktop (1200px+):** Max-width container with 24px gutters.
- **Tablet (768px - 1199px):** Full-width with 40px side margins.
- **Mobile (Below 768px):** Full-width with 16px side margins.

Spacing follows a strict 4px/8px baseline grid to maintain mathematical harmony. Vertical rhythm is driven by the `lg` (40px) unit between major sections and the `sm` (16px) unit between related components within a card.

## Elevation & Depth
The design system avoids heavy skeuomorphism in favor of **Tonal Layering** and **Ambient Shadows**.

- **Level 0 (Base):** Pure White (#FFFFFF) for the main canvas or Soft Blue Tint (#F0F7FF) to differentiate background sections.
- **Level 1 (Cards):** White surfaces with a subtle, highly-diffused shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Level 2 (Interactive/Hover):** Increased shadow spread and a 1px border using `E2E8F0` to define the object's boundary.
- **Level 3 (Modals/Overlays):** Deep, soft shadows to create significant separation from the background.

## Shapes
The design system uses a **Medium Rounded** approach (0.5rem / 8px) for standard UI components. This balance provides a modern, friendly feel without sacrificing the professional "fintech" structure.

- **Standard Buttons/Inputs:** 8px (rounded-md)
- **Feature Cards/Containers:** 16px (rounded-lg)
- **Checkboxes:** 4px (rounded-sm)
- **Status Pills:** Fully circular (pill-shaped) to distinguish them from interactive buttons.

## Components
- **Buttons:** Primary buttons are Solid Electric Blue with white text. High-conversion "Save" buttons can utilize the Lime Green palette. Secondary buttons use a ghost style with an Electric Blue border or a Soft Blue Tint background.
- **Savings Indicators:** Small, pill-shaped chips using a light green background with dark green text. These should always accompany price displays when a discount is present.
- **Cards:** Content is housed in white cards with 16px rounded corners and Level 1 shadows. Cards should have a 1px `E2E8F0` border to maintain definition against the Soft Blue background tint.
- **Input Fields:** Use 16px padding, an 8px corner radius, and a 1px border. On focus, the border transitions to Electric Blue with a 3px soft blue outer glow (halo).
- **Progress Bars:** Used for membership goal tracking (e.g., "Spend $20 more for free delivery"). These use the Sky Blue secondary color for the track and Electric Blue for the fill.
- **Trust Badges:** Minimalist icons with Deep Navy text, used near checkout or sign-up areas to emphasize security and "Vaulted" protection.