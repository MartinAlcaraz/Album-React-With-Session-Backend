import User from "../models/User.js";
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import bcrypt from 'bcrypt';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const registerCtrl = {};

registerCtrl.register = async (req, res) => {

    try {
        const { userName, password } = await req.body;
        const image = await req.file;
        
        if(!userName || !password){
            res.json({ message: "userName and password are required.", saved: false });
            console.log('userName and password are required');
            return;
        }

        const user = await User.findOne({ userName: userName });
        // si no existe un usuario con ese nombre se crea uno
        if (!user) {

            //-- subir la imagen a cloudinary  --//
            let cloudResult = await cloudinary.uploader.upload(
                image.path,     // direccion de la imagen subida y guardada en /public/uploads por multer
                {
                    public_id: image.filename,
                    upload_preset: "user_profile_photo"
                }
            );
            // se borra la imagen guardada en public/uploads/ --> (req.file)
            try {
                fs.unlinkSync(image.path);
            } catch {
                console.log('no se pudo borrar la imagen de /uploads')
            }

            //-- encriptar contraseña y guardar usuario en mongoDB --//
            bcrypt.hash(password, 8, async (err, hash) => {
                if (err) {
                    console.log(err);
                    res.json({ ok: 'error', msj: 'No se pudo crear el usuario, error en bcrypt.' })
                }
                if (hash) {
                    const newUser = new User({
                        userName: userName,
                        password: hash,
                        imageUrl: cloudResult.secure_url,
                        img_public_id: cloudResult.public_id
                    });

                    const saved = await newUser.save();

                    if (saved) {
                        res.status(201).json({ messaje: "User created.", saved: true })
                    } else {
                        res.status(500).json({ messaje: "User Not Saved. (500)=>Internal server error", saved: false })
                    }
                }
            });

        } else {
            res.status(409).json({ messaje: 'Ya existe un usuario con ese nombre. (409)=>The request could not be processed because of conflict in the request', saved: false });
        }
    } catch (e) {
        res.json({ message: "Error, could not save the user.", saved: false });
        console.log('Error. Could not save the user.');
    }
}

export default registerCtrl;




// usersCtrl.postUser = async (req, res) => {

    // try {
    //     const { userName } = await req.body;
    //     const image = await req.file;

    // if (userName && image) {
    // //subir la imagen a cloudinary
    // let cloudResult = await cloudinary.uploader.upload(
    //     image.path,     // direccion de la imagen subida y guardada en /public/uploads por multer
    //     {
    //         public_id: image.filename,
    //         upload_preset: "user_profile_photo"
    //     }
    // );

    // // se borra la imagen guardada en public/uploads/ --> (req.file)
    // try {
    //     fs.unlinkSync(image.path);
    // } catch {
    //     console.log('no se pudo borrar la imagen de /uploads')
    // }

    // const newUser = new User({
    //     userName,
    //     imageUrl: cloudResult.secure_url,
    //     public_id: cloudResult.public_id
    // })
    // const saved = await newUser.save();

    // if (saved) {
    //     res.json({ message: "User Saved.", saved: true })
    // } else {
    //     res.json({ message: "User Not Saved.", saved: false })
    // }
// } else {
//     res.json({ message: "userName and image are required.", saved: false })
// }
//     } catch (err) {
//     res.json({ message: "Error, could not save the user.", saved: false })
//     console.log('Error. Could not save')
// }
// }


