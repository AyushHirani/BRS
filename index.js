import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

const port = 3000;

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