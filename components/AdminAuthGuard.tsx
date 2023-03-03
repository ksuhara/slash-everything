import { Box } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

import useAuth from "../hooks/useFirebaseUser";

type AdminAuthGuardProps = {
  children: React.ReactNode;
};

const AdminAuthGuard = ({ children }: AdminAuthGuardProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <Box textAlign="center" w="full" pt="xl">
        Loading...
      </Box>
    );
  } else if (!user || user.role !== "admin") {
    return (
      <Box textAlign="center" w="full" pt="xl">
        need admin role
      </Box>
    );
  }

  return <>{children}</>;
};

export default AdminAuthGuard;
