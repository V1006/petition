const requireLoggedInUser = (request, response, next) => {
    if (
        !request.session.user_id &&
        request.url != "/petition/register" &&
        request.url != "/petition/login" &&
        request.url != "/petition"
    ) {
        response.redirect("/petition/register");
        return;
    }
    next();
};

const requireLoggedOutUser = (req, res, next) => {
    if (req.session.user_id) {
        res.redirect("/petition/signPetition");
        return;
    }
    next();
};

module.exports = {
    requireLoggedOutUser,
    requireLoggedInUser,
};
