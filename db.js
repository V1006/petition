/// setup ///
const spicedPg = require("spiced-pg");

const { DATABASE_USERNAME, DATABASE_PASSWORD } = require("./secrets.json");
const DATABASE_NAME = "crud";
const DATABASE_URL = `postgres:${DATABASE_USERNAME}:${DATABASE_PASSWORD}@localhost:5432/${DATABASE_NAME}`;

const db = spicedPg(DATABASE_URL);

/// setup ///

function createUser(first_name, last_name, signature) {
    return db.query(
        `
    INSERT INTO signatures (first_name, last_name, signature)
    VALUES ($1, $2, $3)
    `,
        [first_name, last_name, signature]
    );
}

module.exports = { createUser };
