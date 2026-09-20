import { Router } from "express";
import { createUrl, redirectUrl,getAnalytics } from "../controller/url.controller.js";
const route = Router()

route.post("/api/url", createUrl)
route.get("/api/analytics/:shortCode", getAnalytics)
route.get("/:shortCode", redirectUrl)

export default route