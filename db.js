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

// getting all users and  the current user

async function getUsers() {
    const users = await db.query(`SELECT * FROM users`);
    return users.rows;
}

async function getCurrentUser(id) {
    const result = await db.query(
        `
        SELECT * FROM users WHERE id = $1
    `,
        [id]
    );
    return result.rows[0];
}

// providing additional information after register

async function createUserProfile({ age, city, url }, id) {
    const result = await db.query(
        `
    INSERT INTO users_profile (age, city, url, user_id) VALUES ($1, $2, $3, $4) RETURNING *
    `,
        [Number(age), city.toLowerCase(), url, id]
    );
    return result.rows[0];
}

// sign the petition

async function getSignatures() {
    const result = await db.query(`SELECT * FROM signatures`);
    return result.rows;
}

async function getSignatureByID(id) {
    const result = await db.query(
        `SELECT * FROM signatures WHERE user_id = $1`,
        [id]
    );
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

// getting all the data for the signers page and data by city

async function getAllUserData() {
    const result = await db.query(`
     SELECT first_name, last_name, age, city, url FROM users
     FULL JOIN users_profile 
     ON users.id = users_profile.user_id
     JOIN signatures 
     ON users.id = signatures.user_id
    `);
    return result.rows;
}

// data for edit page

async function getUserInfoById(id) {
    const result = await db.query(
        `
    SELECT
    users.first_name,
    users.last_name,
    users_profile.age,
    users_profile.city,
    users_profile.url
FROM users FULL JOIN users_profile
ON users.id = users_profile.user_id
WHERE users.id = $1
    `,
        [id]
    );
    return result.rows[0];
}

async function updateUser({ first_name, last_name, id }) {
    const result = await db.query(
        `
    UPDATE users SET first_name = $1, last_name = $2
    WHERE id = $3
    `,
        [first_name, last_name, id]
    );
    return result.rows[0];
}

async function upsertUserProfile({ age, city, url, user_id }) {
    const result = await db.query(
        `
        INSERT INTO users_profile (age, city, url,user_id)
        VALUES ($1,$2,$3,$4) ON CONFLICT (user_id)
        DO UPDATE SET
            age = $1,
            city = $2,
            url = $3
    `,
        [age, city, url, user_id]
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
    getUsers,
    createUserProfile,
    getAllUserData,
    getUserInfoById,
    updateUser,
    upsertUserProfile,
};
