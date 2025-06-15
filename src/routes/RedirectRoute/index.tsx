// components/RedirectRoute.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../../../config/firebase.config"; // Import Firebase auth
import { onAuthStateChanged } from "firebase/auth";

const RedirectRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        router.push("/"); // Redirect to a protected page if logged in
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>; // Optional loading state
  }

  return !user ? <>{children}</> : null; // Render children only if the user is not authenticated
};

export default RedirectRoute;
