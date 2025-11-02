import { useUser } from "@clerk/clerk-react";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { useEffect } from "react";

const useAuth = () => {
  const { isLoaded, user } = useUser(); // Clerk user data
  const router = useLocalizedRouter();

  useEffect(() => {
    // Check if user is authenticated and isLoaded is true
    if (isLoaded && user) {
      // Redirect to dashboard if the user is authenticated
      router.push("/dashboard");
    }
  }, [isLoaded, user, router]);

  return { isLoaded, user };
};

export default useAuth;
