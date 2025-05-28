"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useState } from "react";
import { usePostHog } from "posthog-js/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { createQueryClient } from "@/lib/queryClient";

// Create a single QueryClient instance that will be reused
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = createQueryClient();
    return browserQueryClient;
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check if PostHog key exists and is valid
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

    if (!posthogKey || posthogKey === "your_posthog_project_key_here") {
      console.warn(
        "PostHog: No valid API key found. Analytics will be disabled."
      );
      return;
    }

    // Skip initialization in development if no key
    if (process.env.NODE_ENV === "development" && !posthogKey) {
      return;
    }

    // Initialize PostHog with better error handling
    try {
      posthog.init(posthogKey, {
        // Use reverse proxy to bypass ad blockers, fallback to direct
        api_host:
          process.env.NEXT_PUBLIC_POSTHOG_USE_PROXY === "true"
            ? "/ingest"
            : process.env.NEXT_PUBLIC_POSTHOG_HOST ||
              "https://us.i.posthog.com",

        person_profiles: "identified_only",
        capture_pageview: false, // We handle this manually
        capture_pageleave: true, // Capture when users leave pages

        // CORS and network settings
        cross_subdomain_cookie: false,
        secure_cookie: true,

        // Better error handling
        loaded: function () {
          if (process.env.NEXT_PUBLIC_POSTHOG_DEBUG === "true") {
            console.log("PostHog loaded successfully");
          }
        },

        // Additional settings to help with CORS
        persistence: "localStorage+cookie",

        // Respect Do Not Track
        respect_dnt: true,

        // Session recording settings (disable if causing issues)
        disable_session_recording: false,

        // Advanced settings to reduce ad blocker detection
        property_blacklist: ["$current_url", "$screen_height", "$screen_width"],

        // Bootstrap options
        bootstrap: {
          distinctID: undefined,
          isIdentifiedID: false,
        },

        // Additional ad blocker bypass settings
        autocapture: false, // Disable autocapture to reduce detection
        capture_heatmaps: false, // Disable heatmaps
      });
    } catch (error) {
      console.error("PostHog initialization failed:", error);
    }
  }, []);

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  );
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
}

// Combined providers for easy use
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <PostHogProvider>{children}</PostHogProvider>
    </QueryProvider>
  );
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  // Track pageviews with error handling
  useEffect(() => {
    if (pathname && posthog) {
      try {
        let url = window.origin + pathname;
        if (searchParams.toString()) {
          url = url + "?" + searchParams.toString();
        }

        posthog.capture("$pageview", {
          $current_url: url,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("PostHog pageview capture failed:", error);
      }
    }
  }, [pathname, searchParams, posthog]);

  return null;
}

// Wrap PostHogPageView in Suspense to avoid the useSearchParams usage above
// from de-opting the whole app into client-side rendering
// See: https://nextjs.org/docs/messages/deopted-into-client-rendering
function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}
