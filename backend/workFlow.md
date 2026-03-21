# Booking Workflow API Reference

This document outlines the step-by-step API requests required for the booking lifecycle, from creation to review.

---

### 1. Authentication (Login)

- **Role**: Any (`user`, `org`, `emp`, `admin`, `super-admin`)
- **Method**: `POST`
- **URL**: `http://localhost:8001/api/v1/login`
- **Body**:
    ```json
    {
        "email": "amc@mail.com",
        "password": "amc@1389"
    }
    ```
- **Notes**: Sets an `httpOnly` cookie required for all subsequent requests.

---

### 2. Create Task (Booking)

- **Role**: `user` or `org`
- **Permission**: `CREATE_BOOKING`
- **Method**: `POST`
- **URL**: `http://localhost:8001/api/v1/user/bookings`
- **Body**:
    ```json
    {
        "serviceType": "maintenance",
        "address": "123 Business Rd, Tech Park",
        "phoneNumber": "9876543210",
        "instruction": "Fix the AC units on the 4th floor.",
        "date": "2026-03-08T09:00:00Z",
        "timeSlot": "Morning"
    }
    ```

---

### 3. Assign Task to Employee

- **Role**: `admin` or `super-admin`
- **Permission**: `UPDATE_ASSIGN_BOOKING`
- **Method**: `PATCH`
- **URL**: `http://localhost:8001/api/v1/super/bookings/assign` _(or `/api/v1/admin/bookings/assign`)_
- **Body**:
    ```json
    {
        "bookingId": "69a9693817d5602f9bbc524e",
        "employeeId": "69a836a26cd396d98dfedc8b"
    }
    ```

---

### 4. Fetch Assigned Tasks (Employee Dashboard)

- **Role**: `emp`
- **Permission**: `GET_ASSIGNED_BOOKING`
- **Method**: `GET`
- **URL**: `http://localhost:8001/api/v1/emp/bookings`
- **Body**: _None_

---

### 5. Update Task Status

- **Role**: `emp`
- **Permission**: `GET_ASSIGNED_BOOKING` (Reusing employee dashboard permission)
- **Method**: `PATCH`
- **URL**: `http://localhost:8001/api/v1/emp/bookings/:id/status` _(Replace `:id` with booking ID)_
- **Body**:
    ```json
    {
        "status": "started"
    }
    ```
- **Valid Statuses**: `"started"`, `"inprogress"`, `"ended"`. _(Note: Changing to `"ended"` automatically sets the `completedAt` timestamp)._

---

### 6. Create Review

- **Role**: `user` or `org`
- **Permission**: `CREATE_REVIEW_SELF`
- **Method**: `POST`
- **URL**: `http://localhost:8001/api/v1/user/reviews`
- **Body**:
    ```json
    {
        "bookingId": "69a9693817d5602f9bbc524e",
        "rating": 5,
        "feedback": "Great service, very professional!"
    }
    ```
- **Notes**: The booking must be marked as `"completed"` or `"ended"` before a review can be created.

---

### 7. Update Review (Optional)

- **Role**: `user` or `org`
- **Permission**: `UPDATE_REVIEW_SELF`
- **Method**: `PATCH`
- **URL**: `http://localhost:8001/api/v1/user/reviews/:id` _(Replace `:id` with review ID, not booking ID)_
- **Body**:
    ```json
    {
        "rating": 4,
        "feedback": "Good service, but arrived slightly late."
    }
    ```
