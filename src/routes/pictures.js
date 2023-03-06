import { Router } from "express";
import picturesCtrl from "../controllers/pictures.controller.js";
import jwt from "jsonwebtoken";

const { getPictures, postPicture, deleteOnePicture, deleteAllPictures } = picturesCtrl;
const router = Router();

function checkToken(req, res, next) {
    try {
        const { myToken } = req.cookies;
        if (!myToken) {
            return res.status(401).json({ message: 'There is not token.' });
        }
        // se verifica si el token es correcto, si no lo es se produce una excepcion
        const token = jwt.verify(myToken, process.env.SECRET); 
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
}

router.route('/')
    .post(checkToken, postPicture);
router.route('/:id')
    .get(checkToken, getPictures)
    .delete(checkToken, deleteOnePicture);

export default router;