import { Text } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function Success() {
  const router = useRouter();
  const { payment_token } = router.query;

  return (
    <>
      <Text>✅成功しました！</Text>
      <Text>payment_token:{payment_token}</Text>
    </>
  );
}
