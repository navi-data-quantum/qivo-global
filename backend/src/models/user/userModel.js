const pool = require("../../config/db");

const createUser = async (
  name,
  email,
  password = null,
  emailToken = null,
  emailTokenExpires = null,
  language = "en",
  provider = "local",
  provider_uid = null,
  country = null,
  timezone = null,
  currency = null,
  profile_image = null
) => {
  const { rows } = await pool.query(
    `INSERT INTO users
     (name,email,password,
      email_verification_token,
      email_verification_expires,
      language,provider,provider_uid,
      country,timezone,currency,profile_image)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING id,name,email,role,language,created_at,token_version`,
    [
      name,
      email.toLowerCase(),
      password,
      emailToken,
      emailTokenExpires,
      language,
      provider,
      provider_uid,
      country,
      timezone,
      currency,
      profile_image,
    ]
  );
  return rows[0];
};

const findUserByEmail = async (email) => {
  const { rows } = await pool.query(
    `SELECT * FROM users WHERE LOWER(email)=LOWER($1) LIMIT 1`,
    [email]
  );
  return rows[0];
};

const findUserById = async (id) => {
  const { rows } = await pool.query(
    `SELECT * FROM users WHERE id=$1 LIMIT 1`,
    [id]
  );
  return rows[0];
};

const findUserByProviderUid = async (provider, provider_uid) => {
  const { rows } = await pool.query(
    `SELECT * FROM users 
     WHERE provider=$1 AND provider_uid=$2 
     LIMIT 1`,
    [provider, provider_uid]
  );
  return rows[0];
};

const saveRefreshToken = (userId, tokenHash) =>
  pool.query(
    `UPDATE users SET refresh_token=$1 WHERE id=$2`,
    [tokenHash, userId]
  );

const findRefreshTokenByUserId = async (userId) => {
  const { rows } = await pool.query(
    `SELECT refresh_token FROM users WHERE id=$1`,
    [userId]
  );
  return rows[0]?.refresh_token;
};

const deleteRefreshToken = (userId) =>
  pool.query(
    `UPDATE users SET refresh_token=NULL WHERE id=$1`,
    [userId]
  );

const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

const incrementLoginAttempts = async (userId) => {
  const lockUntil = new Date(Date.now() + LOCK_TIME_MS);

  const { rows } = await pool.query(
    `UPDATE users
     SET failed_login_attempts = failed_login_attempts + 1,
         lock_until = CASE 
           WHEN failed_login_attempts + 1 >= $2 
           THEN $3
           ELSE lock_until
         END
     WHERE id=$1
     RETURNING failed_login_attempts`,
    [userId, MAX_ATTEMPTS, lockUntil]
  );

  return rows[0]?.failed_login_attempts;
};

const resetLoginAttempts = (userId) =>
  pool.query(
    `UPDATE users
     SET failed_login_attempts=0,
         lock_until=NULL
     WHERE id=$1`,
    [userId]
  );

const incrementTokenVersion = (userId) =>
  pool.query(
    `UPDATE users 
     SET token_version=token_version+1 
     WHERE id=$1`,
    [userId]
  );

const verifyUserEmail = async (hashedToken) => {
  const { rows } = await pool.query(
    `UPDATE users
     SET is_verified=true,
         email_verification_token=NULL,
         email_verification_expires=NULL
     WHERE email_verification_token=$1
       AND email_verification_expires > NOW()
     RETURNING id`,
    [hashedToken]
  );
  return rows[0];
};

const savePasswordResetToken = (userId, token, expires) =>
  pool.query(
    `UPDATE users
     SET password_reset_token=$1,
         password_reset_expires=$2
     WHERE id=$3`,
    [token, expires, userId]
  );

const findUserByResetToken = async (token) => {
  const { rows } = await pool.query(
    `SELECT * FROM users
     WHERE password_reset_token=$1
       AND password_reset_expires > NOW()
     LIMIT 1`,
    [token]
  );
  return rows[0];
};

const updateUserPassword = (userId, newPassword) =>
  pool.query(
    `UPDATE users
     SET password=$1,
         token_version=token_version+1,
         refresh_token=NULL
     WHERE id=$2`,
    [newPassword, userId]
  );

const clearPasswordResetToken = (userId) =>
  pool.query(
    `UPDATE users
     SET password_reset_token=NULL,
         password_reset_expires=NULL
     WHERE id=$1`,
    [userId]
  );

const updateUserLanguage = (userId, language) =>
  pool.query(
    `UPDATE users SET language=$1 WHERE id=$2`,
    [language, userId]
  );

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByProviderUid,
  saveRefreshToken,
  findRefreshTokenByUserId,
  deleteRefreshToken,
  incrementLoginAttempts,
  resetLoginAttempts,
  incrementTokenVersion,
  verifyUserEmail,
  savePasswordResetToken,
  findUserByResetToken,
  updateUserPassword,
  clearPasswordResetToken,
  updateUserLanguage,
};