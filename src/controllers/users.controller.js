import User from "../models/User.js";
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// async function uploadPreset() {
//     try {
//         let res = await cloudinary.api.update_upload_preset(
//             {
//                 name: "user_profile_photo",
//                 folder: "Album-Fotos",
//                 transformation: {
//                     width: 300,
//                     height: 300
//                 }
//             });
//         //console.log("Response upload preset: ", res);
//     } catch (error) {
//         console.log("Error on upload preset in Cloudinary")
//     }
// }
// uploadPreset();

const usersCtrl = {};

usersCtrl.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        if (users) {
            res.json({ users })
        }
    } catch (err) {
        res.json({ message: "Could not get users." })
    }
};

usersCtrl.getOneUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            res.json({ user })
        }
    } catch (err) {
        res.json({ message: "Could not get users." })
    }
};

usersCtrl.postUser = async (req, res) => {

    try {
        const { userName } = await req.body;
        const image = await req.file;

        if (userName && image) {
            //subir la imagen a cloudinary
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

            const newUser = new User({
                userName,
                imageUrl: cloudResult.secure_url,
                public_id: cloudResult.public_id
            })
            const saved = await newUser.save();

            if (saved) {
                res.json({ message: "User Saved.", saved: true })
            } else {
                res.json({ message: "User Not Saved.", saved: false })
            }
        } else {
            res.json({ message: "userName and image are required.", saved: false })
        }
    } catch (err) {
        res.json({ message: "Error, could not save the user.", saved: false })
        console.log('Error. Could not save')
    }
}

usersCtrl.deleteUser = async (req, res) => {
    try {
        const result = await User.findByIdAndDelete(req.params.id);
        cloudinary.uploader.destroy(result.public_id); // pulblic_id es el id de la img de cloudinary

        if (result) {
            res.json({ message: "User deleted", ok: true })
        } else {
            res.json({ message: "Could not delete user because does'nt exist", ok: false })
        }
    } catch (err) {
        res.json({ message: "Error. Could not delete user", ok: false })
    }
}

usersCtrl.setActiveUser = async (req, res) => {
    try {
        // se desactiva el unico usuario activo
        await User.findOneAndUpdate({ active: true }, { active: false });

        // se activa un usuario con el id especificado

        const updated = await User.findByIdAndUpdate(req.params.id, { active: true });
        if (updated) {
            res.json({ message: "User updated" })
        }
    } catch (err) {
        res.json({ message: "Could not update user." })
    }
}

export default usersCtrl;

