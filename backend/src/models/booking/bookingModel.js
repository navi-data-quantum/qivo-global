const pool = require("../../config/db");
const AppError = require("../../utils/AppError");

const createBooking = async (userId, serviceId, bookingDate) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const serviceCheck = await client.query(
      "SELECT id FROM services WHERE id = $1 AND is_active = true",
      [serviceId]
    );
    if (serviceCheck.rowCount === 0) throw new AppError("Service not found or inactive", 404);

    const duplicateCheck = await client.query(
      `SELECT id FROM bookings WHERE user_id = $1 AND service_id = $2 AND booking_date = $3`,
      [userId, serviceId, bookingDate]
    );
    if (duplicateCheck.rowCount > 0) throw new AppError("You already booked this service for this date", 400);

    const { rows } = await client.query(
      `INSERT INTO bookings (user_id, service_id, booking_date)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, serviceId, bookingDate]
    );

    await client.query("COMMIT");
    return rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const getUserBookings = async (userId) => {
  const { rows } = await pool.query(
    `SELECT b.*, s.title AS service_title, s.price
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     WHERE b.user_id = $1
     ORDER BY b.booking_date DESC`,
    [userId]
  );

  return rows;
};

module.exports = { createBooking, getUserBookings };