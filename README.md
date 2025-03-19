# Aizen Take-Home Assignment

## Overview
This project is a web application for securely uploading and managing images, built for the Aizen Software Engineer position. Due to billing constraints with AWS S3 and Firebase Cloud Storage, local file storage is used as a workaround.

## Features
- User authentication (register/login)
- Image upload and retrieval
- Basic AI description (mocked)

## Tech Stack
- **Backend**: Flask, PostgreSQL
- **Frontend**: Vite, React, TypeScript
- **Storage**: Local file system

## Setup
1. **Backend**:
   - Install dependencies: `pip install -r backend/requirements.txt`
   - Set up PostgreSQL and create database `aizen_db`
   - Configure `.env` with `DATABASE_URL` and `JWT_SECRET_KEY`
   - Run: `python backend/app.py`
2. **Frontend**:
   - Navigate to `frontend/`
   - Install dependencies: `npm install`
   - Run: `npm run dev`
3. **Test**:
   - Register a user, log in, and upload images at `http://localhost:5173`

## Notes
Local storage was chosen due to billing requirements for cloud providers. I am prepared to adapt to AWS S3 or Firebase if required.

## Deliverables
- GitHub Repository: (https://github.com/Prasanth-malla/aizen)
