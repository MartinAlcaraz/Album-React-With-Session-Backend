import { Router } from "express";
import usersCtrl from "../controllers/users.controller.js";

const { getUsers, deleteUser, getOneUser } = usersCtrl;
const router = Router();

router.route('/')
    .get(getUsers)

router.route('/:id')
    .get(getOneUser)
    .delete(deleteUser);
    // .put(setActiveCategory);

export default router;