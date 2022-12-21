import { Router } from "express";
import picturesCtrl from "../controllers/pictures.controller.js";
const { getPictures, postPicture, deleteOnePicture, deleteAllPictures } = picturesCtrl;
const router = Router();

router.route('/')
    .post(postPicture);
router.route('/:id')
    .get(getPictures)
    .patch(deleteOnePicture)
    .delete(deleteAllPictures)

export default router;