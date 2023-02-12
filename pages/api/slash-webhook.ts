import type { NextApiRequest, NextApiResponse } from "next/types";

import initializeFirebaseServer from "../../configs/initFirebaseAdmin";

export default async function slashWebhook(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    order_code: orderCode,
    transaction_hash: transactionHash,
    result,
  } = JSON.parse(req.body);
  console.log(result, "result");
  const { db } = initializeFirebaseServer();
  const docRef = db.collection(`orders`).doc(orderCode);
  await docRef.update({
    status: result ? "settled" : "failed",
    transactionHash,
  });

  res.send(200);
}
