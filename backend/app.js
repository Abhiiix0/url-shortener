import express from "express"
import cors from "cors"
import "dotenv/config"
import route from "./routes/url.route.js";
const app = express();
app.set("trust proxy", 1)
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (req, res) => {
    res.status(200).json({ status: "ok" })
})

app.use("/",route)
export default app