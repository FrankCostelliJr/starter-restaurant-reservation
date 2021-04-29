const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const reservation = require("../reservations/reservations.service");

//Validation middleware:
const validateId = async (req, res, next) => {
  const { table_id } = req.params;
  const data = await service.read(table_id);
  if (!data.length)
    return next({ status: 404, message: `Table ID: ${table_id} Not Found` });
  res.locals.table = data;
  next();
};

const validateFields = (req, _res, next) => {
  const newTable = req.body.data;

  if (!newTable) {
    return next({
      status: 400,
      message: 'Invalid table parameters!'
    })
  }

  if (!newTable.capacity) {
    return next({
      status: 400,
      message: 'Invalid table capacity!'
    })
  }

  if (!newTable.table_name) {
    return next({
      status: 400,
      message: 'Invalid table_name!'
    })
  }

  if (newTable.capacity < 1)
    return next({
      status: 400,
      message: `Table must be able to accommodate at least 1 person!`,
    });

  if (newTable.table_name.length < 2)
    return next({
      status: 400,
      message: 'table_name must be at least 2 characters!',
    });
  next();
};

const validateUpdate = async (req, res, next) => {
  if (!req.body.data || !req.body.data.reservation_id)
    return next({
      status: 400,
      message: `No data or no reservation_id sent.`,
    });

  const reservation_id = await reservation.read(req.body.data.reservation_id);
  
  if (!reservation_id.length)
    return next({
      status: 404,
      message: `${req.body.data.reservation_id} not found`,
    });
  if (reservation_id[0].status === "seated")
    return next({
      status: 400,
      message: `${req.body.data.reservation_id} already seated`,
    });
  res.locals.reservation = reservation_id[0];
  next();
};

const validateTable = async (req, res, next) => {
  const { table_id } = req.params;
  const table = await service.read(Number(table_id));
  const reservation = res.locals.reservation;

  if (table[0].occupied) {
    return next({
      status: 400,
      message: 'Table is already occupied!'
    })
  }

  if (reservation.people > table[0].capacity) {
    return next({
      status: 400,
      message: 'Table is over capacity!'
    })
  }
  next();
};

const validateClear = async (req, _res, next) => {
  const { table_id } = req.params;
  const table = await service.read(Number(table_id));
  if (!table.length)
    return next({
      status: 404,
      message: `${table_id} not found`,
    });
  if (!table[0].reservation_id)
    return next({
      status: 400,
      message: `table ${table_id} is not occupied`,
    });
  next();
};

//Route functions
const list = async (req, res, _next) => {
  const tables = await service.list();
  res.json({ data: tables });
};

const read = async (_req, res) => {
  res.json({
    data: res.locals.table,
  });
};

const create = async (req, res, _next) => {
  const newTable = req.body.data;
  const table = await service.create(newTable);
  res.status(201).json({ data: table[0] });
};

const update = async (req, res, next) => {
  const table_id = req.params.table_id;
  const reservation_id = req.body.data.reservation_id;
  let updated;
  try {
    updated = await service.update(table_id, reservation_id);
    await reservation.updateStatus(reservation_id, "seated");
  } catch (err) {
    next(err);
  }
  res.status(200).json({ data: updated });
};

const clearTable = async (req, res, _next) => {
  const { table_id } = req.params;
  const reservationCheck = await service.read(table_id);
  const updated = await service.clearTable(table_id);
  await reservation.updateStatus(
    reservationCheck[0].reservation_id,
    "finished"
  );
  res.status(200).json({ data: updated });
};

module.exports = {
  list: [asyncErrorBoundary(list)],
  read: [asyncErrorBoundary(validateId), asyncErrorBoundary(read)],
  create: [asyncErrorBoundary(validateFields), asyncErrorBoundary(create)],
  update: [asyncErrorBoundary(validateUpdate), asyncErrorBoundary(validateTable), asyncErrorBoundary(update)],
  delete: [asyncErrorBoundary(validateClear), asyncErrorBoundary(clearTable)],
};