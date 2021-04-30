# Thinkful-Final-Capstone: Restaurant Reservation System

## Live Site

https://starter-restaurant-reservation-k7pg7wnwd-frankcostellijr.vercel.app/dashboard

## Restaurant Reservation System

### Application Summary

A Restaurant Reservation System that is used to keep track of guest reservations and table assignments.
The user can create new reservations and search for standing reservations by mobile phone number.
Keep track of where reservations are seated and occupied tables.

### Screenshots

Image of Dashboard Image of New Reservation

![Alt text](/screenshots/res1.png?raw=true)
![Alt text](/screenshots/res2.png?raw=true)

### Tech Stack

This web app was developed using JavaScript, React, Express, Node, PostgreSQL, KnexJS, HTML, CSS, and BootStrap.

### API Documentation

| Route                                                               | Method | Status Code | Description                                                         |
| ------------------------------------------------------------------- | ------ | ----------- | ------------------------------------------------------------------- |
| /reservations                                                       | GET    | 200         | Returns a list of reservations for the current date                 |
| /reservations?date=####-##-##                                       | GET    | 200         | Returns a list of reservations for the given date                   |
| /reservations                                                       | POST   | 201         | Creates a new reservation                                           |
| /reservations/:reservation_id                                       | GET    | 200         | Returns the reservation for the given ID                            |
| /reservations/:reservation_id                                       | PUT    | 200         | Updates the status of the reservation for the given ID              |
| Changes the occupied status to be unoccupied for the given table_id | PUT    | 200         | Updates the status of the reservation for the given ID              |
| /tables                                                             | GET    | 200         | Returns a list of tables                                            |
| /tables                                                             | POST   | 201         | Creates a new table                                                 |
| /tables/:table_id                                                   | PUT    | 200         | Seats a reservation at the given table_id                           |
| /tables/:table_id/seat                                              | PUT    | 200         | Seats a reservation at the given table_id                           |
| /tables/:table_id/seat                                              | DELETE | 200         | Changes the occupied status to be unoccupied for the given table_id |

### Reservation JSON Example

{
"reservation_id": 1,
"first_name": "Rick",
"last_name": "Sanchez",
"mobile_number": "202-555-0164",
"reservation_date": "2020-12-31",
"reservation_time": "20:00:00",
"people": 6,
"status": "booked",
"created_at": "2020-12-10T08:30:32.326Z",
"updated_at": "2020-12-10T08:30:32.326Z"
}

### Table JSON Example

{
"table_id": 1,
"table_name": "#1",
"capacity": 6,
"occupied": false,
"reservation_id": null
}

### Installation

To install dependencies, use npm install.

### npm install

To start the server and web page, use npm start.

### npm start

Connect to a postgresql database by creating .env files for the back-end and front-end

### back-end .env example -> Connects to database

DATABASE_URL=enter-your-production-database-url-here
DATABASE_URL_DEVELOPMENT=enter-your-development-database-url-here
DATABASE_URL_TEST=enter-your-test-database-url-here
DATABASE_URL_PREVIEW=enter-your-preview-database-url-here
LOG_LEVEL=info

### front-end .env example -> Connects to server

REACT_APP_API_BASE_URL=http://localhost:5000
