import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { NextApiRequest, NextApiResponse } from "next";
import initializeFirebaseServer from "../../../configs/initFirebaseAdmin";

export default async function login(req: NextApiRequest, res: NextApiResponse) {
  // Grab the login payload the user sent us with their request.
  const loginPayload = req.body.payload;
  // Set this to your domain to prevent signature malleability attacks.
  const domain = "slash-everything.vercel.app";

  const sdk = ThirdwebSDK.fromPrivateKey(
    // https://portal.thirdweb.com/sdk/set-up-the-sdk/securing-your-private-key
    process.env.ADMIN_PRIVATE_KEY!,
    "mumbai" // configure this to your network
  );

  let address;
  try {
    // Verify the address of the logged in client-side wallet by validating the provided client-side login request.
    address = sdk.auth.verify(domain, loginPayload);
  } catch (err) {
    // If the login request is invalid, return an error.
    console.error(err);
    return res.status(401).send("Unauthorized");
  }

  // Initialize the Firebase Admin SDK.
  const { auth } = initializeFirebaseServer();

  // Generate a JWT token for the user to be used on the client-side.
  const token = await auth.createCustomToken(address);

  // Send the token to the client to sign in with.
  return res.status(200).json({ token });
}
