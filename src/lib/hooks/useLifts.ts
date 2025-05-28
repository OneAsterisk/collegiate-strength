import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores";

// Type for lift data - you can expand this based on your actual Lift interface
interface LiftData {
  squat: number;
  bench: number;
  deadlift: number;
  bodyWeight: number;
  age: number;
  gender: string;
  selectedUniversity: string;
  liftType: string;
}

// These would be your actual Firebase functions
// For now I'm using placeholders - replace with your actual implementations
const fetchUserLifts = async (userId: string) => {
  // Replace with actual Firebase call
  // e.g., return getUserLiftsPersonal(userId);
  console.log("Fetching lifts for user:", userId);
  return [];
};

const fetchAllLifts = async () => {
  // Replace with actual Firebase call
  // e.g., return getAllLifts();
  console.log("Fetching all lifts");
  return [];
};

const submitLiftData = async (liftData: LiftData) => {
  // Replace with actual Firebase call
  // e.g., return submitLift(...liftData);
  console.log("Submitting lift:", liftData);
  return liftData;
};

// Custom hooks using React Query
export const useUserLifts = () => {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: ["userLifts", user?.uid],
    queryFn: () => fetchUserLifts(user!.uid),
    enabled: !!user?.uid, // Only run query if user is authenticated
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAllLifts = () => {
  return useQuery({
    queryKey: ["allLifts"],
    queryFn: fetchAllLifts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSubmitLift = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: submitLiftData,
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["userLifts", user?.uid] });
      queryClient.invalidateQueries({ queryKey: ["allLifts"] });
    },
    onError: (error) => {
      console.error("Failed to submit lift:", error);
    },
  });
};
