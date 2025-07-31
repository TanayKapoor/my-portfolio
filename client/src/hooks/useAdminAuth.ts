import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

interface AdminStatusResponse {
  isAdmin: boolean;
}

export function useAdminAuth() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  
  const { data: adminStatus, isLoading: adminLoading, error: adminError } = useQuery<AdminStatusResponse>({
    queryKey: ["/api/auth/admin-status"],
    enabled: isAuthenticated,
    retry: false,
  });

  // We're loading if:
  // 1. Auth is still loading, OR
  // 2. Auth succeeded and admin status is still loading
  const isLoading = authLoading || (isAuthenticated && adminLoading);

  return {
    isAuthenticated,
    isAdmin: adminStatus?.isAdmin || false,
    isLoading,
    user,
  };
}