import { Router } from "express";
import loginCtrl from "../controllers/login.controller.js";

const { login, logout } = loginCtrl;
const router = Router();

router.route('/')
    .post(login)
    .get(logout);

export default router;