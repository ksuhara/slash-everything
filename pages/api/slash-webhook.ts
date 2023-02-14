import type { NextApiRequest, NextApiResponse } from "next/types";

import initializeFirebaseServer from "../../configs/initFirebaseAdmin";

export default async function slashWebhook(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req, "req");
  console.log(req.body, "req.body");
  const { orderCode, transactionHash, result } = JSON.parse(req.body);
  console.log(result, "result");
  const { db } = initializeFirebaseServer();
  const docRef = db.collection(`orders`).doc(orderCode);
  await docRef.update({
    status: result ? "settled" : "failed",
    transactionHash,
  });

  res.send(200);
}
