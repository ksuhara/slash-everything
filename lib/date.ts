import { Timestamp } from "firebase/firestore";

export const formatDate = (timestamp: Timestamp) => {
  const date = timestamp.toDate();
  return date.toLocaleString();
};
