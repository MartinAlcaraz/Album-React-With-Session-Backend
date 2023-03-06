import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import url from 'url';
import multer from "multer";
import https from 'https';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import routerPictures from './routes/pictures.js';
import routerUsers from './routes/users.js';
import routerRegister from './routes/register.js';
import routerLogin from './routes/login.js'
import routerCategory from './routes/category.js'


if (process.env.NODE_ENV == 'development') {
    dotenv.config();    // carga el contenido del archivo .env dentro de process.env
}

const app = express();
const PORT = process.env.PORT || "3000";

if (process.env.NODE_ENV == 'development') {
    // crea el servidor con protocolo https
    https.createServer({
        key: fs.readFileSync('c:/localhost-key.pem'),
        cert: fs.readFileSync('c:/localhost.pem')
    }, app).listen(PORT, () => {
        console.log('Servidor en puerto ', PORT);
    });
} else {
    // settings
    app.set('port', PORT)
}

//////////  middleware
app.use(cookieParser());

// para limitar la subida de imagenes pesadas
app.use(bodyParser.json({ limit: "3mb" }));
app.use(bodyParser.urlencoded({ limit: "3mb" }));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());    // para que entienda los objetos json

//app.use(cors()); 

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});


// static files
const __filename = url.fileURLToPath(import.meta.url);  // retorna la direccion del archivo actual \app.js
const dir = path.dirname(__filename);
const __dirname = dir.slice(0, dir.search('\src')) // retorna la direccion de la carpeta .\backend

// hace accesible los archivos de la carpeta ./public que contendrán la pagina del frontend
app.use(express.static(path.join(__dirname, "public")));


// configuracion de almacenamiento con multer
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/uploads'), // __dirname con 2 guiones bajos
    filename(req, file, cb) {
        // new Date().getTime para usar los milisegundos como nombre del archivo de imagen
        // path.extname(file.originalname) para obtener la extension del archivo de imagen 
        cb(null, new Date().getTime() + path.extname(file.originalname));
    }
});

app.use(multer({ storage }).single('image')); 
// single() para indicar uploads de a una sola imagen
// 'image' es el input tipo file del html ó la propiedad image del formData o el name del input


//routes
app.use('/api/pictures', routerPictures);
app.use('/api/category', routerCategory);
app.use('/api/register', routerRegister);
app.use('/api/users', routerUsers);
app.use('/api/login', routerLogin);


export default app;