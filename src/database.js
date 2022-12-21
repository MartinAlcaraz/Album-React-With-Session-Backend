import mongoose from "mongoose";

const URI = process.env.MONGODB_URI || "mongodb://localhost/Album01";
// const URI = "mongodb://localhost/Album01";

mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .catch(err => {
        console.log("Ocurrio un error de conexion a la base de datos... \n", err);
    });

const db = mongoose.connection;

db.once("open", _ => {
    console.log("Database is connected to: ", URI);
});

// to test the error stop mongod
db.on("error", err => {
    console.log('Ocurrio un error al conectarse a la base de datos... \n', err);
});

