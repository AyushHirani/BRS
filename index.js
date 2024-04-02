import 'dotenv/config';
import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import mongoose from 'mongoose';
import session from 'express-session';
import bcrypt from 'bcrypt';
import { User } from './models/userModel.js';
import { Bug } from './models/bugModel.js';

const app = express();
const uri = process.env.URI;

mongoose.connect(uri)
    .then(() => console.log("Database Connected!"))
    .catch((error) => console.log(error));

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(session({
    secret: process.env.KEY, 
    resave: false,
    saveUninitialized: true
}));

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

app.get("/bugs", async (req, res) => {
    const bugs = await Bug.find();
    res.render("bugs", {bugs});
})

app.get("/new-bug", (req, res) => {
    res.render("bug-form");
})

app.get("/edit/:id", async (req, res) => {
    try {
        const bug = await Bug.findById(req.params.id);

        if (!bug) {
            return res.status(404).send("Bug not found");
        }

        res.render("edit-bug", { bug });
    } catch (error) {
        console.error("Error fetching bug:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/login", async (req,res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ userName: username });
        if (!user) {
            return res.redirect("/login");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            req.session.userId = user._id;
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

app.post("/bugs", async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);
        const bugs = await Bug.find();

        if (!user) {
            return res.status(404).send("User not found");
        }

        const newBug = new Bug({
            title: req.body.btitle,
            description: req.body.binfo,
            priority: req.body.priority,
            type: req.body.bugType,
            date: req.body.date,
            notify: req.body.notify
        });

        if (req.body.notify === 'yes') {
            newBug.users.push(user.email);
        }

        await newBug.save();

        res.render("bugs", {bugs});
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/update/:id", async (req, res) => {
    try {
        const userId = req.session.userId;
        const user = await User.findById(userId);
        const bugId = req.params.id;
        const updatedFields = {
            title: req.body.btitle,
            description: req.body.binfo,
            priority: req.body.priority,
            type: req.body.bugType,
            date: req.body.date,
            notify: req.body.notify
        };

        if (!user) {
            return res.status(404).send("User not found");
        }

        await Bug.findByIdAndUpdate(bugId, updatedFields);

        const bug = await Bug.findById(bugId);
        if (req.body.notify === 'yes' && !bug.users.includes(user.email)) {
            bug.users.push(user.email);
            await bug.save();
        }

        if (req.body.notify === 'no' && bug.users.includes(user.email)) {
            bug.users = bug.users.filter(email => email !== user.email);
            await bug.save();
        }

        res.redirect("/bugs");
    } catch (error) {
        console.error("Error updating bug:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});