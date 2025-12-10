const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/convert", async (req, res) => {
  const { url } = req.body;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });

    const messages = await page.evaluate(() => {
      const arr = [];
      document.querySelectorAll("[data-message-author]").forEach(el => {
        arr.push({
          author: el.getAttribute("data-message-author"),
          text: el.innerText
        });
      });
      return arr;
    });

    await browser.close();
    res.json({ messages });

  } catch (err) {
    res.status(500).json({ error: "Scraping failed", details: err.toString() });
  }
});

app.listen(3000, () => console.log("API running on port 3000"));
