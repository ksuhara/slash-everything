import initializeFirebaseClient from "@/configs/initFirebase";
import { statusToColor } from "@/configs/status";
import useFirebaseUser from "@/hooks/useFirebaseUser";
import useFirebaseUserData from "@/hooks/useFirebaseUserData";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  chakra,
  Container,
  FormControl,
  FormErrorMessage,
  Heading,
  IconButton,
  Input,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useAddress, useMetamask, useSDK } from "@thirdweb-dev/react";
import { signInWithCustomToken } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useState } from "react";
import { FaAmazon } from "react-icons/fa";
import { Header } from "../components/Header";

export default function Home() {
  const router = useRouter();
  const address = useAddress();
  const sdk = useSDK();
  const { auth, db } = initializeFirebaseClient();
  const { user } = useFirebaseUser();
  const { orders } = useFirebaseUserData();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [amazonUrl, setAmazonUrl] = useState("");
  const [amount, setAmount] = useState("");

  const signIn = async () => {
    if (!address) return;
    const payload = await sdk?.auth.login("slash-everything.vercel.app");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload }),
    });
    const { token } = await res.json();
    signInWithCustomToken(auth, token)
      .then((userCredential) => {
        const user = userCredential.user;
        const usersRef = doc(db, "users", user.uid!);
        getDoc(usersRef).then((doc) => {
          if (!doc.exists()) {
            setDoc(usersRef, { createdAt: serverTimestamp() }, { merge: true });
          }
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const connectWithMetamask = useMetamask();

  const payment = async () => {
    if (!amazonUrl || !amount) return;
    setLoading(true);
    console.log(user, "user");
    const idToken = await auth?.currentUser?.getIdToken();

    const signedPayloadReq = await fetch(`/api/scraping`, {
      method: "POST",
      body: JSON.stringify({
        amazonUrl,
        amount,
      }),
      headers: {
        Authorization: idToken || "unauthenticated",
      },
    });
    if (signedPayloadReq.status === 200) {
      const json = await signedPayloadReq.json();
      router.push(json.paymentUrl);
      setLoading(false);
    } else {
      setLoading(false);
      alert(
        "You have already started this payment. Please continue the payment or start from order again."
      );
    }
  };

  const handleAmazonUrlChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = event.target.value;
    setAmazonUrl(inputValue);
    if (
      inputValue &&
      !inputValue.includes("https://www.amazon.co.jp/hz/wishlist/")
    ) {
      setError("error:Amazonの欲しい物リストのURLではないようです");
    } else {
      setError("");
    }
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setAmount(inputValue);

    if (inputValue && parseInt(inputValue) > 10000) {
      setError("error:現在Slash-Everythingは10,000円以下にのみ対応しています");
    } else {
      setError("");
    }
  };

  return (
    <>
      <Header />
      <Box as="section" bg="bg-surface" py={{ base: "16", md: "24" }}>
        <Container>
          <Stack
            spacing={{ base: "8", md: "10" }}
            align="center"
            px={{ base: "4", md: "0" }}
          >
            <Stack spacing={{ base: "4", md: "6" }} textAlign="center">
              <Stack spacing="3">
                <Heading
                  size={{ base: "md", md: "3xl" }}
                  fontWeight="extrabold"
                  fontStyle="italic"
                  color="blue.400"
                >
                  Slash Everything
                </Heading>
                <Text
                  color="blue.400"
                  fontWeight="extrabold"
                  fontSize={{ base: "lg", md: "xl" }}
                  maxW="3xl"
                >
                  クリプトで欲しいものを買おう
                </Text>
              </Stack>
            </Stack>
            <Stack textAlign="center">
              <Heading size="lg">Step 1</Heading>
              <Text textAlign={{ base: "left", md: "center" }}>
                Amazonで欲しいものリストを作成してください。作成方法は
                <Link
                  href="https://www.amazon.co.jp/gp/help/customer/display.html?nodeId=GHCGC7B7SQ222YMD"
                  target="_blank"
                  color="blue.400"
                  fontWeight="bold"
                >
                  こちら
                </Link>
              </Text>
              <Text textAlign={{ base: "left", md: "center" }}>
                住所を知られたくない方は匿名で設定してください。
              </Text>
            </Stack>
            <Stack textAlign="center">
              <Heading size="lg">Step 2</Heading>
              <Text textAlign={{ base: "left", md: "center" }}>
                欲しいものリストのURLを入力して、クリプト決済ボタンを押してください。
              </Text>
              <Text textAlign={{ base: "left", md: "center" }}>
                リンクが切り替わるので、クリプト決済を完了してください。
              </Text>
              <chakra.form width={{ base: "full" }}>
                <Stack
                  direction={{ base: "column" }}
                  spacing="4"
                  shouldWrapChildren
                  textAlign="center"
                >
                  <Input
                    size="lg"
                    placeholder="欲しいものリストのURLを入力してください"
                    type="url"
                    required
                    mx="auto"
                    onChange={handleAmazonUrlChange}
                  />
                  <FormControl isInvalid={Boolean(error)}>
                    <Input
                      size="lg"
                      placeholder="¥ 金額"
                      type="number"
                      required
                      onChange={handleAmountChange}
                    />
                    {error && <FormErrorMessage>{error}</FormErrorMessage>}
                  </FormControl>
                  {address ? (
                    <>
                      {user ? (
                        <Button
                          onClick={payment}
                          mx="auto"
                          isLoading={loading}
                          loadingText="loading..."
                          isDisabled={
                            !amazonUrl || !amount || Number(amount) > 10000
                          }
                        >
                          Slash Payment
                        </Button>
                      ) : (
                        <Button onClick={signIn} size="lg" minWidth="48">
                          Sign in
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button
                      onClick={connectWithMetamask}
                      size="lg"
                      minWidth="48"
                    >
                      Connect Wallet
                    </Button>
                  )}
                </Stack>
              </chakra.form>
            </Stack>
            <Stack textAlign="center">
              <Heading size="lg">Step 3</Heading>
              <Text textAlign={{ base: "left", md: "center" }}>
                運営が欲しいものをプレゼントするのでお待ちください。
              </Text>
              <Text textAlign={{ base: "left", md: "center" }}>
                プレゼントされるまで、欲しいものリストは削除・変更しないでください。
              </Text>
              <Stack spacing="4">
                {orders?.map((order) => {
                  return (
                    <Card
                      key={order.orderCode}
                      size="sm"
                      border="1px"
                      borderColor="gray.100"
                    >
                      <CardHeader pb="0" textAlign="left">
                        <Stack direction="row" justifyContent="space-between">
                          <Text>id: {order.orderCode}</Text>
                          <Text fontSize="lg" fontWeight="extrabold">
                            {order.amount}円
                          </Text>
                        </Stack>
                      </CardHeader>
                      <CardBody textAlign="left">
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Link href={order.requestUrl} target="_blank">
                            <IconButton
                              colorScheme="gray"
                              size="sm"
                              icon={<FaAmazon fontSize="1.25rem" />}
                              aria-label="Amazon"
                            />
                          </Link>
                          <Badge
                            colorScheme={statusToColor[order.status]}
                            height="5"
                          >
                            {order.status}
                          </Badge>
                        </Stack>
                      </CardBody>
                    </Card>
                  );
                })}
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
