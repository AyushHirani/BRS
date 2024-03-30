import 'dotenv/config';
import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
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

async function insert(name, pass, id, email) {
    try {
        const hashedPassword = await bcrypt.hash(pass, 10);
        await User.create({
            userName: name,
            password: hashedPassword,
            employeeID: id,
            email: email
        });
    } catch (error) {
        console.error("Error inserting user:", error);
    }
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

app.get("/new-bug", (req, res) => {
    res.render("bug-form");
})

app.post("/login", async (req,res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ userName: username });
        if (!user) {
            return res.redirect("/login");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            return res.redirect("/bugs");
        } else {
            return res.redirect("/login");
        }
    } catch(error) {
        console.error("Error logging in:", error);
        res.redirect("/login");
    }
});

app.post("/register", (req,res) => {
    const { username, password, enumber, email } = req.body;
    insert(username, password, enumber, email);
    res.redirect("/");
})

app.post("/change-password", async (req, res) => {
        const { username, currentPassword, newPassword, confirmPassword } = req.body;
    
        if (newPassword !== confirmPassword) {
            res.render("changepass", { error: "Passwords do not match" });
        }
    
        try {
            const user = await User.findOne({ userName: username });
            if (!user) {
                res.redirect("/change-password");
            }
    
            const passwordMatch = await bcrypt.compare(currentPassword, user.password);
            if (passwordMatch) {
                const hashedNewPass = await bcrypt.hash(newPassword, 10);    
                await User.updateOne({ _id: user._id }, { password: hashedNewPass });
                res.redirect("/login");
            } else {
                res.render("changepass", { error: "Current password is incorrect" });
            }
        } catch(error) {
            console.error("Error changing password:", error);
            res.redirect("/change-password");
        }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
})