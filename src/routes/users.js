import { Router } from "express";
import usersCtrl from "../controllers/users.controller.js";

const { getUsers, postUser, deleteUser, setActiveUser, getOneUser } = usersCtrl;
const router = Router();

router.route('/')
    .get(getUsers)
    .post(postUser);
    
router.route('/:id')
    .get(getOneUser)
    .delete(deleteUser)
    .put(setActiveUser);

export default router;