# Mobile Bemlanja

React Native (Expo) app with Expo Router, NativeWind, and Supabase.

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
