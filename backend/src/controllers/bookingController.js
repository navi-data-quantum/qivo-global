const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const bookingModel = require("../models/booking/bookingModel");
const { createNotification } = require("./notificationController");

const createBooking = asyncHandler(async (req, res) => {
  const { serviceId, bookingDate } = req.body;

  if (!serviceId || !bookingDate) {
    throw new AppError("Service ID and booking date are required", 400);
  }

  const userId = req.user.id;

  const booking = await bookingModel.createBooking(userId, serviceId, bookingDate);

  await createNotification(
    userId,
    "Booking Created",
    "Your booking has been successfully created",
    "booking"
  );

  res.status(201).json({ success: true, data: booking });
});

const getMyBookings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const bookings = await bookingModel.getUserBookings(userId);

  res.json({ success: true, data: bookings });
});

module.exports = {
  createBooking,
  getMyBookings,
};