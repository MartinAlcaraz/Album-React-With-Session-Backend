import { Router } from "express";
import registerCtrl from "../controllers/register.controller.js";

const { register } = registerCtrl;
const router = Router();

router.route('/')
    .post(register);

export default router;