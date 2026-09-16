import redisClient from "../config/redis.js";
import prisma from "../lib/prisma.js";

function notFoundPage(shortCode) {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Link not found — MiniLink</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 24px;
    background: #17233a;
    color: #f3ecd8;
    font-family: 'IBM Plex Mono', ui-monospace, monospace;
  }
  .page {
    width: 100%;
    max-width: 480px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .header-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px 12px;
    margin-bottom: 48px;
  }
  .brand-mark {
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.06em;
    color: #f3ecd8;
    text-decoration: none;
  }
  .visit-link {
    font-size: 13px;
    color: #a9b7cf;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .visit-link:hover {
    color: #f3ecd8;
  }
  .card {
    width: 100%;
    background: #efe3c8;
    border: 1px solid #c7b489;
    border-radius: 6px;
    padding: 32px 28px;
    box-shadow: 0 24px 48px -24px rgba(5, 9, 20, 0.6);
  }
  .about {
    margin-top: 24px;
    font-size: 13px;
    line-height: 1.6;
    color: #a9b7cf;
  }
  .eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #5c5138;
  }
  h1 {
    font-family: 'Archivo Black', 'Arial Black', sans-serif;
    font-size: 30px;
    line-height: 1.15;
    margin: 10px 0 12px;
    color: #211a10;
  }
  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    color: #5c5138;
  }
  code {
    display: inline-block;
    margin-top: 16px;
    font-size: 13px;
    color: #211a10;
    background: #f8f2e2;
    border: 1px solid #c7b489;
    border-radius: 4px;
    padding: 6px 10px;
  }
</style>
</head>
<body>
  <div class="page">
    <header class="header-row">
      <a class="brand-mark" href="/">MiniLink</a>
      <a class="visit-link" href="/">Visit MiniLink</a>
    </header>
    <div class="card">
      <span class="eyebrow">Claim tag</span>
      <h1>Link not found.</h1>
      <p>This claim tag doesn't match anything we've shipped. Check the code and try again.</p>
      <code>${shortCode}</code>
    </div>
    <p class="about">MiniLink turns long links into short ones. Paste a URL, ship it, and get a claim tag back with a short code you can share.</p>
  </div>
</body>
</html>`;
}

export const createUrl = async (req,res) => {
    const { url } = req.body;
    try {
        const newUrl = await prisma.url.create({
            data: {
                originalUrl: url,
                shortCode:Math.random().toString(36).slice(2, 8)
            }
        })
        return res.status(201).json({
            message: "Short URL created successfully",
            success: true,
            newUrl:`${process.env.FRONTEND_URL}/${newUrl.shortCode}`,
            originalUrl: newUrl.originalUrl,
            createdAt: newUrl.createdAt,
            clickCount: newUrl.clickCount
        });

    } catch (error) {
        console.error(error)
        return res.status(400).json({
            message: "something went wrong",
            success: false,
        })
    }
}

export const redirectUrl = async (req, res) => {
    const { shortCode } = req.params;
    try {
        const cachedUrl = await redisClient.get(shortCode)
         if (cachedUrl) {
            console.log("Redis HIT");
            return res.redirect(302,cachedUrl);
        }
        console.log("Redis MISS");
        const url = await prisma.url.findUnique({
            where: { shortCode }
        })
        if (!url) {
            return res.status(404).send(notFoundPage(shortCode))
        }
        await prisma.url.update({
            where: { shortCode },
            data: { clickCount: { increment: 1 } },
        })
        await redisClient.set(shortCode, url.originalUrl, {
            EX: 60 * 60 * 24 /
        })
        return res.redirect(302, url.originalUrl)
        
       
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: error.message,
            success: false,
        })
    }
}
