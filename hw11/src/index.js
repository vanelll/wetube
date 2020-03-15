import express from "express";
import path from "path";
import bodyParser from "body-parser";
import multer from "multer";
import fs from "fs";
import router from "./router";

const app = express();

const upload = multer({ dest: "uploads/" });

 
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/",router);


export const uploadText = upload.single("");

const PORT = 4000;
const handleListening= () => console.log(`Listening on: http://localhost:${PORT}`);

app.listen(PORT, handleListening);