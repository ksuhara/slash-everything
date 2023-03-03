import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import initializeFirebaseClient from "../configs/initFirebase";

// Helpful hook for you to get the currently authenticated user in Firebase.
export default function useFirebaseUser() {
  interface UserWithRole extends User {
    role?: string;
  }
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserWithRole | null>(null);
  const { auth, db } = initializeFirebaseClient();

  useEffect(() => {
    const listener = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser({ ...user, role: docSnap.data()?.role });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => {
      listener();
    };
  }, [auth]);

  return { isLoading, user };
}
