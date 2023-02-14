import {
  collection,
  doc,
  DocumentData,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import initializeFirebaseClient from "../configs/initFirebase";
import useFirebaseUser from "./useFirebaseUser";

// Helpful hook for you to read the currently authenticated user's document from Firestore using their ID
export default function useFirebaseDocument() {
  const { db } = initializeFirebaseClient();
  const { user, isLoading: loadingUser } = useFirebaseUser();
  const [isLoading, setIsLoading] = useState(true);
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [orders, setOrders] = useState<DocumentData[] | null>(null);

  useEffect(() => {
    if (!loadingUser && user && db) {
      (async () => {
        const docRef = doc(db, "users", user.uid);
        const listener = onSnapshot(docRef, (doc) => {
          if (doc.exists()) {
            setDocument({
              ...doc.data(),
              id: doc.id,
            });
          } else {
            setDocument(null);
          }
          setIsLoading(false);
        });

        const q = query(
          collection(db, "orders"),
          where("user", "==", user.uid)
        );
        console.log(user.uid);
        const contractListner = onSnapshot(q, async (querySnapshot) => {
          const orderlist: any = [];
          console.log(orderlist);
          querySnapshot.forEach((doc) => {
            console.log(doc.data(), "dox");
            orderlist.push(doc.data());
          });
          setOrders(orderlist);
          setIsLoading(false);
        });

        return () => {
          listener();
          contractListner();
        };
      })();
    } else {
      setIsLoading(false);
    }
  }, [db, user, loadingUser]);

  return { isLoading, document, orders };
}
