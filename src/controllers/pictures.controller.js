import UserPictures from '../models/UserPictures.js';
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

picturesCtrl.getPictures = async (req, res) => {  // busca todas las imagenes de un usuario

    const userId = await req.params.id;
    try {
        UserPictures.findOne({ userId: userId })
            .exec(function (err, result) {
                if (err) {
                    res.json({ message: "Error in findOne()." })
                } else {

                    if (result == null) {
                        res.json({ images: [] }) // devuelve un array vacio porque el usuario no existe en esta collection.(porque todavia no se agrego ninguna imagen)
                    } else {
                        res.json({ images: result.imagesData }) // devuelve un array con las imagenes
                    }
                }
            })
    } catch (error) {
        res.json({ messaje: error })
    }
}


picturesCtrl.postPicture = async (req, res) => {
    const { userId } = req.body;
    const image = await req.file;
    let imageName = image.filename.slice(0, image.filename.lastIndexOf('.'));

    if (userId && image) {
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
        }catch{
            console.log('no se pudo borrar la imagen de /uploads')
        }
        

        // agrega la direccion de la imagen a mongoDB
        let result = await UserPictures.findOne({ userId: userId });

        if (result == null) { // se crea un nuevo registro 

            const newUserPicture = new UserPictures(
                { userId: userId, imagesData: [{ public_id: cloudResult.public_id, imgUrl: cloudResult.secure_url }] }
            );
            newUserPicture.save(function (err, data) {
                if (err) {
                    res.status(500).send({ updated: false, message: "Error al guardar la imagen" })
                } else {
                    //console.log(data)
                    res.json({ updated: true });
                }
            })

        } else {
            // se actualiza el registro existente con la url de la imagen nueva
            UserPictures.findOneAndUpdate(
                { userId: userId },
                {
                    '$push': {
                        imagesData: {
                            public_id: cloudResult.public_id,
                            imgUrl: cloudResult.secure_url
                        }
                    }
                }    // agreaga una url al array imgUrl []
            ).exec(function (err, data) {
                if (err) {
                    res.status(500).send({ message: "", updated: false })
                } else {
                    res.json({ updated: true })
                }
            });
        }
    } else {
        res.json({ message: "UserId and image are required" });
    }
}

picturesCtrl.deleteOnePicture = async (req, res) => {

    const userId = await req.params.id;

    const public_id = await req.body.img_id;

    const result = await UserPictures.findOne({ userId: userId });

    // si existe el registro del usuario se busca la imagen que se quiere eliminar
    if (result) {
        // se buscar el objeto en el arreglo imagesData que contiene la propiedad public_id 
        // para obtener el id del elemento que se desea borrar

        let dataImg = result.imagesData.find((data) => data.public_id == public_id);

        cloudinary.uploader.destroy(public_id);

        UserPictures.findOneAndUpdate(
            { userId: userId },
            {
                $pull: {
                    imagesData: { _id: dataImg._id }    // se elimina el elemento del array de datos de imagenes
                }
            }).exec(function (err, data) {
                if (err) {
                    res.status(500).send({ message: "Error deleting in mongoDB", ok: false })
                } else {
                    res.json({ ok: true })
                }
            });
    } else {
        res.json({ ok: false });
    }
}


picturesCtrl.deleteAllPictures = async (req, res) => {

    const userId = await req.params.id;

    const result = await UserPictures.findOne({ userId: userId });
    // si existe el registro del usuario se buscan las imagenes que se quieren eliminar

    if (result) {
        const userImages = await UserPictures.findOne({ userId: userId });

        userImages.imagesData.forEach(async (data) => {  // se eliminan todas las imgs de cloudinary
            await cloudinary.uploader.destroy(data.public_id);
        });

        await UserPictures.findOneAndDelete({ userId: userId }); // se elimina el usuario de la colleccion de imagenes
        res.json({ ok: true });

    } else {
        res.json({ ok: false });
    }
}


export default picturesCtrl;