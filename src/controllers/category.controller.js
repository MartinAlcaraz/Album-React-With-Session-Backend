import User from "../models/User.js";
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import Category from "../models/Category.js";
import { v4 as uuid } from 'uuid';
import { error } from "console";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const categoryCtrl = {};

const guardarImgEnCloudinary = async (image) => {
    try {
        // se corta la extencion del archivo para que solo quede el nombre
        let nameImg = image.filename;
        let i = nameImg.lastIndexOf('.');
        if (i > 0) {
            nameImg = nameImg.slice(0, i);
        }

        //-- subir la imagen a cloudinary  --//
        let cloudResult = await cloudinary.uploader.upload(
            image.path,     // direccion de la imagen subida y guardada en /public/uploads por multer                
            {
                public_id: nameImg,
                upload_preset: "user_profile_photo"
            }
        );
        // se borra la imagen guardada en public/uploads/ --> (req.file)
        try {
            fs.unlinkSync(image.path);
        } catch {
            console.log('no se pudo borrar la imagen de /uploads')
        }

        return cloudResult;

    } catch (error) {
        console.log('Error al subir la imagen a cloudinary')
        return null;
    }
}


categoryCtrl.getOneCategory = async (req, res) => {

    const { myToken } = req.cookies;
    const id_category = req.params.id;

    if (!myToken) {
        return res.status(401).json({ msj: 'There is not token.' });
    }

    try {
        const token = jwt.verify(myToken, process.env.SECRET); // se verifica si el token es correcto

        const result = await Category.find(
            {'categories.category_id': id_category}, 
            { userId: Object(token.userId), 'categories.$': 1 });

        console.log('result ', result[0].categories[0]);

        res.status(201).json({ oneCategory: result[0].categories[0] });

    } catch (e) {
        return res.status(401).json({ msj: 'Token error or query error.' });
    }
}


categoryCtrl.getCategories = async (req, res) => {

    const { myToken } = req.cookies;
    if (!myToken) {
        return res.status(401).json({ msj: 'There is not token.' });
    }

    try {
        const token = jwt.verify(myToken, process.env.SECRET); // se verifica si el token es correcto

        const result = await Category.find({ userId: token.userId });
        res.status(201).json({ userCategories: result[0].categories });

    } catch (e) {
        return res.status(401).json({ msj: 'There is not token.' });
    }
}

categoryCtrl.addCategory = async (req, res) => {

    const { categoryName } = await req.body;
    const categoryImage = await req.file;
    const { myToken } = req.cookies;

    if (!categoryName || !categoryImage) {
        res.json({ message: "category name and image are required.", saved: false });
        console.log('category name and image are required.');
        return;
    }

    if (!myToken) {
        return res.status(401).json({ msj: 'There is not token.' });
    }

    try {
        const token = jwt.verify(myToken, process.env.SECRET); // se verifica si el token es correcto

        // verifica si existe una tabla de categorias del usuario        
        let resCategory = await Category.findOne({ userId: token.userId });

        if (resCategory == null) { // se crea un nuevo registro si resCategory == null

            const cloudResult = await guardarImgEnCloudinary(categoryImage);

            // agrega la direccion de la imagen de categoria a mongoDB
            const newCategory = new Category(
                {
                    userId: token.userId,
                    categories: [{
                        categoryName: categoryName,
                        category_id: uuid(),
                        category_img_public_id: cloudResult.public_id,
                        imageUrl: cloudResult.secure_url
                    }]
                }
            );

            newCategory.save(function (err, data) {
                if (err) {
                    res.status(500).send({ saved: false, errorName: false, message: "Error al guardar en mongoDB" })
                } else {
                    res.status(201).json({ saved: true, errorName: false, messaje: "Category created." });
                }
            })

        } else {
            // comprueba si existe el nombre de la categoria que se quiere agregar 
            let existNameCat = resCategory.categories.find(data => data.categoryName == categoryName);

            if (existNameCat) {
                console.log("El nombre de la categoria ya existe");
                res.status(400).send({ saved: false, errorName: true, message: "El nombre de la categoria ya existe" })

            } else {
                const cloudResult = await guardarImgEnCloudinary(categoryImage);

                Category.findOneAndUpdate(
                    { userId: token.userId },
                    {
                        // agreaga una categoria al array categories[]
                        '$push': {
                            categories: {
                                categoryName: categoryName,
                                category_id: uuid(),
                                category_img_public_id: cloudResult.public_id,
                                imageUrl: cloudResult.secure_url
                            }
                        }
                    }
                ).exec(function (err, data) {
                    if (err) {
                        res.status(500).send({ saved: false, errorName: false, message: "Error al guardar en mongoDB." })
                    } else {
                        console.log("Category created.");
                        res.status(201).send({ saved: true, errorName: false, message: "Category created." })
                    }
                });
            }
        }
    } catch (err) {
        res.status(401).json({ saved: false, message: "Error, could not save the user, invalid token." });
        console.log('Error. Could not save the user, invalid token.');
    }
};

categoryCtrl.setActiveCategory = async (req, res) => {

    const { myToken } = req.cookies;
    if (!myToken) {
        return res.status(401).json({ msj: 'There is not token.' });
    }

    try {
        const token = jwt.verify(myToken, process.env.SECRET); // se verifica si el token es correcto

        // se desactiva el unico usuario activo
        const resDisactive = await Category.updateOne(
            { userId: Object(token.userId), 'categories.isActive': true },
            { $set: { 'categories.$.isActive': false } });

        // actualiza la categoria indicada a isActive == true 
        if (resDisactive.modifiedCount == 1) {
            const resActive = await Category.updateOne(
                { userId: Object(token.userId), 'categories.category_id': req.params.id },
                { $set: { 'categories.$.isActive': true } });
            if (resActive.modifiedCount == 1) {
                return res.status(200).json({ message: "Category updated.", updated: true });
            }
        }
        return res.status(401).json({ message: "Could not update user.", updated: false });
    } catch (e) {
        return res.status(401).json({ message: "Could not update user.", updated: false });
    }
}

export default categoryCtrl;