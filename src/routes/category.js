import { Router } from "express";
import categoryCtrl from "../controllers/category.controller.js";

const { addCategory, getCategories, setActiveCategory, getOneCategory } = categoryCtrl;
const router = Router();

router.route('/')
    .get(getCategories)
    .post(addCategory)
// .delete(removeCategory);

router.route('/:id')
    .get(getOneCategory)
    .put(setActiveCategory);

export default router;