/// setup ///
const spicedPg = require("spiced-pg");
const { hash, genSalt, compare } = require("bcryptjs");

const { DATABASE_USERNAME, DATABASE_PASSWORD } = require("./secrets.json");
const DATABASE_NAME = "petition";
const DATABASE_URL = `postgres:${DATABASE_USERNAME}:${DATABASE_PASSWORD}@localhost:5432/${DATABASE_NAME}`;

const db = spicedPg(DATABASE_URL);

/// setup ///

// hashing password

async function hashPassword(password) {
    const salt = await genSalt();
    return hash(password, salt);
}

// creating account
async function createUser({ first_name, last_name, email, password }) {
    const password_hash = await hashPassword(password);
    const result = await db.query(
        `INSERT INTO users (first_name, last_name, email, password_hash)
        VALUES ($1, $2, $3, $4) RETURNING *
    `,
        [first_name, last_name, email, password_hash]
    );
    console.log(result.rows[0]);
    return result.rows[0];
}

// login into account

async function getUserByEmail(email) {
    const result = await db.query(
        `
    SELECT * FROM users WHERE email = $1
    `,
        [email]
    );
    return result.rows[0];
}
async function login({ email, password }) {
    const foundUser = await getUserByEmail(email);
    if (!foundUser) {
        return null;
    }
    const match = await compare(password, foundUser.password_hash);
    if (!match) {
        return null;
    }
    return foundUser;
}

// getting the current user

async function getCurrentUser(id) {
    const result = await db.query(
        `
        SELECT * FROM users WHERE id = $1
    `,
        [id]
    );
    return result.rows[0];
}

// sign the petition

async function getSignatures() {
    const result = await db.query(`SELECT * FROM signatures`);
    return result.rows;
}

async function getSignatureByID(id) {
    const result = await db.query(`SELECT * FROM signatures WHERE id = $1`, [
        id,
    ]);
    return result.rows[0];
}

async function createSignatures({ signature }, id) {
    if (signature == "") {
        throw new Error();
    }
    const result = await db.query(
        `
    INSERT INTO signatures (signature, user_id)
    VALUES ($1, $2) RETURNING *
    `,
        [signature, id]
    );
    return result.rows[0];
}

module.exports = {
    createSignatures,
    getSignatures,
    getSignatureByID,
    createUser,
    login,
    getCurrentUser,
};
