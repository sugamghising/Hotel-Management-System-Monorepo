---
name: login-page-redesign
date: 2026-05-21
status: approved
---

# Design Spec: Login Page Redesign (Enterprise HMS)

## 1. Overview
The goal is to transform the login experience from a simple centered card to a high-end, "Immersive Trust" enterprise experience. The design balances technical stability (Enterprise SaaS) with welcoming hospitality warmth.

## 2. Visual Direction: "Premium Corporate with Hospitality Warmth"
- **Aesthetic:** A hybrid of Stripe/Salesforce (trust, depth, gradients) with hospitality-focused warmth.
- **Colors:**
  - Primary: Deep Navy/Teal (`bg-slate-900`, `bg-blue-900`) for authority.
  - Accents: Warm Gold/Coral for a welcoming touch.
  - Backgrounds: Off-white/Slate-50 for the form area to ensure clarity.
- **Styling:** Layered shadows, soft rounded corners, and glassmorphism.

## 3. Layout Architecture (Split-Screen)

### Desktop ($\ge 1024\text{px}$)
- **50/50 Split:**
  - **Left (Brand Side):** Deep Navy/Teal gradient background.
  - **Right (Auth Side):** Clean Slate-50 background.

### Tablet ($768\text{px} - 1023\text{px}$)
- **40/60 Split:** Brand side shrinks slightly; Auth side expands to provide more room for form fields.

### Mobile ($< 768\text{px}$)
- **Stacked:** Brand side becomes a condensed header (approx 30vh) with the logo and heading; Auth side occupies the rest of the viewport.

## 4. Detailed Components

### 4.1 The Brand Side (Left)
- **Background:** `bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900`.
- **Hero Visual:** A stylized, geometric 3D silhouette of a modern hotel property.
- **Glassmorphic Metrics Card:** 
  - Floating semi-transparent panel (`bg-white/10 backdrop-blur-md border border-white/20`).
  - Content: Real-time dashboard metrics (Occupancy %, RevPAR, Guest Count) with subtle sparklines.
  - Animation: Gentle `animate-float` effect.
- **Typography:** Bold white H1: *"The most comprehensive Hotel Management System"*.

### 4.2 The Auth Side (Right)
- **Fast-Track SSO:**
  - Prominent "Sign in with Enterprise SSO" button at the top.
  - Visual style: White background, thin grey border, Okta/Enterprise logo.
  - Divider: *"or sign in with email"* (`text-muted-foreground text-xs`).
- **Manual Login Form:**
  - **Organization Code:** Input with a "Remember this organization" checkbox below it (saves to `localStorage`).
  - **Email Address:** Input with `Mail` icon prefix.
  - **Password:** Input with `Lock` icon prefix and show/hide eye toggle.
  - **Submit Button:** Gradient blue (`bg-blue-600` to `bg-blue-700`) with a loading state ("Authenticating...").
- **Error Handling:** Red alert boxes placed immediately above the submit button.

### 4.3 MFA Transition
- **Mechanism:** Slide-over transition instead of page navigation.
- **Animation:** Main form slides left (dimmed/blurred); MFA panel slides in from right.
- **MFA Panel:** 
  - Header: *"Verify your identity"*.
  - Input: 6-digit individual box pattern with auto-focus progression.
  - Actions: "Resend code" and "Return to login".

## 5. Technical Details & Polish
- **Focus States:** Custom `ring-blue-500/50` and subtle scale-up on focus.
- **Accessibility:** Full ARIA support and optimized tab-order.
- **Persistence:** `orgCode` stored in `localStorage` to pre-fill on return visits.
