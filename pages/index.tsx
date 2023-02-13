import initializeFirebaseClient from "@/configs/initFirebase";
import {
  Box,
  Button,
  chakra,
  Container,
  FormControl,
  Heading,
  Input,
  Stack,
  Text,
  Image,
} from "@chakra-ui/react";
import { useAddress, useMetamask, useSDK } from "@thirdweb-dev/react";
import { useRouter } from "next/router";
import { Header } from "../components/Header";
import { signInWithCustomToken, signOut } from "firebase/auth";
import { getDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import useFirebaseUser from "@/configs/useFirebaseUser";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const address = useAddress();
  const sdk = useSDK();
  const { auth, db } = initializeFirebaseClient();
  const { user, isLoading: loadingAuth } = useFirebaseUser();

  const [amazonUrl, setAmazonUrl] = useState("");

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

  const test = async () => {
    if (!amazonUrl) return;
    const signedPayloadReq = await fetch(`/api/scraping`, {
      method: "POST",
      body: JSON.stringify({
        url: amazonUrl,
      }),
    });
    if (signedPayloadReq.status === 200) {
      const json = await signedPayloadReq.json();
      router.push(json.paymentUrl);
    } else {
      alert(
        "You have already started this payment. Please continue the payment or start from order again."
      );
    }
  };
  return (
    <>
      <Header />
      <Box as="section" bg="bg-surface" py={{ base: "16", md: "24" }}>
        <Container>
          <Stack spacing={{ base: "8", md: "10" }} align="center">
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
              </Stack>
              <Text
                color="muted"
                fontSize={{ base: "lg", md: "xl" }}
                maxW="3xl"
              >
                Amazonでクリプト決済でお買い物しちゃおう
              </Text>
            </Stack>
            <Stack textAlign="center">
              <Heading size="lg">Step 1</Heading>
              <Text>
                Amazonで欲しいものリストを作成してください。作成方法はこちら
              </Text>
              <Text>住所を知られたくない方は匿名で設定してください。</Text>
            </Stack>
            <Stack textAlign="center">
              <Heading size="lg">Step 2</Heading>
              <Text>
                欲しいものリストのURLを入力して、クリプト決済ボタンを押してください。
              </Text>
              <Text>
                リンクが切り替わるので、クリプト決済を完了してください。
              </Text>
              <chakra.form width={{ base: "full", md: "md" }}>
                <Stack
                  direction={{ base: "column", md: "row" }}
                  spacing="4"
                  shouldWrapChildren
                >
                  <FormControl>
                    <Input
                      size="lg"
                      placeholder="欲しいものリストのURLを入力してください"
                      type="email"
                      required
                      minWidth="sm"
                      onChange={(e) => setAmazonUrl(e.target.value)}
                    />
                  </FormControl>
                  {address ? (
                    <>
                      {user ? (
                        <Image
                          src="payment-button_light.png"
                          width="40"
                          onClick={test}
                          alt="button"
                          boxShadow="2xl"
                        ></Image>
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
              <Text>運営が欲しいものをプレゼントするのでお待ちください。</Text>
              <Text>
                プレゼントされるまで、欲しいものリストは削除・変更しないでください。
              </Text>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
