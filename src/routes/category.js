import { Router } from "express";
import jwt from "jsonwebtoken";
import categoryCtrl from "../controllers/category.controller.js";

const { addCategory, getCategories, setActiveCategory, getOneCategory, deleteCategory } = categoryCtrl;
const router = Router();

function checkToken(req, res, next) {
    try {
        const { myToken } = req.cookies;
        if (!myToken) {
            console.log('There is not token.')
            return res.status(401).json({ message: 'There is not token.' });
        }
        // se verifica si el token es correcto, si no lo es se produce una excepcion
        const token = jwt.verify(myToken, process.env.SECRET); 
        next();
    } catch (err) {
        console.log('Invalid token.')
        return res.status(401).json({ message: 'Invalid token.' });
    }
}

router.route('/')
    .get(getCategories)
    .post(addCategory)
// .delete(removeCategory);

router.route('/:id')
    .get(getOneCategory)
    .put(setActiveCategory)
    .delete( checkToken ,deleteCategory);

export default router;