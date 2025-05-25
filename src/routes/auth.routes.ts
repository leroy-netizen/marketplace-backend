import { Router } from "express";
import { signin, signup } from "../controllers/auth.controller";

const router = Router();

router.post("/signup", signup);
//@ts-ignore
router.post("/signin", signin);

export default router;
