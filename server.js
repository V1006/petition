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
    //getUsers,
    createUserProfile,
    getAllUserData,
    getUserInfoById,
    updateUser,
    upsertUserProfile,
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
        request.session.one_time_visit = true;
        response.redirect("/petition/profile");
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

// sign the petition
app.post("/petition/signPetition", async (request, response) => {
    try {
        await createSignatures(request.body, request.session.user_id);
        response.redirect("/petition/signed");
    } catch (error) {
        console.log(error);
        const currentUser = await getCurrentUser(request.session.user_id);
        response.render("signPetition", {
            currentUser,
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
    const currentSignature = await getSignatureByID(request.session.user_id);

    if (!currentSignature) {
        const currentUser = await getCurrentUser(request.session.user_id);
        response.render("signPetition", { currentUser });
    } else {
        response.redirect("/petition/signers");
    }
});

app.get("/petition/signed", async (request, response) => {
    if (!request.session.user_id) {
        response.redirect("/petition/register");
        return;
    }
    const signers = await getSignatures();
    const currentSignature = await getSignatureByID(request.session.user_id);
    const currentUser = await getCurrentUser(request.session.user_id);
    response.render("signed", { signers, currentSignature, currentUser });
});

// list of signers all and by city
app.get("/petition/signers", async (request, response) => {
    if (!request.session.user_id) {
        response.redirect("/petition/register");
        return;
    }
    const allUserData = await getAllUserData();
    const currentUser = await getCurrentUser(request.session.user_id);
    response.render("signers", { allUserData, currentUser });
});

app.get("/petition/signers/:city", async (request, response) => {
    const { city } = request.params;
    if (!request.session.user_id) {
        response.redirect("/petition/register");
        return;
    }

    const UserDataByCity = await getAllUserData();
    const currentUser = await getCurrentUser(request.session.user_id);
    response.render("signersCity", {
        UserDataByCity: UserDataByCity.filter((user) => user.city === city),
        currentUser,
        city,
    });
});

// profile endpoints

app.get("/petition/profile", async (request, response) => {
    if (!request.session.user_id) {
        response.redirect("/petition/register");
        return;
    }
    if (request.session.one_time_visit) {
        const currentUser = await getCurrentUser(request.session.user_id);
        response.render("profile", { currentUser });
        return;
    }
    response.redirect("/petition/signPetition");
});

app.post("/petition/profile", async (request, response) => {
    try {
        await createUserProfile(request.body, request.session.user_id);
        request.session.one_time_visit = false;
        response.redirect("/petition/signPetition");
    } catch (error) {
        console.log(error);
        response.render("petition/profile", {
            title: "create new user",
            error: true,
        });
    }
});

// edit entpoints

app.get("/petition/profile/edit", async (request, response) => {
    if (!request.session.user_id) {
        response.redirect("/petition/register");
        return;
    }
    const userInfoByID = await getUserInfoById(request.session.user_id);
    const currentUser = await getCurrentUser(request.session.user_id);
    response.render("edit", { userInfoByID, currentUser });
});
app.post("/petition/profile/edit", async (request, response) => {
    try {
        await updateUser({ ...request.body, id: request.session.user_id });
        await upsertUserProfile({
            ...request.body,
            user_id: request.session.user_id,
        });
        response.redirect("/petition/signers");
    } catch (error) {
        console.log(error);
        const currentUser = await getCurrentUser(request.session.user_id);
        const userInfoByID = await getUserInfoById(request.session.user_id);
        response.render("edit", { currentUser, userInfoByID, error: true });
    }
});

// logout endpoint
app.get("/petition/logout", (request, response) => {
    request.session = null;
    response.redirect("/petition");
});

app.listen(8080, () => console.log("listening on http://localhost:8080"));
