import Head from "next/head";
import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import { Button } from "@chakra-ui/react";
import { useRouter } from "next/router";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();

  const test = async () => {
    const signedPayloadReq = await fetch(`/api/scraping`, {
      method: "POST",
      body: JSON.stringify({
        url: "https://www.amazon.co.jp/hz/wishlist/ls/2UXCAUWDYHE17?ref_=wl_share&viewType=grid",
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
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <>
        <Button onClick={test}>テスト</Button>
      </>
    </>
  );
}
