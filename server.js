////// general setup //////
const express = require("express");
const path = require("path");
const { engine } = require("express-handlebars");
const { createUser, getSigners } = require("./db");
const { SESSION_SECRET } = require("./secrets.json");
const cookieSession = require("cookie-session");

const app = express();

// static files middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

// handlebars setup
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

////// general setup over //////

// additional middleware
app.use(
    cookieSession({
        secret: SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);
// endpoints

app.get("/petition", (request, response) => {
    if (request.session.signature_id) {
        response.redirect("/petition/signed");
        return;
    }
    response.render("petition");
});

app.post("/petition", async (request, response) => {
    try {
        const userForm = await createUser(request.body);
        request.session.signature_id = userForm.id;
        response.redirect("/petition/signed");
    } catch (error) {
        console.log(error);
        response.render("petition", {
            title: "create new user",
            error: true,
        });
    }
});

app.get("/petition/signed", async (request, response) => {
    const signaturesID = request.session.signature_id;
    const signers = await getSigners();
    response.render("signed", {
        signers,
        currentSigner: signers[signaturesID - 1],
    });
});

app.get("/petition/signers", async (request, response) => {
    const signers = await getSigners();
    response.render("signers", { signers });
});

app.listen(8080, () => console.log("listening on http://localhost:8080"));
