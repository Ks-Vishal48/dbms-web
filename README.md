# DBMS Lab Portal

A full-stack SQL lab and evaluation portal built with React, Spring Boot, MySQL, and Firebase Authentication.

## Run locally

1. Create a MySQL database named `dbms_lab_portal`.
2. Update `server/src/main/resources/application.properties` with your MySQL password.
3. Start the API: `cd server; mvn spring-boot:run`
4. Start the UI: `cd client; npm install; npm run dev`

The seeded administrator account is `admin@nitt.edu` and the demo student is `student@nitt.edu`.

## Firebase

Copy `client/.env.example` to `client/.env` and add Firebase web configuration to enable Google sign-in. The app still supports demo access when Firebase is not configured.
