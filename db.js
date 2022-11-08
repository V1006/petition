/// setup ///
const spicedPg = require("spiced-pg");

const { DATABASE_USERNAME, DATABASE_PASSWORD } = require("./secrets.json");
const DATABASE_NAME = "petition";
const DATABASE_URL = `postgres:${DATABASE_USERNAME}:${DATABASE_PASSWORD}@localhost:5432/${DATABASE_NAME}`;

const db = spicedPg(DATABASE_URL);

/// setup ///

async function getSigners() {
    const result = await db.query("SELECT * FROM signatures");
    return result.rows;
}

function createUser({ first_name, last_name, signature }) {
    return db.query(
        `
    INSERT INTO signatures (first_name, last_name, signature)
    VALUES ($1, $2, $4)
    `,
        [first_name, last_name, signature]
    );
}

module.exports = { createUser, getSigners };
