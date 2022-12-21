import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import routerPictures from './routes/pictures.js'
import routerUsers from './routes/users.js'
import path from 'path';
import url from 'url';
import multer from "multer";


if(process.env.NODE_ENV !== 'production'){
    dotenv.config();    // carga el contenido del archivo .env dentro de process.env
}

const app = express();
// settings
app.set('port', process.env.PORT || "3000")

//middleware
app.use(cors());

        // para limitar la subida de imagenes pesadas
app.use(bodyParser.json({limit: "3mb"}));
app.use(bodyParser.urlencoded({limit: "3mb"}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// static files
const __filename = url.fileURLToPath(import.meta.url);  // retorna la direccion del archivo actual \app.js
const dir = path.dirname(__filename); 
const __dirname = dir.slice(0 , dir.search('\src')) // retorna la direccion de la carpeta .\backend

// hace accesible los archivos de la carpeta ./public que contendrán la pagina del frontend
app.use(express.static(path.join(__dirname, "public"))); 


// configuracion de almacenamiento con multer
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/uploads'), // __dirname con 2 guiones bajos
    filename(req, file, cb){
        // new Date().getTime para usar los milisegundos como nombre del archivo de imagen
        // path.extname(file.originalname) para obtener la extension del archivo de imagen 
        cb(null, new Date().getTime() + path.extname(file.originalname) );
    }
});

app.use(multer({storage}).single('image')); // single() para indicar uploads de a una sola imagen
                                            // image es el input tipo file del html || La propiedad image del formData o el name del input


//routes
app.use('/api/pictures', routerPictures);

app.use('/api/users', routerUsers);


export default app;


