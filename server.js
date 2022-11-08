////// general setup //////
const express = require("express");
const path = require("path");
const { engine } = require("express-handlebars");
const { createUser, getSigners } = require("./db");

const app = express();

// static files middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

// handlebars setup
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

////// general setup over //////

// endpoints

app.get("/petition", (request, response) => {
    response.render("petition");
});

app.post("/petition", async (request, response) => {
    try {
        createUser(request.body);
        response.redirect("/petition/signed");
    } catch (error) {
        console.log(error);
        response.render("createUser", {
            title: "create new user",
            error: true,
        });
    }
});

app.get("/petition/signed", async (request, response) => {
    const signers = await getSigners();
    response.render("signed", { signers });
});

app.get("/petition/signers", async (request, response) => {
    const signers = await getSigners();
    response.render("signers", { signers });
});

app.listen(8080, () => console.log("listening on http://localhost:8080"));
