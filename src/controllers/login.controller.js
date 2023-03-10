import User from '../models/User.js';
import jwt from "jsonwebtoken";
import { serialize } from 'cookie';
import bcrypt from 'bcrypt';

const loginCtrl = {};

loginCtrl.logout = async (req, res) => {
    try {
        const { myToken } = req.cookies;

        if (!myToken) {
            return res.status(401).json({ msj: 'There is not token.' });
        }

        jwt.verify(myToken, process.env.SECRET) // se verifica si el token es correcto para cerrar la sesion

        const unDia = 86400000; // un dia en segundos
        const fechaExp = new Date(Date.now() - unDia);

        const serializedToken = serialize('myToken', null, {
            httpOnly: false,     // para que no pueda ser leido desde la consola del navegador setear en true
            sameSite: 'none',                           // si el back y el front estan en el mismo dominio
            secure: true,
            expires: fechaExp,  // ayer
            maxAge: 0,  // duracion de la cookie: 0 min
            path: '/'
        });
        res.setHeader('Set-Cookie', serializedToken);

        res.status(200).json({ msj: 'Logout!' });

    } catch (error) {
        res.status(401).json({ msj: 'Invalid token' })
    }

}


loginCtrl.login = async (req, res) => {

    const { username, password } = req.body;

    const result = await User.findOne({ userName: username });

    if (result && (await bcrypt.compare(password, result.password))) {
        ;
        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 15),  // expira en 15 minutos
            username: username,
            userId: result._id,
            email: "algun_mail@hotmail.com",
            imageUrl: result.imageUrl
        }, process.env.SECRET);

        const milisegundos = 1000 * 60 * 5; // 15 minutos
        const fechaExp = new Date(Date.now() + milisegundos);

        const serializedToken = serialize('myToken', token, {
            httpOnly: false,     // para que no pueda ser leido desde la consola del navegador setear en true
            sameSite: 'none',                           // si el back y el front estan en el mismo dominio
            secure: true,
            expires: fechaExp,
            maxAge: 60 * 15,  // duracion de la cookie en segundos // 15 minutos
            path: '/'
        });

        res.setHeader('Set-Cookie', serializedToken);
        res.status(200).json({ message: 'loged!!!', ok: true, username: result.userName, imageUrl: result.imageUrl })

    } else {
        res.status(401).json({ message: "username or password invalid", ok: false  });
    }
}



loginCtrl.isLogged = async (req, res) => {
    const { myToken } = req.cookies;

    if (!myToken) {
        return res.status(401).json({ msj: 'There is not token.' });        
    }
    try {
        const datos = jwt.verify(myToken, process.env.SECRET)

        res.status(200).json({ msj: 'Valid token', ok: true, username: datos.username, email: datos.email, imageUrl: datos.imageUrl });
    } catch (error) {
        // si ocurre un error es porque el token no es valido: 
        // 1-Porque es un token falso 
        // 2-Porque expiró
        res.status(401).json({ msj: 'Invalid token', ok: false })
    }
}

export default loginCtrl;