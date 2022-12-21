import { Schema, model } from "mongoose";

const userPicturesSchema = new Schema({
    userId: Object,
    //imgUrl: [{
    //    type: String
    //    data: Buffer  para guardar archivos como imagenes
    //}],
    imagesData: [
        {
            public_id: {
                type: String,
                requiered: true
            },
            imgUrl: {
                type: String,
                requiered: true
            }
        }
    ]
}, {
    timestamps: true    // guarda la fecha de cracion y actualizacion del objeto.
});

const UserPictures = model('UserPictures', userPicturesSchema);

export default UserPictures;