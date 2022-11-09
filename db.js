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

async function createUser({ first_name, last_name, signature }) {
    if (signature == "") {
        throw new Error();
    }
    const result = await db.query(
        `
    INSERT INTO signatures (first_name, last_name, signature)
    VALUES ($1, $2, $3) RETURNING *
    `,
        [first_name, last_name, signature]
    );
    return result.rows[0];
}

module.exports = { createUser, getSigners };
