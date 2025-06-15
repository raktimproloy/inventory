// components/PrivateRoute.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../../../config/firebase.config"; // Import Firebase auth
import { onAuthStateChanged } from "firebase/auth";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        router.push("/login"); // Redirect to login page if not authenticated
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Show loading state until we know the auth status
  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <>{children}</> : null;
};

export default PrivateRoute;
