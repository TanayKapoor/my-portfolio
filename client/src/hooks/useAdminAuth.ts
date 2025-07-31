import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

interface AdminStatusResponse {
  isAdmin: boolean;
}

export function useAdminAuth() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const { data: adminStatus, isLoading: adminLoading } = useQuery<AdminStatusResponse>({
    queryKey: ["/api/auth/admin-status"],
    enabled: isAuthenticated,
    retry: false,
  });

  return {
    isAuthenticated,
    isAdmin: adminStatus?.isAdmin || false,
    isLoading: authLoading || (isAuthenticated && adminLoading),
  };
}