import User from '../models/User.js';
import jwt from "jsonwebtoken";
import { serialize } from 'cookie';
import bcrypt from 'bcrypt';

const loginCtrl = {};

loginCtrl.logout = async (req, res) => {
    try {
        const { myToken } = req.cookies;
        console.log(req.cookies);
        if (!myToken) {
            return res.status(401).json({ msj: 'There is not token.' });
        }

        jwt.verify(myToken, process.env.SECRET) // se verifica si el token es correcto para cerrar la sesion

        const unDia = 86400000;
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

        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 1),  // expira en 1 minuto
            username: "martin",
            email: "martincho_cqc@hotmail.com"
        }, process.env.SECRET);

        const milisegundos = 1000 * 60;
        const fechaExp = new Date(Date.now() + milisegundos);

        const serializedToken = serialize('myToken', token, {
            httpOnly: false,     // para que no pueda ser leido desde la consola del navegador setear en true
            sameSite: 'none',                           // si el back y el front estan en el mismo dominio
            secure: true,
            expires: fechaExp,
            maxAge: 60,  // duracion de la cookie en segundos
            path: '/'
        });

        res.setHeader('Set-Cookie', serializedToken);
        res.status(200).json({ message: 'loged!!!', ok: true })

    } else {
        res.status(401).json({ message: "username or password invalid", ok: false });
    }
}


loginCtrl.getUsers = async (req, res) => {
    const { myToken } = req.cookies;
    console.log(req.cookies);

    if (!myToken) {
        res.status(401).json({ msj: 'There is not token.' })
        return;
    }

    try {
        const datos = jwt.verify(myToken, process.env.SECRET)

        res.status(200).json({ msj: 'Valid token', username: datos.username, email: datos.email });
    } catch (error) {
        // si ocurre un error es porque el token no es valido: 
        // 1-Porque es un token falso 
        // 2-Porque expiró
        res.status(401).json({ msj: 'Invalid token' })
    }

}

loginCtrl.getProfile = async (req, res) => {
    const { myToken } = req.cookies;
    console.log(req.cookies)

    if (!myToken) {
        res.status(401).json({ msj: 'There is not token.' })
        return;
    }
    try {
        const datos = jwt.verify(myToken, process.env.SECRET)

        res.status(200).json({ msj: 'Valid token', username: datos.username, email: datos.email });
    } catch (error) {
        res.status(401).json({ msj: 'Invalid token' })
    }

}

export default loginCtrl;