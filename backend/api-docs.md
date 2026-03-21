# GoGreen API Routes — Detailed Documentation

**Base URL**: `/api/v1` (Web) | `/api/mobile/v1` (Mobile)

All responses follow a standard envelope:

```json
{
  "success": true,
  "message": "string",
  "data": { ... }
}
```

---

## 1. Authentication Routes

### `POST /signup`

Registers a new **user** account (public).

**Request Body** (`application/json`):
| Field | Type | Required | Validation |
|------------|----------|----------|--------------------|
| `name` | `string` | ✅ | min 2 chars |
| `email` | `string` | ✅ | valid email format |
| `password` | `string` | ✅ | min 6 chars |
| `phone` | `string` | ❌ | |
| `role` | `string` | ❌ | ignored for public signup, used only when an admin calls this |

**Response** (`201`):

```json
{
    "token": "jwt_string",
    "user": {
        "id": "ObjectId",
        "name": "string",
        "email": "string",
        "phone": "string",
        "role": "user",
        "permissions": ["CREATE_BOOKING", "..."]
    }
}
```

Sets an `httpOnly` cookie named `token` (7-day expiry).

---

### `POST /login`

Authenticates an existing user.

**Request Body** (`application/json`):
| Field | Type | Required | Validation |
|------------|----------|----------|--------------------|
| `email` | `string` | ✅ | valid email format |
| `password` | `string` | ✅ | min 1 char |

**Response** (`200`):

```json
{
    "token": "jwt_string",
    "user": {
        "id": "ObjectId",
        "name": "string",
        "email": "string",
        "role": "user | org | emp | admin | super-admin",
        "permissions": ["..."]
    }
}
```

---

### `POST /logout`

🔒 **Auth Required** — Clears the authentication cookie.

**Request Body**: _None_

**Response** (`200`): `{ }`

---

### `POST /create-admin`

⚠️ **Development/Setup endpoint** — Creates an admin or super-admin account without existing privileges.

**Request Body** (`application/json`):
| Field | Type | Required | Validation |
|------------|----------|----------|-----------------------------------------|
| `name` | `string` | ✅ | |
| `email` | `string` | ✅ | |
| `password` | `string` | ✅ | |
| `phone` | `string` | ❌ | |
| `role` | `string` | ✅ | Must be `"admin"` or `"super-admin"` |

**Response** (`201`):

```json
{
    "token": "jwt_string",
    "user": {
        "id": "ObjectId",
        "name": "string",
        "email": "string",
        "phone": "string",
        "role": "admin"
    }
}
```

---

## 2. User & Org Routes (`/user/*` and `/org/*`)

All routes require 🔒 **Auth** + specified **Permission**.

### `POST /user/bookings`

Creates a new booking for the authenticated user.

**Permission**: `CREATE_BOOKING`

**Request Body** (`application/json`):
| Field | Type | Required | Description |
|---------------|----------|----------|-----------------------------------|
| `address` | `string` | ✅ | Service address |
| `phoneNumber` | `string` | ✅ | Contact phone for this booking |
| `instruction` | `string` | ❌ | Special instructions |
| [date](file:///e:/workspace/IT/gogreen/backend/src/controllers/user.controller.ts#38-69) | `Date` (ISO string) | ✅ | Desired service date |
| `timeSlot` | `string` | ❌ | Preferred time slot |

> [!NOTE]
> The `serviceType` field is **required** by the Mongoose schema but not destructured in the controller. Ensure it is included in the request body.

**Response** (`201`): Full [Booking](file:///e:/workspace/IT/gogreen/backend/src/models/booking.model.ts#3-27) document.

---

### `PATCH /user/bookings/:id`

Updates an existing **pending** booking.

**Permission**: `UPDATE_BOOKING`

**URL Params**: `id` — Booking ObjectId

**Request Body**: Any subset of booking fields (`address`, `phoneNumber`, `instruction`, [date](file:///e:/workspace/IT/gogreen/backend/src/controllers/user.controller.ts#38-69), `timeSlot`). Only bookings with `status: "pending"` can be updated.

**Response** (`200`): Updated [Booking](file:///e:/workspace/IT/gogreen/backend/src/models/booking.model.ts#3-27) document.

---

### `GET /user/my-bookings`

Fetches paginated bookings for the authenticated user.

**Permission**: _None (Auth only)_ — Role must be `user` or `org`.

**Query Params**:
| Param | Type | Default | Description |
|----------|----------|---------|----------------------------------------------|
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `20` | Items per page |
| `status` | `string` | — | Filter by status (`pending`, `assigned`, etc.) |

**Response** (`200`):

```json
{
  "bookings": [ ... ],
  "total": 45,
  "page": 1,
  "pages": 3
}
```

---

### `POST /user/reviews`

Creates a review for a **completed** booking.

**Permission**: `CREATE_REVIEW_SELF`

**Request Body** (`application/json`):
| Field | Type | Required | Validation |
|-------------|----------|----------|------------|
| `bookingId` | `string` (ObjectId) | ✅ | Must be user's own completed booking |
| `rating` | `number` | ✅ | `1`–`5` |
| `feedback` | `string` | ❌ | |

**Response** (`201`): Full [Review](file:///e:/workspace/IT/gogreen/backend/src/models/review.model.ts#3-12) document.

---

### `PATCH /user/reviews/:id`

Updates an existing review.

**Permission**: `UPDATE_REVIEW_SELF`

**URL Params**: `id` — Review ObjectId

**Request Body**: Any subset of `{ rating, feedback }`.

**Response** (`200`): Updated [Review](file:///e:/workspace/IT/gogreen/backend/src/models/review.model.ts#3-12) document.

---

### `DELETE /user/reviews/:id`

Deletes an existing review.

**Permission**: `DELETE_REVIEW_SELF`

**URL Params**: `id` — Review ObjectId

**Response** (`200`): `{ }`

---

### `GET /user/profile`

Fetches the authenticated user's profile (password excluded).

**Permission**: `GET_PROFILE_SELF`

**Response** (`200`): [User](file:///e:/workspace/IT/gogreen/backend/src/models/user.model.ts#4-18) document (without `password`).

---

### `PATCH /user/profile`

Updates the authenticated user's profile.

**Permission**: `UPDATE_PROFILE_SELF`

**Request Body**: Any subset of `{ name, email, phone, address }`.

**Response** (`200`): Updated [User](file:///e:/workspace/IT/gogreen/backend/src/models/user.model.ts#4-18) document (without `password`).

---

### `DELETE /user/profile`

Permanently deletes the authenticated user's account.

**Permission**: `DELETE_PROFILE_SELF`

**Response** (`200`): `{ }`

---

## 3. Employee Routes (`/emp/*`)

All routes require 🔒 **Auth** + specified **Permission**.

### `GET /emp/bookings`

Returns all bookings assigned to this employee.

**Permission**: `GET_ASSIGNED_BOOKING`

**Response** (`200`): Array of [Booking](file:///e:/workspace/IT/gogreen/backend/src/models/booking.model.ts#3-27) documents sorted by [date](file:///e:/workspace/IT/gogreen/backend/src/controllers/user.controller.ts#38-69) descending.

---

### `GET /emp/bookings/:id`

Returns details of a specific assigned booking (with customer info populated).

**Permission**: `GET_ASSIGNED_BOOKING_DETAILS`

**URL Params**: `id` — Booking ObjectId

**Response** (`200`): [Booking](file:///e:/workspace/IT/gogreen/backend/src/models/booking.model.ts#3-27) document with populated `userId` (customer details).

---

### `GET /emp/bookings/:id/review`

Returns the review for a specific assigned booking, if one exists.

**Permission**: `GET_ASSIGNED_BOOKING_REVIEW`

**URL Params**: `id` — Booking ObjectId

**Response** (`200`): [Review](file:///e:/workspace/IT/gogreen/backend/src/models/review.model.ts#3-12) document or `{ }` if no review exists.

---

### `PATCH /emp/bookings/:id/before-photo`

Uploads or updates the "before" photo URL for an assigned booking.

**Permission**: `UPDATE_BEFORE_PHOTO`

**URL Params**: `id` — Booking ObjectId

**Request Body** (`application/json`):
| Field | Type | Required | Description |
|---------------|----------|----------|--------------------|
| `beforePhoto` | `string` | ✅ | URL of the photo |

**Response** (`200`): Updated [Booking](file:///e:/workspace/IT/gogreen/backend/src/models/booking.model.ts#3-27) document.

---

### `PATCH /emp/bookings/:id/after-photo`

Uploads the "after" photo URL. **Also marks the booking as `completed`** and sets `completedAt`.

**Permission**: `UPDATE_AFTER_PHOTO`

**URL Params**: `id` — Booking ObjectId

**Request Body** (`application/json`):
| Field | Type | Required | Description |
|--------------|----------|----------|--------------------|
| `afterPhoto` | `string` | ✅ | URL of the photo |

**Response** (`200`): Updated [Booking](file:///e:/workspace/IT/gogreen/backend/src/models/booking.model.ts#3-27) document (status = `"completed"`).

---

### `GET /emp/profile`

**Permission**: `GET_PROFILE_SELF` — Returns employee profile, same as user.

### `PATCH /emp/profile`

**Permission**: `UPDATE_PROFILE_SELF` — Body: `{ name, email, phone, address }`.

### `DELETE /emp/profile`

**Permission**: `DELETE_PROFILE_SELF` — Deletes employee account.

---

## 4. Admin Routes (`/admin/*`)

All routes require 🔒 **Auth** + specified **Permission**.

### `GET /admin/accounts`

Returns all user accounts in the system across all roles.

**Permission**: `GET_ALL_ACCOUNTS`

**Response** (`200`): Array of [User](file:///e:/workspace/IT/gogreen/backend/src/models/user.model.ts#4-18) documents with populated `role.name`.

---

### `GET /admin/accounts/:userId/bookings`

Returns the booking history of a specific user.

**Permission**: `GET_BOOKING_HISTORY`

**URL Params**: `userId` — User ObjectId

**Response** (`200`): Array of [Booking](file:///e:/workspace/IT/gogreen/backend/src/models/booking.model.ts#3-27) documents sorted by [date](file:///e:/workspace/IT/gogreen/backend/src/controllers/user.controller.ts#38-69) descending.

---

### `DELETE /admin/accounts/:id`

Deletes any user/org/emp account.

**Permission**: `DELETE_ACCOUNT`

**URL Params**: `id` — User ObjectId

**Response** (`200`): `{ }`

---

### `POST /admin/accounts`

Creates a new **org** or **emp** account.

**Permission**: `CREATE_ORG_EMP`

**Request Body** (`application/json`):
| Field | Type | Required | Validation |
|------------|----------|----------|----------------------------|
| `name` | `string` | ✅ | |
| `email` | `string` | ✅ | |
| `password` | `string` | ✅ | |
| `phone` | `string` | ❌ | |
| `roleName` | `string` | ✅ | Must be `"org"` or `"emp"` |

**Response** (`201`):

```json
{
    "id": "ObjectId",
    "name": "string",
    "email": "string",
    "role": "org | emp"
}
```

---

### `GET /admin/bookings`

Returns **all bookings** in the system with optional filters.

**Permission**: `VIEW_ALL_BOOKINGS`

**Query Params**:
| Param | Type | Description |
|--------------|----------|---------------------------------------------|
| `status` | `string` | Filter: `pending`, `assigned`, `in_progress`, `completed`, `cancelled` |
| `userId` | `string` | Filter by customer ObjectId |
| `employeeId` | `string` | Filter by employee ObjectId |
| `startDate` | `string` (ISO date) | Filter bookings from this date |
| `endDate` | `string` (ISO date) | Filter bookings up to this date |

**Response** (`200`): Array of [Booking](file:///e:/workspace/IT/gogreen/backend/src/models/booking.model.ts#3-27) documents with populated `userId` and `employeeId` (name, email, phone). Sorted newest first.

---

### `PATCH /admin/bookings/assign`

Assigns a booking to an employee (basic).

**Permission**: `UPDATE_ASSIGN_BOOKING`

**Request Body** (`application/json`):
| Field | Type | Required | Description |
|--------------|----------|----------|--------------------------------------------|
| `bookingId` | `string` (ObjectId) | ✅ | The booking to assign |
| `employeeId` | `string` (ObjectId) | ✅ | The employee to assign it to. Must have `emp` role |

Sets booking `status` → `"assigned"` and records `assignedAt`.

**Response** (`200`): Updated [Booking](file:///e:/workspace/IT/gogreen/backend/src/models/booking.model.ts#3-27) document.

---

### `POST /admin/bookings/assign-task`

Enhanced task assignment with validation and optional employee discovery.

**Permission**: `UPDATE_ASSIGN_BOOKING`

**Request Body** (`application/json`):
| Field | Type | Required | Description |
|--------------|----------|----------|--------------------------------------------|
| `bookingId` | `string` (ObjectId) | ✅ | The booking to assign |
| `employeeId` | `string` (ObjectId) | ❌ | If omitted, returns list of available employees |

**Behavior**:

- If `employeeId` is provided: validates employee role & active status, assigns booking.
- If `employeeId` is omitted: returns booking details + list of available employees.
- Rejects bookings that are already `assigned`, `in_progress`, `completed`, or `cancelled`.

**Response** (`200`) — with employee:

```json
{
  "booking": { ... },
  "assignedTo": { "id": "...", "name": "...", "email": "...", "phone": "..." }
}
```

**Response** (`200`) — without employee:

```json
{
    "booking": {
        "id": "...",
        "serviceType": "...",
        "address": "...",
        "date": "...",
        "timeSlot": "...",
        "status": "..."
    },
    "availableEmployees": [{ "name": "...", "email": "...", "phone": "..." }]
}
```

---

### `GET /admin/employees/available`

Returns all active employees sorted by workload (least busy first).

**Permission**: `GET_ALL_ACCOUNTS`

**Response** (`200`):

```json
{
    "totalEmployees": 5,
    "employees": [
        {
            "id": "ObjectId",
            "name": "string",
            "email": "string",
            "phone": "string",
            "address": "string",
            "activeTasksCount": 2
        }
    ]
}
```

---

### `GET /admin/reviews`

Returns all reviews with populated booking and user details.

**Permission**: `VIEW_ALL_REVIEWS`

**Response** (`200`): Array of [Review](file:///e:/workspace/IT/gogreen/backend/src/models/review.model.ts#3-12) documents with populated `bookingId` and `userId`.

---

### Admin Profile Endpoints

- `GET /admin/profile` — `GET_PROFILE_SELF`
- `PATCH /admin/profile` — `UPDATE_PROFILE_SELF`, Body: `{ name, email, phone, address }`
- `DELETE /admin/profile` — `DELETE_PROFILE_SELF`

---

## 5. Super Admin Routes (`/super/*`)

Inherits most Admin capabilities plus the ability to create Admin accounts.

### `POST /super/accounts/admin`

🔑 **Super Admin Only** — Creates a new [admin](file:///e:/workspace/IT/gogreen/backend/src/controllers/auth/auth.controller.ts#290-353) account.

**Permission**: `CREATE_ADMIN`

**Request Body** (`application/json`):
| Field | Type | Required |
|------------|----------|----------|
| `name` | `string` | ✅ |
| `email` | `string` | ✅ |
| `password` | `string` | ✅ |
| `phone` | `string` | ❌ |

**Response** (`201`):

```json
{
    "id": "ObjectId",
    "name": "string",
    "email": "string",
    "role": "admin"
}
```

### Other Super Admin Endpoints

These work identically to their Admin counterparts:

| Method   | Route                              | Permission              | Description                                                                    |
| -------- | ---------------------------------- | ----------------------- | ------------------------------------------------------------------------------ |
| `GET`    | `/super/accounts`                  | `GET_ALL_ACCOUNTS`      | List all accounts                                                              |
| `GET`    | `/super/accounts/:userId/bookings` | `GET_BOOKING_HISTORY`   | User's booking history                                                         |
| `PATCH`  | `/super/accounts/:userId/role`     | `CREATE_ORG_EMP`        | Update a user's role to `org` or `emp`. Body: `{ "roleName": "org" \| "emp" }` |
| `DELETE` | `/super/accounts/:id`              | `DELETE_ACCOUNT`        | Delete any account                                                             |
| `POST`   | `/super/accounts`                  | `CREATE_ORG_EMP`        | Create org/emp account                                                         |
| `GET`    | `/super/bookings`                  | `VIEW_ALL_BOOKINGS`     | All bookings (with filters)                                                    |
| `PATCH`  | `/super/bookings/assign`           | `UPDATE_ASSIGN_BOOKING` | Assign booking                                                                 |
| `GET`    | `/super/reviews`                   | `VIEW_ALL_REVIEWS`      | All reviews                                                                    |
| `GET`    | `/super/profile`                   | `GET_PROFILE_SELF`      | Own profile                                                                    |
| `PATCH`  | `/super/profile`                   | `UPDATE_PROFILE_SELF`   | Update profile                                                                 |
| `DELETE` | `/super/profile`                   | `DELETE_PROFILE_SELF`   | Delete profile                                                                 |

---

## Appendix: Data Model Schemas

### User

| Field       | Type       | Required | Notes                                                                                               |
| ----------- | ---------- | -------- | --------------------------------------------------------------------------------------------------- |
| `name`      | `string`   | ✅       | trimmed, indexed                                                                                    |
| `email`     | `string`   | ✅       | unique, lowercase                                                                                   |
| `password`  | `string`   | ✅       | excluded from queries by default                                                                    |
| `phone`     | `string`   | ❌       |                                                                                                     |
| `address`   | `string`   | ❌       |                                                                                                     |
| `isActive`  | `boolean`  | —        | default: `true`                                                                                     |
| `role`      | `ObjectId` | ✅       | ref → [Role](file:///e:/workspace/IT/gogreen/backend/src/controllers/auth/auth.controller.ts#12-21) |
| `createdAt` | `Date`     | auto     |                                                                                                     |
| `updatedAt` | `Date`     | auto     |                                                                                                     |

### Booking

| Field                                                                                    | Type       | Required | Notes                                                                                                |
| ---------------------------------------------------------------------------------------- | ---------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `userId`                                                                                 | `ObjectId` | ✅       | ref → [User](file:///e:/workspace/IT/gogreen/backend/src/models/user.model.ts#4-18)                  |
| `employeeId`                                                                             | `ObjectId` | ❌       | ref → [User](file:///e:/workspace/IT/gogreen/backend/src/models/user.model.ts#4-18), default: `null` |
| `serviceType`                                                                            | `string`   | ✅       |                                                                                                      |
| `address`                                                                                | `string`   | ✅       |                                                                                                      |
| `phoneNumber`                                                                            | `string`   | ✅       |                                                                                                      |
| `instruction`                                                                            | `string`   | ❌       |                                                                                                      |
| `beforePhoto`                                                                            | `string`   | ❌       | URL                                                                                                  |
| `afterPhoto`                                                                             | `string`   | ❌       | URL                                                                                                  |
| [date](file:///e:/workspace/IT/gogreen/backend/src/controllers/user.controller.ts#38-69) | `Date`     | ✅       |                                                                                                      |
| `timeSlot`                                                                               | `string`   | ❌       |                                                                                                      |
| `status`                                                                                 | `enum`     | —        | `pending` · `assigned` · `in_progress` · `completed` · `cancelled`                                   |
| `amount`                                                                                 | `number`   | ❌       | default: `0`                                                                                         |
| `paymentStatus`                                                                          | `enum`     | ❌       | `pending` · `paid` · `refunded`                                                                      |
| `assignedAt`                                                                             | `Date`     | ❌       | Set on assignment                                                                                    |
| `completedAt`                                                                            | `Date`     | ❌       | Set on completion                                                                                    |
| `cancelledAt`                                                                            | `Date`     | ❌       |                                                                                                      |
| `isActive`                                                                               | `boolean`  | —        | default: `true`                                                                                      |

### Review

| Field       | Type       | Required | Notes                                                                                     |
| ----------- | ---------- | -------- | ----------------------------------------------------------------------------------------- |
| `bookingId` | `ObjectId` | ✅       | ref → [Booking](file:///e:/workspace/IT/gogreen/backend/src/models/booking.model.ts#3-27) |
| `userId`    | `ObjectId` | ✅       | ref → [User](file:///e:/workspace/IT/gogreen/backend/src/models/user.model.ts#4-18)       |
| `rating`    | `number`   | ✅       | min: `1`, max: `5`                                                                        |
| `feedback`  | `string`   | ❌       |                                                                                           |
| `createdAt` | `Date`     | auto     |                                                                                           |
| `updatedAt` | `Date`     | auto     |                                                                                           |
