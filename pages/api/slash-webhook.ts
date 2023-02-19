import type { NextApiRequest, NextApiResponse } from "next/types";

import initializeFirebaseServer from "../../configs/initFirebaseAdmin";

export default async function slashWebhook(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req, "req");
  console.log(req.body, "req.body");
  console.log(req.body.order_code, "req.body");
  const orderCode = req.body.order_code;
  const result = req.body.result;
  const transactionHash = req.body.transaction_hash;
  console.log(result, "result");
  const { db } = initializeFirebaseServer();
  const docRef = db.collection(`orders`).doc(orderCode);
  await docRef.update({
    status: result ? "processing" : "failed",
    transactionHash,
  });

  res.send(200);
}
