import { QueryClient } from "@tanstack/react-query";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Time in milliseconds that data is considered fresh
        staleTime: 5 * 60 * 1000, // 5 minutes
        // Time to keep data in cache when unused
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        // Retry configuration
        retry: (failureCount, error: unknown) => {
          // Don't retry on 4xx errors
          if (error && typeof error === "object" && "status" in error) {
            const status = (error as { status: number }).status;
            if (status >= 400 && status < 500) return false;
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        // Refetch on window focus (can be disabled for better UX)
        refetchOnWindowFocus: false,
        // Refetch on reconnect
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
      },
    },
  });
