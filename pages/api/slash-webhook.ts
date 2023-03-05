import type { NextApiRequest, NextApiResponse } from "next/types";

import initializeFirebaseServer from "../../configs/initFirebaseAdmin";

export default async function slashWebhook(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const orderCode = req.body.order_code;
  const result = req.body.result;
  const transactionHash = req.body.transaction_hash;
  const { db } = initializeFirebaseServer();
  const docRef = db.collection(`orders`).doc(orderCode);
  await docRef.update({
    status: result ? "processing" : "failed",
    transactionHash,
  });

  res.send(200);
}
