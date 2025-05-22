"use client";

// hooks/useReceivedBy.js
import { useState, useEffect } from "react";
import { getUserById } from "@/actions/users";

export function useReceivedBy(userId: string) {
  const [receivedByUser, setReceivedByUser] = useState<{
    name: string;
    email: string;
    phone: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Skip the fetch if no userId is provided
    if (!userId) {
      setReceivedByUser(null);
      return;
    }

    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const user = await getUserById(userId);
        setReceivedByUser(
          user
            ? {
                name: user.name,
                email: user.email,
                phone: user.phone,
              }
            : null
        );
      } catch (err: any) {
        console.error("Error fetching received by data:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]); // Only re-run when userId changes

  return {
    receivedByUser,
    isLoading,
    error,
  };
}
