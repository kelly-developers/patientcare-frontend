# Spring Boot Backend API Documentation

## Overview
This document provides comprehensive documentation for the Cardiovascular Management System (CVMS) Spring Boot backend API. The system manages patients, surgical procedures, vital data, appointments, doctor analysis, and prescriptions with role-based access control.

## Base URL
```
http://localhost:8080/api
```

## Authentication
The API uses JWT (JSON Web Token) based authentication with access and refresh tokens.

### Token Format
```
Authorization: Bearer <token>
```

### Tokens
- **Access Token**: Short-lived token (15 minutes) for API authentication
- **Refresh Token**: Long-lived token (7 days) for obtaining new access tokens

---

## API Endpoints

### 1. Authentication Endpoints

#### POST /api/auth/signup
Register a new user account.

**Request Body:**
```json
{
  "username": "string (required, unique, 3-50 chars)",
  "email": "string (required, unique, valid email)",
  "password": "string (required, min 8 chars)",
  "firstName": "string (required)",
  "lastName": "string (required)",
  "phone": "string (optional)",
  "role": "DOCTOR | NURSE | ADMIN | PATIENT (optional, default: PATIENT)"
}
```

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string",
    "phone": "string"
  }
}
```

**Errors:**
- 400: Username already exists
- 400: Email already exists
- 400: Validation errors

---

#### POST /api/auth/login
Authenticate user and receive tokens.

**Request Body:**
```json
{
  "username": "string (required, username or email)",
  "password": "string (required)"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string",
    "phone": "string"
  }
}
```

**Errors:**
- 401: Invalid credentials

---

#### POST /api/auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "string (required)"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- 401: Invalid or expired refresh token

---

#### POST /api/auth/logout
Invalidate current tokens (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (204 No Content)**

---

#### GET /api/auth/verify
Verify if current token is valid (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "valid": true
}
```

**Errors:**
- 401: Invalid or expired token

---

### 2. Patient Endpoints

#### GET /api/patients
Retrieve all patients (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20)
- `sort` (optional): Sort field (default: createdAt,desc)

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "patient_id": "string (unique patient identifier)",
    "first_name": "string",
    "last_name": "string",
    "date_of_birth": "YYYY-MM-DD",
    "gender": "MALE | FEMALE | OTHER",
    "phone": "string",
    "email": "string",
    "address": "string",
    "emergency_contact_name": "string",
    "emergency_contact_phone": "string",
    "medical_history": "text",
    "allergies": "text",
    "current_medications": "text",
    "created_at": "ISO 8601 datetime",
    "updated_at": "ISO 8601 datetime"
  }
]
```

**Role Access:**
- ADMIN: Full access
- DOCTOR: Full access
- NURSE: Full access
- PATIENT: Only their own records

---

#### GET /api/patients/{id}
Retrieve a specific patient by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "patient_id": "string",
  "first_name": "string",
  "last_name": "string",
  "date_of_birth": "YYYY-MM-DD",
  "gender": "MALE | FEMALE | OTHER",
  "phone": "string",
  "email": "string",
  "address": "string",
  "emergency_contact_name": "string",
  "emergency_contact_phone": "string",
  "medical_history": "text",
  "allergies": "text",
  "current_medications": "text",
  "research_consent": "boolean",
  "research_consent_date": "ISO 8601 datetime",
  "created_at": "ISO 8601 datetime",
  "updated_at": "ISO 8601 datetime"
}
```

**Errors:**
- 404: Patient not found
- 403: Forbidden (patient can only view their own record)

---

#### POST /api/patients
Create a new patient (requires ADMIN, DOCTOR, or NURSE role).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "patient_id": "string (required, unique)",
  "first_name": "string (required)",
  "last_name": "string (required)",
  "date_of_birth": "YYYY-MM-DD (required)",
  "gender": "MALE | FEMALE | OTHER",
  "phone": "string",
  "email": "string (valid email)",
  "address": "string",
  "emergency_contact_name": "string",
  "emergency_contact_phone": "string",
  "medical_history": "text",
  "allergies": "text",
  "current_medications": "text",
  "research_consent": "boolean (optional, default: false)",
  "research_consent_date": "ISO 8601 datetime (auto-generated if consent is true)"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "patient_id": "string",
  // ... all patient fields
}
```

**Errors:**
- 400: Validation errors
- 409: Patient ID already exists
- 403: Forbidden (requires ADMIN, DOCTOR, or NURSE role)

---

#### PUT /api/patients/{id}
Update an existing patient (requires ADMIN, DOCTOR, or NURSE role).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "first_name": "string",
  "last_name": "string",
  "date_of_birth": "YYYY-MM-DD",
  "gender": "MALE | FEMALE | OTHER",
  "phone": "string",
  "email": "string",
  "address": "string",
  "emergency_contact_name": "string",
  "emergency_contact_phone": "string",
  "medical_history": "text",
  "allergies": "text",
  "current_medications": "text"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  // ... updated patient fields
}
```

**Errors:**
- 404: Patient not found
- 400: Validation errors
- 403: Forbidden

---

#### DELETE /api/patients/{id}
Delete a patient (requires ADMIN role only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (204 No Content)**

**Errors:**
- 404: Patient not found
- 403: Forbidden (requires ADMIN role)

---

#### GET /api/patients/search
Search patients by name, patient ID, or email.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `q` (required): Search query string

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    // ... patient fields
  }
]
```

---

#### PATCH /api/patients/{id}/consent
Update patient's research data consent (requires ADMIN, DOCTOR, or NURSE role).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "research_consent": "boolean (required)",
  "research_consent_date": "ISO 8601 datetime (auto-generated if not provided)"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "patient_id": "string",
  // ... all patient fields including updated consent
  "research_consent": "boolean",
  "research_consent_date": "ISO 8601 datetime"
}
```

**Errors:**
- 404: Patient not found
- 403: Forbidden (requires ADMIN, DOCTOR, or NURSE role)

---

#### POST /api/patients/export/excel
Export patient data to Excel format (REDCap-style export). Only exports data for patients who have consented to research data use.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "patientIds": ["uuid1", "uuid2"] // Optional - if empty, exports all consented patients
}
```

**Response (200 OK):**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Returns Excel (.xlsx) file with comprehensive patient data

**Export Contents:**
- Patient demographics and contact information
- Medical history and current conditions
- Allergies and current medications
- Emergency contact information
- Research consent status and date

**Errors:**
- 403: Forbidden (requires ADMIN, DOCTOR, or NURSE role)
- 400: Invalid request (e.g., no consented patients found)

**Security Note:**
Only patients with `research_consent = true` will be included in exports. All data is anonymized according to HIPAA regulations.

---

#### POST /api/patients/export/pdf
Export patient data to PDF format. Only exports data for patients who have consented to research data use.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "patientIds": ["uuid1", "uuid2"] // Optional - if empty, exports all consented patients
}
```

**Response (200 OK):**
- Content-Type: `application/pdf`
- Returns PDF report with patient summary data

**Export Contents:**
- Patient demographics summary table
- Research consent status
- Basic medical information

**Errors:**
- 403: Forbidden (requires ADMIN, DOCTOR, or NURSE role)
- 400: Invalid request (e.g., no consented patients found)

**Security Note:**
Only patients with `research_consent = true` will be included in exports. All data is anonymized according to HIPAA regulations.

---

### 3. Surgical Procedure Endpoints

#### GET /api/procedures
Retrieve all surgical procedures.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number
- `size` (optional): Page size
- `status` (optional): Filter by status (SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED)

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "patient_id": "uuid",
    "procedure_name": "string",
    "procedure_type": "string",
    "scheduled_date": "YYYY-MM-DD HH:mm:ss",
    "actual_date": "YYYY-MM-DD HH:mm:ss",
    "duration_minutes": "integer",
    "surgeon_name": "string",
    "assistant_surgeon": "string",
    "anesthesia_type": "string",
    "pre_operative_notes": "text",
    "operative_notes": "text",
    "post_operative_notes": "text",
    "complications": "text",
    "status": "SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED",
    "created_at": "ISO 8601 datetime",
    "updated_at": "ISO 8601 datetime",
    "patient": {
      "first_name": "string",
      "last_name": "string",
      "patient_id": "string"
    }
  }
]
```

**Role Access:**
- ADMIN: Full access
- DOCTOR: Full access
- NURSE: Read-only
- PATIENT: Only their own procedures

---

#### GET /api/procedures/{id}
Retrieve a specific procedure.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):** Same structure as single procedure above

**Errors:**
- 404: Procedure not found
- 403: Forbidden

---

#### GET /api/procedures/patient/{patientId}
Retrieve all procedures for a specific patient.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):** Array of procedures

---

#### POST /api/procedures
Create a new procedure (requires ADMIN or DOCTOR role).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "patient_id": "uuid (required)",
  "procedure_name": "string (required)",
  "procedure_type": "string",
  "scheduled_date": "YYYY-MM-DD HH:mm:ss",
  "actual_date": "YYYY-MM-DD HH:mm:ss",
  "duration_minutes": "integer",
  "surgeon_name": "string",
  "assistant_surgeon": "string",
  "anesthesia_type": "string",
  "pre_operative_notes": "text",
  "operative_notes": "text",
  "post_operative_notes": "text",
  "complications": "text",
  "status": "SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED (required)"
}
```

**Response (201 Created):** Created procedure object

**Errors:**
- 400: Validation errors
- 404: Patient not found
- 403: Forbidden

---

#### PUT /api/procedures/{id}
Update a procedure (requires ADMIN or DOCTOR role).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** Same as POST (all fields optional)

**Response (200 OK):** Updated procedure object

---

#### DELETE /api/procedures/{id}
Delete a procedure (requires ADMIN role).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (204 No Content)**

---

### 4. Vital Data Endpoints

#### GET /api/vital-data
Retrieve all vital data records.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "patient_id": "uuid",
    "blood_pressure_systolic": "integer (mmHg)",
    "blood_pressure_diastolic": "integer (mmHg)",
    "heart_rate": "integer (bpm)",
    "temperature": "decimal (°C)",
    "respiratory_rate": "integer (breaths/min)",
    "oxygen_saturation": "integer (SpO2 %)",
    "weight": "decimal (kg)",
    "height": "decimal (cm)",
    "bmi": "decimal",
    "notes": "text",
    "recorded_by": "string (user ID or name)",
    "created_at": "ISO 8601 datetime"
  }
]
```

---

#### GET /api/vital-data/{id}
Retrieve specific vital data record.

---

#### GET /api/vital-data/patient/{patientId}
Retrieve all vital data for a specific patient.

---

#### POST /api/vital-data
Create new vital data record (requires ADMIN, DOCTOR, or NURSE role).

**Request Body:**
```json
{
  "patient_id": "uuid (required)",
  "blood_pressure_systolic": "integer (required, 50-250)",
  "blood_pressure_diastolic": "integer (required, 30-150)",
  "heart_rate": "integer (required, 30-250)",
  "temperature": "decimal (required, 30-45)",
  "respiratory_rate": "integer (required, 5-60)",
  "oxygen_saturation": "integer (required, 0-100)",
  "weight": "decimal (required, 0.5-500)",
  "height": "decimal (required, 20-300)",
  "bmi": "decimal (auto-calculated)",
  "notes": "text",
  "recorded_by": "string (required)"
}
```

---

#### PUT /api/vital-data/{id}
Update vital data record (requires ADMIN, DOCTOR, or NURSE role).

---

#### DELETE /api/vital-data/{id}
Delete vital data record (requires ADMIN role).

---

### 5. Appointment Endpoints

#### GET /api/appointments
Retrieve all appointments.

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "patient_id": "uuid",
    "doctor_id": "uuid",
    "appointment_date": "YYYY-MM-DD",
    "appointment_time": "HH:mm:ss",
    "type": "CONSULTATION | FOLLOW_UP | PROCEDURE | EMERGENCY",
    "status": "SCHEDULED | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW",
    "notes": "text",
    "created_at": "ISO 8601 datetime"
  }
]
```

---

#### GET /api/appointments/{id}
Retrieve specific appointment.

---

#### GET /api/appointments/patient/{patientId}
Retrieve all appointments for a specific patient.

---

#### POST /api/appointments
Create new appointment (requires ADMIN, DOCTOR, or NURSE role).

**Request Body:**
```json
{
  "patient_id": "uuid (required)",
  "doctor_id": "uuid (required)",
  "appointment_date": "YYYY-MM-DD (required)",
  "appointment_time": "HH:mm:ss (required)",
  "type": "CONSULTATION | FOLLOW_UP | PROCEDURE | EMERGENCY (required)",
  "status": "SCHEDULED (default)",
  "notes": "text"
}
```

---

#### PUT /api/appointments/{id}
Update appointment.

---

#### DELETE /api/appointments/{id}
Delete appointment (requires ADMIN role).

---

### 6. Doctor Analysis Endpoints

#### GET /api/analysis
Retrieve all doctor analyses.

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "patient_id": "uuid",
    "doctor_id": "uuid",
    "diagnosis": "text (required)",
    "recommended_surgery": "text",
    "surgery_urgency": "ELECTIVE | URGENT | EMERGENCY",
    "clinical_notes": "text",
    "status": "PENDING | REVIEWED | APPROVED | DECLINED",
    "created_at": "ISO 8601 datetime"
  }
]
```

---

#### GET /api/analysis/{id}
Retrieve specific analysis.

---

#### GET /api/analysis/patient/{patientId}
Retrieve all analyses for a specific patient.

---

#### POST /api/analysis
Create new doctor analysis (requires DOCTOR role).

**Request Body:**
```json
{
  "patient_id": "uuid (required)",
  "doctor_id": "uuid (required)",
  "diagnosis": "text (required)",
  "recommended_surgery": "text",
  "surgery_urgency": "ELECTIVE | URGENT | EMERGENCY",
  "clinical_notes": "text",
  "status": "PENDING (default)"
}
```

---

#### PUT /api/analysis/{id}
Update doctor analysis (requires DOCTOR role).

---

#### DELETE /api/analysis/{id}
Delete doctor analysis (requires ADMIN role).

---

### 7. Prescription Endpoints

#### GET /api/prescriptions
Retrieve all prescriptions.

**Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "patient_id": "uuid",
    "doctor_id": "uuid",
    "medication_name": "string (required)",
    "dosage": "string (required)",
    "frequency": "string (required)",
    "duration": "string (required)",
    "instructions": "text",
    "created_at": "ISO 8601 datetime"
  }
]
```

---

#### GET /api/prescriptions/{id}
Retrieve specific prescription.

---

#### GET /api/prescriptions/patient/{patientId}
Retrieve all prescriptions for a specific patient.

---

#### POST /api/prescriptions
Create new prescription (requires DOCTOR role).

**Request Body:**
```json
{
  "patient_id": "uuid (required)",
  "doctor_id": "uuid (required)",
  "medication_name": "string (required)",
  "dosage": "string (required, e.g., '500mg')",
  "frequency": "string (required, e.g., 'Twice daily')",
  "duration": "string (required, e.g., '7 days')",
  "instructions": "text"
}
```

---

#### PUT /api/prescriptions/{id}
Update prescription (requires DOCTOR role).

---

#### DELETE /api/prescriptions/{id}
Delete prescription (requires ADMIN role).

---

### 8. User Profile Endpoints

#### GET /api/users/profile
Retrieve current user's profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "string",
  "phone": "string",
  "createdAt": "ISO 8601 datetime"
}
```

---

#### PUT /api/users/profile
Update current user's profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string (valid email)",
  "phone": "string"
}
```

**Response (200 OK):** Updated user profile

**Note:** Username and role cannot be updated through this endpoint.

---

## Role-Based Access Control (RBAC)

### Roles
1. **ADMIN**: Full system access
2. **DOCTOR**: Create/read/update medical records, prescriptions, analyses
3. **NURSE**: Read/create vital data, view patient records
4. **PATIENT**: View own medical records only

### Permission Matrix

| Endpoint | ADMIN | DOCTOR | NURSE | PATIENT |
|----------|-------|---------|--------|---------|
| GET /patients | ✅ | ✅ | ✅ | Own only |
| POST /patients | ✅ | ✅ | ✅ | ❌ |
| PUT /patients | ✅ | ✅ | ✅ | ❌ |
| DELETE /patients | ✅ | ❌ | ❌ | ❌ |
| GET /procedures | ✅ | ✅ | Read-only | Own only |
| POST /procedures | ✅ | ✅ | ❌ | ❌ |
| PUT /procedures | ✅ | ✅ | ❌ | ❌ |
| DELETE /procedures | ✅ | ❌ | ❌ | ❌ |
| POST /vital-data | ✅ | ✅ | ✅ | ❌ |
| POST /prescriptions | ✅ | ✅ | ❌ | ❌ |
| POST /analysis | ✅ | ✅ | ❌ | ❌ |

---

## Error Responses

### Standard Error Format
```json
{
  "timestamp": "ISO 8601 datetime",
  "status": "integer (HTTP status code)",
  "error": "string (error type)",
  "message": "string (error description)",
  "path": "string (request path)"
}
```

### Common Status Codes
- **200**: Success
- **201**: Created
- **204**: No Content (successful deletion)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate resource)
- **500**: Internal Server Error

---

## MySQL Database Schema

### Users Table
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT') DEFAULT 'PATIENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);
```

### Patients Table
```sql
CREATE TABLE patients (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER'),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    medical_history TEXT,
    allergies TEXT,
    current_medications TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_patient_id (patient_id),
    INDEX idx_email (email),
    INDEX idx_name (first_name, last_name)
);
```

### Surgical Procedures Table
```sql
CREATE TABLE surgical_procedures (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    procedure_name VARCHAR(255) NOT NULL,
    procedure_type VARCHAR(100),
    scheduled_date DATETIME,
    actual_date DATETIME,
    duration_minutes INT,
    surgeon_name VARCHAR(200),
    assistant_surgeon VARCHAR(200),
    anesthesia_type VARCHAR(100),
    pre_operative_notes TEXT,
    operative_notes TEXT,
    post_operative_notes TEXT,
    complications TEXT,
    status ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_date (scheduled_date)
);
```

### Vital Data Table
```sql
CREATE TABLE vital_data (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    blood_pressure_systolic INT NOT NULL,
    blood_pressure_diastolic INT NOT NULL,
    heart_rate INT NOT NULL,
    temperature DECIMAL(4,1) NOT NULL,
    respiratory_rate INT NOT NULL,
    oxygen_saturation INT NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    height DECIMAL(5,2) NOT NULL,
    bmi DECIMAL(4,1) NOT NULL,
    notes TEXT,
    recorded_by VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_created_at (created_at)
);
```

### Appointments Table
```sql
CREATE TABLE appointments (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    type ENUM('CONSULTATION', 'FOLLOW_UP', 'PROCEDURE', 'EMERGENCY') NOT NULL,
    status ENUM('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW') DEFAULT 'SCHEDULED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_status (status)
);
```

### Doctor Analysis Table
```sql
CREATE TABLE doctor_analysis (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    diagnosis TEXT NOT NULL,
    recommended_surgery TEXT,
    surgery_urgency ENUM('ELECTIVE', 'URGENT', 'EMERGENCY'),
    clinical_notes TEXT,
    status ENUM('PENDING', 'REVIEWED', 'APPROVED', 'DECLINED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_status (status)
);
```

### Prescriptions Table
```sql
CREATE TABLE prescriptions (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_created_at (created_at)
);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
);
```

---

## Environment Configuration

### application.properties
```properties
# Server Configuration
server.port=8080
server.servlet.context-path=/api

# MySQL Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/cvms_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# JWT Configuration
jwt.secret=your-256-bit-secret-key-change-in-production
jwt.expiration=900000
jwt.refresh-expiration=604800000

# Logging
logging.level.root=INFO
logging.level.com.cvms=DEBUG
logging.level.org.springframework.security=DEBUG
```

---

## Security Notes

1. **Password Storage**: All passwords are hashed using BCrypt before storage
2. **JWT Secret**: Change the JWT secret key in production
3. **HTTPS**: Use HTTPS in production
4. **CORS**: Configure CORS to allow only trusted origins
5. **Rate Limiting**: Implement rate limiting for login attempts
6. **Input Validation**: All inputs are validated using Spring Validation
7. **SQL Injection**: Protected by JPA/Hibernate parameterized queries

---

## Implementation Checklist

### Backend (Spring Boot)
- [ ] Set up Spring Boot project with dependencies
- [ ] Configure MySQL database connection
- [ ] Implement JWT authentication filter
- [ ] Create entity models for all tables
- [ ] Create repository interfaces
- [ ] Implement service layer with business logic
- [ ] Create REST controllers with endpoints
- [ ] Implement role-based access control
- [ ] Add input validation
- [ ] Implement exception handling
- [ ] Add logging
- [ ] Write unit tests
- [ ] Configure CORS

### Frontend (React)
- [x] API configuration with axios
- [x] Authentication service
- [x] API service layers for all entities
- [x] Update hooks to use API services
- [x] Update AuthContext
- [x] Add role-based UI components
- [x] Handle token refresh
- [x] Error handling
- [ ] Loading states
- [ ] Update environment variables

---

## Testing

### Sample Test Data

#### Admin User
```json
{
  "username": "admin",
  "email": "admin@cvms.com",
  "password": "Admin@123",
  "firstName": "System",
  "lastName": "Administrator",
  "role": "ADMIN"
}
```

#### Doctor User
```json
{
  "username": "dr.smith",
  "email": "smith@cvms.com",
  "password": "Doctor@123",
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "role": "DOCTOR"
}
```

#### Sample Patient
```json
{
  "patient_id": "PAT-001",
  "first_name": "Jane",
  "last_name": "Doe",
  "date_of_birth": "1990-05-15",
  "gender": "FEMALE",
  "phone": "+0987654321",
  "email": "jane.doe@example.com",
  "emergency_contact_name": "John Doe",
  "emergency_contact_phone": "+1122334455"
}
```

---

## Frontend Setup

### Environment Variables (.env)
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### Install Dependencies
```bash
npm install axios
```

All services and hooks have been updated to use the Spring Boot backend API.

---

## Migration Notes

### Removed
- ✅ All localStorage usage for data storage
- ✅ Supabase client and dependencies
- ✅ Local authentication logic

### Added
- ✅ Axios-based API client with interceptors
- ✅ Token management (access + refresh)
- ✅ Service layers for all entities
- ✅ Role-based authentication
- ✅ Automatic token refresh on 401

### Next Steps
1. Implement the Spring Boot backend following this documentation
2. Update .env file with your backend URL
3. Test all API endpoints
4. Add loading states and error boundaries in UI
5. Implement role-based UI components
6. Add comprehensive error handling

---

**Last Updated:** 2025
**Version:** 1.0.0
