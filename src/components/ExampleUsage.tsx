"use client";

import { useAuthStore, useAppStore } from "@/lib/stores";
import { useUserLifts, useAllLifts, useSubmitLift } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import type { User } from "firebase/auth";

export function ExampleUsage() {
  // Zustand stores usage
  const { user, isAuthenticated, setUser } = useAuthStore();
  const {
    weightUnit,
    sidebarOpen,
    setWeightUnit,
    toggleSidebar,
    selectedUniversity,
    setSelectedUniversity,
  } = useAppStore();

  // React Query hooks usage
  const {
    data: userLifts,
    isLoading: userLiftsLoading,
    error: userLiftsError,
  } = useUserLifts();
  const { data: allLifts, isLoading: allLiftsLoading } = useAllLifts();
  const submitLiftMutation = useSubmitLift();

  const handleSubmitLift = () => {
    submitLiftMutation.mutate({
      squat: 225,
      bench: 185,
      deadlift: 315,
      bodyWeight: 180,
      age: 22,
      gender: "Male",
      selectedUniversity: "Example University",
      liftType: "Gym Lift",
    });
  };

  const handleLogin = () => {
    // Simulate login - replace with actual Firebase auth
    const mockUser: Partial<User> = {
      uid: "mock-uid-123",
      email: "test@example.com",
      displayName: "Test User",
    };
    setUser(mockUser as User);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">
        Example: Zustand + React Query Usage
      </h2>

      {/* Authentication State */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Auth State (Zustand)</h3>
        <p>Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
        <p>User: {user?.displayName || "None"}</p>
        {!isAuthenticated && (
          <Button onClick={handleLogin} className="mt-2">
            Mock Login
          </Button>
        )}
      </div>

      {/* App State */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">App State (Zustand)</h3>
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium">Weight Unit:</label>
            <div className="flex gap-2">
              <Button
                variant={weightUnit === "lbs" ? "default" : "outline"}
                onClick={() => setWeightUnit("lbs")}
                size="sm"
              >
                LBS
              </Button>
              <Button
                variant={weightUnit === "kg" ? "default" : "outline"}
                onClick={() => setWeightUnit("kg")}
                size="sm"
              >
                KG
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">University:</label>
            <input
              type="text"
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
              placeholder="Enter university"
              className="mt-1 p-2 border rounded w-full"
            />
          </div>

          <div>
            <Button onClick={toggleSidebar} variant="outline" size="sm">
              Sidebar: {sidebarOpen ? "Open" : "Closed"}
            </Button>
          </div>
        </div>
      </div>

      {/* React Query Data */}
      <div className="border p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          Data Fetching (React Query)
        </h3>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium">User Lifts:</h4>
            {userLiftsLoading ? (
              <p>Loading user lifts...</p>
            ) : userLiftsError ? (
              <p className="text-red-500">Error loading lifts</p>
            ) : (
              <p>Loaded {userLifts?.length || 0} lifts</p>
            )}
          </div>

          <div>
            <h4 className="font-medium">All Lifts:</h4>
            {allLiftsLoading ? (
              <p>Loading all lifts...</p>
            ) : (
              <p>Loaded {allLifts?.length || 0} lifts</p>
            )}
          </div>

          <div>
            <Button
              onClick={handleSubmitLift}
              disabled={submitLiftMutation.isPending}
            >
              {submitLiftMutation.isPending
                ? "Submitting..."
                : "Submit Test Lift"}
            </Button>
            {submitLiftMutation.isError && (
              <p className="text-red-500 mt-1">Failed to submit lift</p>
            )}
            {submitLiftMutation.isSuccess && (
              <p className="text-green-500 mt-1">
                Lift submitted successfully!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
