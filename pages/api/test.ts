import type { NextApiRequest, NextApiResponse } from "next/types";
import fetch from "node-fetch";
import jsdom from "jsdom";
const { JSDOM } = jsdom;

export default async function test(req: NextApiRequest, res: NextApiResponse) {
  const { url } = JSON.parse(req.body);
  console.log(url, "url");

  const test = await fetch(url);
  const body = await test.text(); // HTMLをテキストで取得
  const dom = new JSDOM(body); // パース
  const offscreen = dom.window.document.querySelector(".a-offscreen");
  console.log(offscreen?.innerHTML);
  const amount = Number(
    offscreen?.innerHTML?.replace("￥", "")?.replace(",", "")
  );
  console.log(amount);

  res.send(200);
}
