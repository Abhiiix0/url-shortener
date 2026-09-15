import express from "express"
import cors from "cors"
import "dotenv/config"
import route from "./routes/url.route.js";
const app = express();
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (req, res) => {
    res.status(200)
})

app.use("/api",route)
export default app