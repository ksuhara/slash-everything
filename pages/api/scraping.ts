// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";
import axios from "axios";
import sha256 from "crypto-js/sha256";
import randomstring from "randomstring";
import initializeFirebaseServer from "../../configs/initFirebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req.headers.authorization);
  if (!(req.headers && req.headers.authorization)) {
    return res
      .status(400)
      .json({ error: "Missing Authorization header value" });
  }
  const { url } = JSON.parse(req.body);
  const { db, auth } = initializeFirebaseServer();

  const decoded = await auth.verifyIdToken(req.headers.authorization);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const item = await page.$("span.a-offscreen");

  console.log(await (await item?.getProperty("innerHTML"))?.jsonValue());
  const priceString = await (await item?.getProperty("innerHTML"))?.jsonValue();
  await browser.close();

  // merchants has to implement new
  const amount = Number(priceString?.replace("￥", "")?.replace(",", ""));
  const amountType = "JPY";
  const orderCode = randomstring.generate({
    length: 16,
    charset: "alphanumeric",
    capitalization: "lowercase",
  });

  // automatically generated on the merchant management screen
  const authenticationToken = process.env.SLASH_AUTH_TOKEN;
  const hashToken = process.env.SLASH_HASH_TOKEN;

  // encrypt following Slash's manners
  const raw = orderCode + "::" + amount + "::" + hashToken;
  const hashHex = sha256(raw).toString();

  // call Paument Request API
  const requestObj = {
    identification_token: authenticationToken,
    order_code: orderCode,
    verify_token: hashHex,
    amount: amount,
    amount_type: amountType,
  };
  const paymentRequestUrl = "https://testnet.slash.fi/api/v1/payment/receive";
  const result = await axios
    .post(paymentRequestUrl, requestObj)
    .catch((error) => {
      return error.response;
    });

  if (result.status !== 200) {
    console.log(2);

    return {
      statusCode: result.status,
      body: JSON.stringify(result.data),
      headers: {
        "Content-Type": "application/json",
      },
    };
  }
  const paymentUrl = result.data.url;
  const paymentToken = result.data.token;

  const docRef = db.collection(`orders`).doc(orderCode);
  await docRef.set({
    requestUrl: url,
    orderCode,
    paymentUrl,
    amount,
    amountType,
    paymentToken,
    status: "initiated",
    user: decoded.uid,
  });

  console.log(paymentUrl);
  console.log(paymentToken);
  res.status(200).json({
    paymentUrl,
    paymentToken,
  });
}
