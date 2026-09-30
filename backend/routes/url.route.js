import { Router } from "express";
import { createUrl, redirectUrl,getAnalytics, getALlAnalytics } from "../controller/url.controller.js";
const route = Router()

route.post("/api/url", createUrl)
route.get("/api/analytics/:shortCode", getAnalytics)
route.get("/api/analytics", getALlAnalytics)
route.get("/:shortCode", redirectUrl)

export default route