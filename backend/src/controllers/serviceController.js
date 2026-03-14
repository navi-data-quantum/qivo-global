const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const sendResponse = require("../utils/sendResponse");
const pool = require("../config/db");
const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} = require("../models/service/serviceModel");

const addService = asyncHandler(async (req, res) => {
  const { title, description, price } = req.body;
  if (!title || !price) throw new AppError("Title and price are required", 400);
  const service = await createService(title, description, price, req.user.id);
  return sendResponse(res, 201, "Service created successfully", service);
});

const listServices = asyncHandler(async (req, res) => {
  const { country, city, category, featured } = req.query;
  const services = await getAllServices({ country, city, category, featured });
  return sendResponse(res, 200, "Services retrieved successfully", {
    count: services.length,
    services,
  });
});

const getService = asyncHandler(async (req, res) => {
  const service = await getServiceById(req.params.id);
  if (!service) throw new AppError("Service not found", 404);
  return sendResponse(res, 200, "Service retrieved successfully", service);
});

const editService = asyncHandler(async (req, res) => {
  const { title, description, price } = req.body;
  const service = await getServiceById(req.params.id);
  if (!service) throw new AppError("Service not found", 404);
  if (service.provider_id !== req.user.id && req.user.role !== "admin") {
    throw new AppError("Not allowed to update this service", 403);
  }
  const updated = await updateService(
    req.params.id,
    title || service.title,
    description || service.description,
    price || service.price,
    req.user.id
  );
  return sendResponse(res, 200, "Service updated successfully", updated);
});

const removeService = asyncHandler(async (req, res) => {
  const service = await getServiceById(req.params.id);
  if (!service) throw new AppError("Service not found", 404);
  if (service.provider_id !== req.user.id && req.user.role !== "admin") {
    throw new AppError("Not allowed to delete this service", 403);
  }
  await deleteService(req.params.id, req.user.id);
  return sendResponse(res, 200, "Service deleted successfully");
});

const assignAccessibility = asyncHandler(async (req, res) => {
  const { service_id, accessibility_ids } = req.body;
  if (!service_id || !Array.isArray(accessibility_ids)) {
    throw new AppError("Service ID and accessibility IDs are required", 400);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM service_accessibility WHERE service_id = $1`, [service_id]);
    const insertQuery = `INSERT INTO service_accessibility (service_id, accessibility_id) VALUES ($1, $2)`;
    for (const aid of accessibility_ids) {
      await client.query(insertQuery, [service_id, aid]);
    }
    await client.query("COMMIT");
    return sendResponse(res, 200, "Accessibility updated for service");
  } catch (error) {
    await client.query("ROLLBACK");
    throw new AppError("Could not assign accessibility", 500);
  } finally {
    client.release();
  }
});

const getAccessibleServices = asyncHandler(async (req, res) => {
  const { accessibility } = req.query;
  if (!accessibility) throw new AppError("Accessibility is required", 400);

  const result = await pool.query(
    `
    SELECT s.*
    FROM services s
    JOIN service_accessibility sa ON s.id = sa.service_id
    JOIN accessibility_types at ON sa.accessibility_id = at.id
    WHERE at.name = $1
    `,
    [accessibility]
  );

  return sendResponse(res, 200, "Accessible services retrieved successfully", {
    count: result.rows.length,
    services: result.rows,
  });
});

const getSmartServices = asyncHandler(async (req, res) => {
  const { needs } = req.query;
  if (!needs) throw new AppError("Needs are required", 400);

  const needsArray = needs.split(",");
  const result = await pool.query(
    `
    SELECT s.*, SUM(sas.score) AS match_score
    FROM services s
    JOIN service_accessibility_score sas ON s.id = sas.service_id
    JOIN accessibility_types at ON sas.accessibility_id = at.id
    WHERE at.name = ANY($1)
    GROUP BY s.id
    ORDER BY match_score DESC
    `,
    [needsArray]
  );

  return sendResponse(res, 200, "Smart services retrieved successfully", {
    count: result.rows.length,
    services: result.rows,
  });
});

module.exports = {
  addService,
  listServices,
  getService,
  editService,
  removeService,
  assignAccessibility,
  getAccessibleServices,
  getSmartServices,
};