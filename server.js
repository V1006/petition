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
// const { SESSION_SECRET } = require("./secrets.json");
const cookieSession = require("cookie-session");
const {
    requireLoggedOutUser,
    requireLoggedInUser,
} = require("./middleware.js");

const app = express();

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("./secrets");
}

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
        secret: secrets.SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

//
// endpoints

// register endpoints
app.get("/petition/register", requireLoggedOutUser, (request, response) => {
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

app.get("/petition/login", requireLoggedOutUser, (request, response) => {
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

app.get("/petition", requireLoggedOutUser, (request, response) => {
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

app.get(
    "/petition/signPetition",
    requireLoggedInUser,
    async (request, response) => {
        const currentSignature = await getSignatureByID(
            request.session.user_id
        );

        if (!currentSignature) {
            const currentUser = await getCurrentUser(request.session.user_id);
            response.render("signPetition", { currentUser });
        } else {
            response.redirect("/petition/signers");
        }
    }
);

app.get("/petition/signed", requireLoggedInUser, async (request, response) => {
    const currentSignature = await getSignatureByID(request.session.user_id);
    const signers = await getSignatures();
    const currentUser = await getCurrentUser(request.session.user_id);
    if (!currentSignature) {
        response.redirect("signPetition");
        return;
    }
    response.render("signed", { signers, currentSignature, currentUser });
});

// list of signers all and by city
app.get("/petition/signers", requireLoggedInUser, async (request, response) => {
    const allUserData = await getAllUserData();
    const currentUser = await getCurrentUser(request.session.user_id);
    const currentSignature = await getSignatureByID(request.session.user_id);
    if (!currentSignature) {
        response.render("signers", {
            allUserData,
            currentUser,
            notSigned: true,
        });
        return;
    }
    response.render("signers", { allUserData, currentUser });
});

app.get(
    "/petition/signers/:city",
    requireLoggedInUser,
    async (request, response) => {
        const { city } = request.params;
        const UserDataByCity = await getAllUserData();
        const currentUser = await getCurrentUser(request.session.user_id);
        const currentSignature = await getSignatureByID(
            request.session.user_id
        );
        if (!currentSignature) {
            response.render("signersCity", {
                UserDataByCity: UserDataByCity.filter(
                    (user) => user.city === city
                ),
                currentUser,
                city,
                notSigned: true,
            });
            return;
        }
        response.render("signersCity", {
            UserDataByCity: UserDataByCity.filter((user) => user.city === city),
            currentUser,
            city,
        });
    }
);

// profile endpoints

app.get("/petition/profile", requireLoggedInUser, async (request, response) => {
    if (request.session.one_time_visit) {
        const currentUser = await getCurrentUser(request.session.user_id);
        response.render("profile", { currentUser });
        return;
    }
    response.redirect("/petition/signPetition");
});

app.post(
    "/petition/profile",
    requireLoggedInUser,
    async (request, response) => {
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
    }
);

// edit endpoints

app.get(
    "/petition/profile/edit",
    requireLoggedInUser,
    async (request, response) => {
        const userInfoByID = await getUserInfoById(request.session.user_id);
        const currentUser = await getCurrentUser(request.session.user_id);
        response.render("edit", { userInfoByID, currentUser });
    }
);
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
    response.redirect("/petition/login");
});
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`listening on http://localhost:${port}`));
