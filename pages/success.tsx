import { Header } from "@/components/Header";
import { Container, Heading, Stack, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function Success() {
  const router = useRouter();
  const { payment_token } = router.query;

  return (
    <>
      <Header />
      <Container py={{ base: "16", md: "24" }}>
        <Stack textAlign="center">
          <Heading>✅成功しました！</Heading>
          <Text>payment_token:{payment_token}</Text>
        </Stack>
      </Container>
    </>
  );
}
