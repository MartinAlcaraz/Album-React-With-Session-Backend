import { Schema, model } from "mongoose";

const userSchema= new Schema({
    userName: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    imageUrl: {
        type: String
    },
    public_id: String,
    active: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true    // guarda la fecha de cracion y actualizacion del objeto.
});

const User = model('User', userSchema);

export default User;