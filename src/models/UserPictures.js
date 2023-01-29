import { Schema, model } from "mongoose";

const PicturesSchema = new Schema({
    category_id: Object,
    //imgUrl: [{
    //    type: String
    //    data: Buffer  para guardar archivos como imagenes
    //}],
    imagesData: [
        {
            img_public_id: {
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

const Pictures = model('Pictures', PicturesSchema);

export default Pictures;