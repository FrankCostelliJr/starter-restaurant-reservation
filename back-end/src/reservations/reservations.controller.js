const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

const list = async (req, res, _next) => {
  const { date, mobile_number } = req.query;
  if (mobile_number) {
    const data = await service.listByMobileNumber(mobile_number);
    return res.json({
      data: data,
    });
  }
  const data = await service.list(date);
  res.json({ data });
};

const read = async (_req, res, _next) => {
  const reservation = res.locals.reservation;
  res.status(200).json({ data: reservation[0] });
};

const validateId = async (req, res, next) => {
  const id = req.params.reservation_Id;
  const reservation = await service.read(id);
  if (!reservation.length)
    return next({ status: 404, message: `${id} not found` });
  res.locals.reservation = reservation;
  next();
};

const validateFields = (req, res, next) => {
  if (!req.body.data) return next({ status: 400, message: "No date selected" });
  const { reservation_date, reservation_time, people, status } = req.body.data;
  const requiredFields = [
    "first_name",
    "last_name",
    "mobile_number",
    "reservation_date",
    "reservation_time",
    "people",
  ];
  for (const field of requiredFields) {
    if (!req.body.data[field]) {
      return next({ status: 400, message: `Invalid input for ${field}` });
    }
  }

  if (!reservation_date.match(/\d{4}-\d{2}-\d{2}/g)) {
    return next({
      status:400,
      message: 'Invalid input: reservation_date'
    })
  }

  if (!reservation_time.match(/[0-9]{2}:[0-9]{2}/g)) {
    return next({
      status:400,
      message: 'Invalid input: reservation_time'
    })
  }

  if (typeof people !== 'number') {
    return next({
      status:400,
      message: 'Invalid input: people'
    })
  }
  
  if (status === "seated")
    return next({ status: 400, message: "Status is already seated!" });

  if (status === "finished")
    return next({ status: 400, message: "Status is already finished!" });

  res.locals.validReservation = req.body.data;
  next();
};

const create = async (_req, res, _next) => {
  const reservation = res.locals.validReservation;
  const response = await service.create(reservation);
  res.status(201).json({ data: response[0] });
};

const validateWorkDay = (req, _res, next) => {
  let newDate = new Date(
    `${req.body.data.reservation_date} ${req.body.data.reservation_time}`
  );
  const currentDay = new Date();

  if (newDate.getDay() === 2) {
    return next({
      status: 400,
      message: 'Restaurant is closed on Tuesdays!'
    })
  }

  if (newDate.valueOf() < currentDay.valueOf()) {
    return next({
      status: 400,
      message: 'Reservations must be for a future date!'
    })
  }
  next();
};

const validateWorkHours = (req, _res, next) => {
  let time = Number(req.body.data.reservation_time.replace(":", ""));
  if (time < 1030 || time > 2130)
    return next({
      status: 400,
      message: `Reservations are only valid from 10:30 AM to 9:30 PM.`,
    });
  next();
};

const validateStatusUpdate = async (req, res, next) => {
  const currentStatus = res.locals.reservation[0].status;
  const { status } = req.body.data;

  if (currentStatus === "finished")
    return next({
      status: 400,
      message: "finished reservations cannot be updated!",
    });

  if (status === "cancelled") return next();

  if (status !== "booked" && status !== "seated" && status !== "finished")
    return next({ status: 400, message: "unknown status cannot be updated!" });

  next();
};

const updateStatus = async (req, res, _next) => {
  const { reservation_Id } = req.params;
  const status = req.body.data.status;
  const data = await service.updateStatus(reservation_Id, status);

  res.status(200).json({
    data: { status: data[0] },
  });
};

const update = async (req, res, _next) => {
  const { reservation_Id } = req.params;
  const data = await service.update(reservation_Id, req.body.data);
  res.status(200).json({
    data: data[0],
  });
};

module.exports = {
  list: [asyncErrorBoundary(list)],
  read: [asyncErrorBoundary(validateId), asyncErrorBoundary(read)],
  create: [
    asyncErrorBoundary(validateFields),
    asyncErrorBoundary(validateWorkDay),
    asyncErrorBoundary(validateWorkHours),
    asyncErrorBoundary(create),
  ],
  updateStatus: [
    asyncErrorBoundary(validateId),
    asyncErrorBoundary(validateStatusUpdate),
    asyncErrorBoundary(updateStatus),
  ],
  update: [
    asyncErrorBoundary(validateId),
    asyncErrorBoundary(validateFields),
    asyncErrorBoundary(validateWorkDay),
    asyncErrorBoundary(validateWorkHours),
    asyncErrorBoundary(update),
  ],
};