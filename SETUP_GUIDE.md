# Zustand + TanStack React Query Setup Guide

This project now includes a comprehensive state management setup combining **Zustand** for client-side state and **TanStack React Query** for server state management, along with **PostHog** for analytics.

## 🏗️ Architecture Overview

### Provider Structure

```
Providers (Root)
├── QueryProvider (TanStack React Query)
│   ├── QueryClient configuration
│   └── React Query Devtools
└── PostHogProvider (Analytics)
    ├── PostHog initialization
    └── Page view tracking
```

### State Management

- **Zustand**: Client-side state (UI state, user preferences, local data)
- **TanStack React Query**: Server state (API calls, caching, synchronization)
- **PostHog**: Analytics and user tracking

## 📁 File Structure

```
src/
├── app/
│   ├── providers.tsx          # Combined providers setup
│   └── layout.tsx             # Root layout with providers
├── lib/
│   ├── stores/                # Zustand stores
│   │   ├── authStore.ts       # Authentication state
│   │   ├── appStore.ts        # Application/UI state
│   │   └── index.ts           # Store exports
│   ├── hooks/                 # React Query hooks
│   │   ├── useLifts.ts        # Lift data hooks
│   │   └── index.ts           # Hook exports
│   └── queryClient.ts         # React Query configuration
```

## 🚀 Usage Examples

### Zustand Stores

#### Authentication Store

```typescript
import { useAuthStore } from "@/lib/stores";

function MyComponent() {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();

  // Use authentication state...
}
```

#### App Store

```typescript
import { useAppStore } from "@/lib/stores";

function MyComponent() {
  const { weightUnit, setWeightUnit, sidebarOpen, toggleSidebar } =
    useAppStore();

  // Use app state...
}
```

### TanStack React Query

#### Queries (Data Fetching)

```typescript
import { useUserLifts, useAllLifts } from "@/lib/hooks";

function MyComponent() {
  const { data: userLifts, isLoading, error } = useUserLifts();
  const { data: allLifts } = useAllLifts();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error occurred</div>;

  return <div>{/* Render data */}</div>;
}
```

#### Mutations (Data Updates)

```typescript
import { useSubmitLift } from "@/lib/hooks";

function MyComponent() {
  const submitLift = useSubmitLift();

  const handleSubmit = (liftData) => {
    submitLift.mutate(liftData, {
      onSuccess: () => {
        // Handle success
      },
      onError: (error) => {
        // Handle error
      },
    });
  };

  return (
    <button onClick={handleSubmit} disabled={submitLift.isPending}>
      {submitLift.isPending ? "Submitting..." : "Submit"}
    </button>
  );
}
```

## 🔧 Configuration

### React Query Client

The QueryClient is configured with optimal defaults:

- **Stale Time**: 5 minutes
- **Cache Time**: 10 minutes
- **Retry Logic**: Smart retry based on error types
- **Refetch**: On reconnect, not on window focus

### Zustand Persistence

Some stores use persistence:

- **AuthStore**: Persists user and authentication state
- **AppStore**: Persists user preferences (theme, weight unit, etc.)

## 🛠️ Adding New Features

### Creating a New Zustand Store

1. Create store file in `src/lib/stores/`:

```typescript
// src/lib/stores/myStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MyState {
  data: string;
  setData: (data: string) => void;
}

export const useMyStore = create<MyState>()(
  persist(
    (set) => ({
      data: "",
      setData: (data) => set({ data }),
    }),
    {
      name: "my-storage",
    }
  )
);
```

2. Export from `src/lib/stores/index.ts`:

```typescript
export { useMyStore } from "./myStore";
```

### Creating React Query Hooks

1. Create hook file in `src/lib/hooks/`:

```typescript
// src/lib/hooks/useMyData.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useMyData = () => {
  return useQuery({
    queryKey: ["myData"],
    queryFn: async () => {
      // Your API call here
      return fetch("/api/my-data").then((res) => res.json());
    },
  });
};

export const useUpdateMyData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      // Your API call here
      return fetch("/api/my-data", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myData"] });
    },
  });
};
```

2. Export from `src/lib/hooks/index.ts`:

```typescript
export * from "./useMyData";
```

## 🎯 Best Practices

### Zustand

- Keep stores focused and small
- Use persistence wisely (only for data that should survive page reloads)
- Use selectors to avoid unnecessary re-renders
- Group related state together

### React Query

- Use meaningful query keys
- Implement proper error handling
- Use optimistic updates for better UX
- Set appropriate stale times based on data freshness needs
- Use mutations for server state changes

### General

- Keep server state in React Query
- Keep client state in Zustand
- Use TypeScript for better developer experience
- Test your state management logic

## 📊 Development Tools

- **React Query Devtools**: Available in development mode (bottom-right corner)
- **Zustand**: Use browser dev tools to inspect persisted state
- **PostHog**: Analytics dashboard for user behavior

## 🚦 Next Steps

1. Replace placeholder functions in `useLifts.ts` with your actual Firebase functions
2. Add proper TypeScript types for your data structures
3. Implement proper error handling
4. Add loading states and optimistic updates
5. Configure proper authentication flow
6. Set up proper analytics tracking

This setup provides a solid foundation for scalable state management in your React application!
