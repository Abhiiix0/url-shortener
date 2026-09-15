import { Router } from "express";
import { createUrl ,redirectUrl} from "../controller/url.controller.js";
const route = Router()

route.post("/url", createUrl)
route.get("/:shortCode", redirectUrl)

export default route