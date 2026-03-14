const pool = require("../../config/db");
const AppError = require("../../utils/AppError");

const createService = async (title, description, price, provider_id) => {
  const { rows } = await pool.query(
    `INSERT INTO services (title, description, price, provider_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description, price, provider_id]
  );
  return rows[0];
};

const getAllServices = async ({ country, city, category, featured, search, limit = 20, offset = 0 } = {}) => {
  let query = "SELECT * FROM services WHERE is_active = true";
  const conditions = [];
  const values = [];

  if (country) {
    values.push(country);
    conditions.push(`country_id = $${values.length}`);
  }
  if (city) {
    values.push(city);
    conditions.push(`city_id = $${values.length}`);
  }
  if (category) {
    values.push(category);
    conditions.push(`category_id = $${values.length}`);
  }
  if (featured !== undefined) {
    values.push(featured === true || featured === "true");
    conditions.push(`featured = $${values.length}`);
  }
  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(title ILIKE $${values.length} OR description ILIKE $${values.length})`);
  }

  if (conditions.length > 0) {
    query += " AND " + conditions.join(" AND ");
  }

  query += ` ORDER BY id DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  values.push(limit, offset);

  const { rows } = await pool.query(query, values);
  return rows;
};

const getServiceById = async (id) => {
  const { rows } = await pool.query(
    `SELECT * FROM services
     WHERE id = $1 AND is_active = true`,
    [id]
  );
  return rows[0];
};

const updateService = async (id, title, description, price, userId) => {
  const { rows: ownershipRows } = await pool.query(
    "SELECT provider_id FROM services WHERE id = $1",
    [id]
  );
  if (!ownershipRows[0] || ownershipRows[0].provider_id !== userId)
    throw new AppError("Not authorized to update this service", 403);

  const { rows } = await pool.query(
    `UPDATE services
     SET title = $1, description = $2, price = $3
     WHERE id = $4
     RETURNING *`,
    [title, description, price, id]
  );
  return rows[0];
};

const deleteService = async (id, userId) => {
  const { rows: ownershipRows } = await pool.query(
    "SELECT provider_id FROM services WHERE id = $1",
    [id]
  );
  if (!ownershipRows[0] || ownershipRows[0].provider_id !== userId)
    throw new AppError("Not authorized to delete this service", 403);

  await pool.query(
    "UPDATE services SET is_active = false WHERE id = $1",
    [id]
  );
};

module.exports = { createService, getAllServices, getServiceById, updateService, deleteService };

