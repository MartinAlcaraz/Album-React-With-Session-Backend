import { Router } from "express";
import loginCtrl from "../controllers/login.controller.js";

const { login, logout , isLogged} = loginCtrl;
const router = Router();

router.route('/')
    .get(isLogged)
    .post(login)
    .put(logout);

export default router;