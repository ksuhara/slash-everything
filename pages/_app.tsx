import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider
      desiredChainId={ChainId.Mumbai}
      authConfig={{
        // The backend URL of the authentication endoints.
        authUrl: "/api/auth",
        // Set this to your domain to prevent signature malleability attacks.
        domain: "slash-everything.vercel.app",
      }}
    >
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </ThirdwebProvider>
  );
}
