# Mobile Bemlanja

React Native (Expo) app with Expo Router, NativeWind, and Supabase.

## Features

- Auth flow screens for login, sign up, forgot password, and update password.
- Product detail page with collapsible long description, organization coupons, image review preview, and native share action.
- Merchant detail page (`/merchant/[id]`) with share action, organization stats, and product list integration.
- Merchant product search + filter drawer (category and price range).
- Cart context with global cart badge, add-to-cart quantity drawer, and stock-aware variant validation.

## Environment

Create `.env` with:

```bash
EXPO_PUBLIC_APP_URL=<your-public-web-url>
```

`EXPO_PUBLIC_APP_URL` is used when generating share links for product and merchant pages.

## Development

1. Install dependencies

   ```bash
   npm install
   ```

2. Start development server

   ```bash
   npx expo start
   ```

## UI Guidelines

- Always use semantic color tokens from `globals.css` (`bg-background`, `text-foreground`, `bg-muted`, `border-border`, `text-error`, etc).
- Avoid hardcoded hex colors in screens/components unless there is a clear exception (for example brand-specific accent).
- Every new component or screen that loads remote data **must** include a skeleton loading state.
- Reuse `components/ui/Skeleton.tsx` for loading placeholders and shape them to match the final UI layout.
- For image-based UI, always provide a fallback state if image loading fails.
