////// general setup //////
const express = require("express");
const path = require("path");
const { engine } = require("express-handlebars");
const {
    createSignatures,
    getSignatures,
    getSignatureByID,
    createUser,
    login,
    getCurrentUser,
} = require("./db");
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

//
// endpoints

// register endpoints
app.get("/petition/register", (request, response) => {
    if (request.session.user_id) {
        response.redirect("/petition/signPetition");
        return;
    }
    response.render("register");
});

app.post("/petition/register", async (request, response) => {
    try {
        const userRegistration = await createUser(request.body);
        request.session.user_id = userRegistration.id;
        response.redirect("/petition/signPetition");
    } catch (error) {
        console.log(error);
        response.render("register", {
            title: "create new user",
            error: true,
        });
    }
});

// login endpoints

app.get("/petition/login", (request, response) => {
    if (request.session.user_id) {
        response.redirect("/petition/signPetition");
        return;
    }
    response.render("login");
});

app.post("/petition/login", async (request, response) => {
    try {
        const foundUser = await login(request.body);
        request.session.user_id = foundUser.id;
        response.redirect("/petition/signPetition");
    } catch (error) {
        console.log(error);
        response.render("login", {
            title: "login",
            error: true,
        });
    }
});

// landing page endpoint

app.get("/petition", (request, response) => {
    if (request.session.user_id) {
        response.redirect("/petition/signPetition");
        return;
    }
    response.render("petition");
});

// NEEDS TO BE FIXED AFTER REGISTER CHANGES
app.post("/petition/signPetition", async (request, response) => {
    try {
        await createSignatures(request.body, request.session.user_id);
        response.redirect("/petition/signed");
    } catch (error) {
        console.log(error);
        response.render("petition", {
            title: "create new user",
            error: true,
        });
    }
});

app.get("/petition/signPetition", async (request, response) => {
    if (!request.session.user_id) {
        response.redirect("/petition/register");
        return;
    }
    const currentUser = await getCurrentUser(request.session.user_id);
    response.render("signPetition", { currentUser });
});

app.get("/petition/signed", async (request, response) => {
    if (request.session.user_id) {
        response.redirect("/petition/register");
        return;
    }
    const signaturesID = request.session.signature_id;
    const signers = await getSignatures();
    const currentSigner = await getSignatureByID(signaturesID);
    response.render("signed", { signers, currentSigner });
});

app.get("/petition/signers", async (request, response) => {
    if (request.session.user_id) {
        response.redirect("/petition/register");
        return;
    }
    const signers = await getSignatures();
    response.render("signers", { signers });
});

// logout endpoint
app.get("/petition/logout", (request, response) => {
    request.session = null;
    response.redirect("/petition");
});

app.listen(8080, () => console.log("listening on http://localhost:8080"));
