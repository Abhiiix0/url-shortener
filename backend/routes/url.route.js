import { Router } from "express";
import { createUrl, redirectUrl } from "../controller/url.controller.js";
const route = Router()

route.post("/api/url", createUrl)
route.get("/:shortCode", redirectUrl)

export default route