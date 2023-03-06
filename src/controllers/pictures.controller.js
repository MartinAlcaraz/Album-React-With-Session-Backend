import Pictures from '../models/Pictures.js';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const picturesCtrl = {};

picturesCtrl.getPictures = async (req, res) => {  // busca todas las imagenes de una categoria

    const category_id = await req.params.id;
    try {
        Pictures.findOne({ category_id: category_id })
            .exec(function (err, result) {

                if (err) {
                    res.json({ message: "Error in findOne()." })
                } else {

                    if (result == null) {
                        res.status(200).json({ images: [] }) // devuelve un array vacio porque el usuario no existe en esta collection.(porque todavia no se agrego ninguna imagen)
                    } else {
                        res.status(200).json({ images: result.imagesData }) // devuelve un array con las imagenes
                    }
                }
            })
    } catch (error) {
        res.json({ messaje: error })
    }
}


picturesCtrl.postPicture = async (req, res) => {

    try {
        const { category_id } = req.body;

        const image = await req.file;

        let imageName = image.filename.slice(0, image.filename.lastIndexOf('.'));

        if (category_id && image) {
            //subir la imagen a cloudinary
            let cloudResult = await cloudinary.uploader.upload(
                image.path,     // direccion de la imagen subida y guardada en /public/uploads por multer
                {
                    public_id: imageName,
                    upload_preset: "pictures_preset"
                }
            );

            // se borra la imagen guardada en public/uploads/ --> (req.file)
            try {
                fs.unlinkSync(image.path);
            } catch {
                console.log('no se pudo borrar la imagen de /uploads')
            }


            // agrega la direccion de la imagen a mongoDB
            let result = await Pictures.findOne({ category_id: category_id });

            if (result == null) { // se crea un nuevo registro 

                const newPicture = new Pictures(
                    { category_id: category_id, imagesData: [{ img_public_id: cloudResult.public_id, imgUrl: cloudResult.secure_url }] }
                );
                newPicture.save(function (err, data) {
                    if (err) {
                        res.status(500).send({ updated: false, message: "Error al guardar la imagen" })
                    } else {
                        res.status(200).json({ updated: true });
                    }
                })

            } else {
                // se actualiza el registro existente con la url de la imagen nueva
                Pictures.findOneAndUpdate(
                    { category_id: category_id },
                    {
                        '$push': {
                            imagesData: {
                                img_public_id: cloudResult.public_id,
                                imgUrl: cloudResult.secure_url
                            }
                        }
                    }    // agreaga una url al array imgUrl []
                ).exec(function (err, data) {
                    if (err) {
                        res.status(500).send({ message: "", updated: false })
                    } else {
                        res.status(200).json({ updated: true })
                    }
                });
            }
        } else {
            res.status(500).json({ message: "UserId and image are required" });
        }
    } catch (e) {
        return res.status(401).json({ message: 'Error in postPicture.' });
    }

}


picturesCtrl.deleteOnePicture = async (req, res) => {

    try {
        const category_id = await req.params.id;

        const { img_public_id } = await req.body;

        const result = await Pictures.findOne({ category_id: category_id });

        // si existe el registro de la categoria se busca la imagen que se quiere eliminar
        if (result) {
            // se buscar el objeto en el arreglo imagesData que contiene la propiedad img_public_id 
            // para obtener el id del elemento que se desea borrar

            let dataImg = result.imagesData.find((data) => data.img_public_id == img_public_id);
            cloudinary.uploader.destroy(img_public_id);

            Pictures.findOneAndUpdate(
                { category_id: category_id },
                {
                    $pull: {
                        imagesData: { _id: dataImg._id }    // se elimina el elemento del array de datos de imagenes
                    }
                }).exec(function (err, data) {
                    if (err) {
                        res.status(500).send({ message: "Error deleting in mongoDB", deleted: false })
                    } else {
                        res.json({ deleted: true })
                    }
                });
        } else {
            res.json({ deleted: false });
        }
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'Ocurrio un error en deleteOnePicture' })
    }
}


// picturesCtrl.deleteAllPictures = async (req, res) => {

//     const category_id = await req.params.id;

//     const result = await Pictures.findOne({ category_id: category_id });
//     // si existe el registro se buscan las imagenes que se quieren eliminar

//     if (result) {
//         const userImages = await Pictures.findOne({ userId: userId });

//         userImages.imagesData.forEach(async (data) => {  // se eliminan todas las imgs de cloudinary
//             await cloudinary.uploader.destroy(data.public_id);
//         });

//         await Pictures.findOneAndDelete({ userId: userId }); // se elimina el usuario de la colleccion de imagenes
//         res.json({ ok: true });

//     } else {
//         res.json({ ok: false });
//     }
// }


export default picturesCtrl;