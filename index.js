import 'dotenv/config';
import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import mongoose from 'mongoose';
import { User } from './models/userModel.js';
const app = express();
const uri = process.env.URI;

mongoose.connect(uri)
        .then(() => console.log("Database Connected!"))
        .catch((error) => console.log(error));

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

const port = 3000;

var name = "";
var pass = "";
var id = "";
var email = "";

async function insert(name, pass, id, email){
        await User.create({
                userName: name,
                password: pass,
                employeeID: id,
                email: email
        });
}

app.get("/", (req,res) => {
        res.render("home");
})

app.get("/login", (req,res) => {
        res.render("login");
})

app.get("/change-password", (req,res) => {
        res.render("changepass");
})

app.get("/register", (req,res) => {
        res.render("register");
})

app.get("/bugs", (req,res) => {
        res.render("bugs");
})

app.post("/login", (req,res) => {
        res.redirect("/bugs");
})

app.post("/register", (req,res) => {
        name = req.body["username"];
        pass = req.body["password"];
        id = req.body["enumber"];
        email = req.body["email"];
        insert(name, pass, id, email);
        res.redirect("/");
})

app.post("/change-password", (req, res) => {
        const { currentPassword, newPassword, confirmPassword } = req.body;
    
        if (newPassword !== confirmPassword) {
            res.render("changepass", { error: "The passwords do not match" });
        } else {
            res.redirect("/login");
        }
    });

app.listen(port, () => {
        console.log("Server running on port 3000.");
})