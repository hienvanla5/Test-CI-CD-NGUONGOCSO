# Nguồn Gốc Số API Documentation

## 1. Overview

This document provides complete API reference for frontend developers integrating with the Nguồn Gốc Số backend. All endpoints, request/response formats, authentication requirements, and validation rules are documented based on the actual backend source code.

**Base URL:** `http://<host>:<port>` (port is configured via application properties; see backend `.env` for database config).

**Content Type:** All requests and responses use `application/json`.

---

## 2. Base URL

| Environment | Base URL |
|---|---|
| Local Development | `http://localhost:8080` (default Spring Boot port) |

The actual port may vary based on the `server.port` configuration in `application.properties` or `application.yml`.

---

## 3. Authentication

### 3.1 Authentication Flow

The backend uses **JWT (JSON Web Token)** based stateless authentication.

1. Client sends credentials to `POST /api/v1/auth/login`.
2. Server validates credentials and returns a JWT access token.
3. Client includes the token in the `Authorization` header for all subsequent requests.

### 3.2 Authorization Header Format

```http
Authorization: Bearer <access_token>
```

The `Authorization` header is required for all endpoints except the public ones listed below.

### 3.3 JWT Token Structure

The JWT contains the following claims:

| Claim | Description |
|---|---|
| `sub` | Username |
| `userId` | User UUID |
| `orgId` | Organization UUID |
| `orgName` | Organization name |
| `orgCode` | Organization code |
| `role` | Role code (e.g., `VT-01`) |
| `fullName` | User's full name |
| `iat` | Issued at timestamp |
| `exp` | Expiration timestamp |

### 3.4 Token Expiration

Token expiration duration is configured via `app.jwt.expiration` in backend application properties. The exact value is not explicitly defined in the source code (it is read from configuration). Use the `expiresIn` field from the login response to determine the token lifetime in seconds.

### 3.5 Public Endpoints

The following endpoints do **not** require authentication:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | User login |
| `*` | `/public/**` | Any path under `/public/` |
| `GET` | `/actuator/health` | Health check |
| `OPTIONS` | `/**` | CORS preflight requests |

All other endpoints require authentication.

### 3.6 Role Codes

| Code | Constant Name | Description |
|---|---|---|
| `VT-01` | ADMIN | System administrator |
| `VT-02` | ORG_MANAGER | Organization manager (Cooperative) |
| `VT-03` | EVENT_RECODER | Event recorder (Cooperative) |
| `VT-04` | PROCUREMENT | Procurement (Enterprise) |
| `VT-05` | REGULATOR | Government regulator |
| `VT-06` | CONSUMER | Consumer |

### 3.7 CORS Configuration

The backend allows cross-origin requests from the following origins:

- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost:63342`
- `http://localhost`
- `http://localhost:5500`
- `http://127.0.0.1:5500`
- `http://localhost:5501`
- `http://127.0.0.1:5501`

Allowed methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

Allowed headers: `Authorization`, `Content-Type`

Exposed headers: `Authorization`

Credentials (cookies) are supported.

---

## 4. Common API Response

All API responses are wrapped in the `ApiResult<T>` structure.

### 4.1 ApiResult Structure

```json
{
  "success": true,
  "status": 200,
  "data": {},
  "message": "Success message or null",
  "timestamp": "2026-07-20T03:27:51Z"
}
```

| Field | Type | Description |
|---|---|---|
| `success` | `boolean` | `true` if the request succeeded; `false` if an error occurred |
| `status` | `int` | HTTP status code |
| `data` | `object` or `null` | Response payload (type varies by endpoint) |
| `message` | `string` or `null` | Human-readable message |
| `timestamp` | `string` (ISO 8601) | Server timestamp of the response |

### 4.2 Error Response Example

```json
{
  "success": false,
  "status": 400,
  "data": null,
  "message": "Validation failed: Tên tổ chức không được để trống",
  "timestamp": "2026-07-20T03:27:51Z"
}
```

### 4.3 HTTP Status Codes Used

| Status Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Resource created (used by `POST /api/v1/farm-areas`) |
| `400` | Bad request / validation failure |
| `401` | Unauthorized (missing or invalid token) |
| `403` | Forbidden (insufficient role) |
| `404` | Resource not found |
| `409` | Duplicate resource conflict |
| `500` | Internal server error |

---

## 5. Authentication APIs

### 5.1 POST /api/v1/auth/login

#### Description

Authenticates a user with username, password, and organization code. Returns a JWT token and user profile information.

#### Authentication

**Not required.** This is a public endpoint.

#### Request Body

| Field | Type | Required | Validation | Example |
|---|---|---|---|---|
| `username` | `String` | Yes | `@NotBlank`, max 100 chars | `"admin"` |
| `password` | `String` | Yes | `@NotBlank`, min 6 chars, max 100 chars | `"password123"` |
| `organizationCode` | `String` | Yes | `@NotBlank` | `"SYS"` |

#### Request Example

```json
{
  "username": "admin",
  "password": "password123",
  "organizationCode": "SYS"
}
```

#### Success Response

**HTTP Status:** `200`

**Response Body:** `ApiResult<LoginResponse>`

`LoginResponse` fields:

| Field | Type | Description |
|---|---|---|
| `token` | `String` | JWT access token |
| `tokenType` | `String` | Token type, e.g., `"Bearer"` |
| `expiresIn` | `long` | Token expiration time in seconds |

```json
{
  "success": true,
  "status": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400
  },
  "message": null,
  "timestamp": "2026-07-20T03:27:51Z"
}
```

#### Error Responses

| HTTP Status | Description |
|---|---|
| `400` | Validation error — missing or invalid fields |
| `401` | Invalid credentials (username, password, or organization code) |

---

### 5.2 GET /api/v1/auth/me

#### Description

Returns the profile of the currently authenticated user based on the JWT token.

#### Authentication

**Required.** `@PreAuthorize("isAuthenticated()")`

No specific role is required — any authenticated user can access this endpoint.

#### Request Headers

| Header | Value |
|---|---|
| `Authorization` | `Bearer <access_token>` |

#### Request Body

None.

#### Success Response

**HTTP Status:** `200`

**Response Body:** `ApiResult<UserProfileResponse>`

`UserProfileResponse` fields:

| Field | Type | Description |
|---|---|---|
| `userId` | `UUID` | User's unique identifier |
| `username` | `String` | Username |
| `fullName` | `String` | User's full name |
| `roleCode` | `String` | Role code (e.g., `"VT-01"`) |
| `roleName` | `String` | Human-readable role name |
| `organizationId` | `UUID` | Organization's unique identifier |
| `organizationCode` | `String` | Organization code |
| `organizationName` | `String` | Organization display name |
| `organizationType` | `OrganizationType` | Organization type enum value |

```json
{
  "success": true,
  "status": 200,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "admin",
    "fullName": "Administrator",
    "roleCode": "VT-01",
    "roleName": "Admin",
    "organizationId": "660e8400-e29b-41d4-a716-446655440001",
    "organizationCode": "SYS",
    "organizationName": "Hệ thống Nguồn Gốc Số",
    "organizationType": "SYSTEM"
  },
  "message": null,
  "timestamp": "2026-07-20T03:27:51Z"
}
```

#### Error Responses

| HTTP Status | Description |
|---|---|
| `401` | Missing or invalid JWT token |

---

## 6. Organization APIs

### 6.1 POST /api/v1/admin/organizations

#### Description

Creates a new organization along with a default manager account for that organization.

#### Authentication

**Required.** This endpoint is under `/api/v1/admin/organizations` which is not in the public paths list. Authentication is enforced by `SecurityConfig` (`.anyRequest().authenticated()`).

No method-level role annotation is present, so any authenticated user can access this endpoint.

#### Request Body

| Field | Type | Required | Validation | Example |
|---|---|---|---|---|
| `organizationName` | `String` | Yes | `@NotBlank`, max 255 chars | `"Hợp tác xã ABC"` |
| `organizationCode` | `String` | Yes | `@NotBlank`, regex: `^[A-Z0-9_-]+$` (uppercase letters, digits, hyphens, underscores only) | `"HTX_ABC"` |
| `organizationType` | `OrganizationType` | Yes | `@NotNull` | `"COOPERATIVE"` |
| `provinceCode` | `String` | No | Not explicitly defined in source | `"79"` |
| `districtCode` | `String` | No | Not explicitly defined in source | `"760"` |
| `wardCode` | `String` | No | Not explicitly defined in source | `"27139"` |
| `addressDetail` | `String` | No | Not explicitly defined in source | `"Ấp Mỹ Thuận, Xã Mỹ Phong"` |
| `website` | `String` | No | Not explicitly defined in source | `"https://htxabc.vn"` |
| `managerUsername` | `String` | Yes | `@NotBlank`, max 100 chars | `"quanly_htx"` |
| `managerPassword` | `String` | Yes | `@NotBlank`, min 6 chars, max 100 chars | `"Secure@123"` |
| `managerFullName` | `String` | Yes | `@NotBlank`, max 255 chars | `"Nguyễn Văn A"` |
| `managerEmail` | `String` | Yes | `@NotBlank`, `@Email` (valid email format) | `"quanly@htxabc.vn"` |
| `managerPhone` | `String` | No | Not explicitly defined in source | `"0912345678"` |

#### Request Example

```json
{
  "organizationName": "Hợp tác xã ABC",
  "organizationCode": "HTX_ABC",
  "organizationType": "COOPERATIVE",
  "provinceCode": "79",
  "districtCode": "760",
  "wardCode": "27139",
  "addressDetail": "Ấp Mỹ Thuận, Xã Mỹ Phong",
  "website": "https://htxabc.vn",
  "managerUsername": "quanly_htx",
  "managerPassword": "Secure@123",
  "managerFullName": "Nguyễn Văn A",
  "managerEmail": "quanly@htxabc.vn",
  "managerPhone": "0912345678"
}
```

#### Success Response

**HTTP Status:** `200`

**Response Body:** `ApiResult<OrganizationResponse>`

`OrganizationResponse` fields:

| Field | Type | Description |
|---|---|---|
| `organizationID` | `UUID` | Organization unique identifier |
| `organizationName` | `String` | Organization display name |
| `organizationCode` | `String` | Organization code |
| `organizationType` | `OrganizationType` | Organization type |
| `status` | `OrganizationStatus` | Organization status |
| `provinceCode` | `String` | Province code |
| `districtCode` | `String` | District code |
| `wardCode` | `String` | Ward code |
| `addressDetail` | `String` | Address detail |
| `website` | `String` | Website URL |

```json
{
  "success": true,
  "status": 200,
  "data": {
    "organizationID": "770e8400-e29b-41d4-a716-446655440000",
    "organizationName": "Hợp tác xã ABC",
    "organizationCode": "HTX_ABC",
    "organizationType": "COOPERATIVE",
    "status": "ACTIVE",
    "provinceCode": "79",
    "districtCode": "760",
    "wardCode": "27139",
    "addressDetail": "Ấp Mỹ Thuận, Xã Mỹ Phong",
    "website": "https://htxabc.vn"
  },
  "message": null,
  "timestamp": "2026-07-20T03:27:51Z"
}
```

#### Error Responses

| HTTP Status | Description |
|---|---|
| `400` | Validation error |
| `401` | Missing or invalid JWT token |
| `409` | Duplicate organization code or username |

---

### 6.2 PUT /api/v1/admin/organizations/profile/{id}

#### Description

Updates the profile of an existing organization. Only accessible by system administrators.

#### Authentication

**Required.** `@PreAuthorize("hasAnyRole('VT-01')")`

**Required Role:** `VT-01` (Admin)

#### Path Variables

| Parameter | Type | Description |
|---|---|---|
| `id` | `UUID` | Organization unique identifier |

#### Request Body

| Field | Type | Required | Validation | Example |
|---|---|---|---|---|
| `organizationName` | `String` | No | Not explicitly defined in source | `"Hợp tác xã ABC (Đổi mới)"` |
| `website` | `String` | No | Not explicitly defined in source | `"https://htxabc.vn"` |
| `provinceCode` | `String` | No | Not explicitly defined in source | `"79"` |
| `districtCode` | `String` | No | Not explicitly defined in source | `"760"` |
| `wardCode` | `String` | No | Not explicitly defined in source | `"27139"` |
| `addressDetail` | `String` | No | Not explicitly defined in source | `"Địa chỉ mới"` |

Additional fields may be present in the DTO; all are optional for updates.

#### Request Example

```json
{
  "organizationName": "Hợp tác xã ABC (Đổi mới)",
  "website": "https://htxabc.vn",
  "provinceCode": "79",
  "districtCode": "760",
  "wardCode": "27139",
  "addressDetail": "Địa chỉ mới"
}
```

#### Success Response

**HTTP Status:** `200`

**Response Body:** `ApiResult<OrganizationProfileResponse>`

`OrganizationProfileResponse` contains the updated organization profile fields (mirrors `OrganizationResponse` with potentially profile-specific additions).

```json
{
  "success": true,
  "status": 200,
  "data": {
    "organizationID": "770e8400-e29b-41d4-a716-446655440000",
    "organizationName": "Hợp tác xã ABC (Đổi mới)",
    "organizationCode": "HTX_ABC",
    "organizationType": "COOPERATIVE",
    "status": "ACTIVE",
    "provinceCode": "79",
    "districtCode": "760",
    "wardCode": "27139",
    "addressDetail": "Địa chỉ mới",
    "website": "https://htxabc.vn"
  },
  "message": null,
  "timestamp": "2026-07-20T03:27:51Z"
}
```

#### Error Responses

| HTTP Status | Description |
|---|---|
| `400` | Validation error |
| `401` | Missing or invalid JWT token |
| `403` | User does not have role `VT-01` |
| `404` | Organization with given `id` not found |

---

## 7. Farm Area APIs

### 7.1 POST /api/v1/farm-areas

#### Description

Creates a new farm area (vùng trồng) with geographic coordinates.

#### Authentication

**Required.** The endpoint is not in the public paths list; authentication is enforced by `SecurityConfig` (`.anyRequest().authenticated()`).

#### Request Body

| Field | Type | Required | Validation | Example |
|---|---|---|---|---|
| `name` | `String` | Yes | `@NotBlank` | `"Vùng trồng Lúa số 1"` |
| `farmCode` | `String` | Yes | `@NotBlank` | `"FARM-001"` |
| `area` | `double` | Yes | `@NotNull`, `@Positive` (must be greater than 0) | `1500.5` |
| `productCategoryId` | `Integer` | Yes | `@NotNull` | `1` |
| `latitude` | `double` | Not explicitly defined | Used for geographic point location | `10.762622` |
| `longitude` | `double` | Not explicitly defined | Used for geographic point location | `106.660172` |
| `provinceCode` | `String` | No | Not explicitly defined in source | `"79"` |
| `districtCode` | `String` | No | Not explicitly defined in source | `"760"` |
| `wardCode` | `String` | No | Not explicitly defined in source | `"27139"` |
| `addressDetail` | `String` | No | Not explicitly defined in source | `"Ấp Mỹ Thuận"` |

#### Request Example

```json
{
  "name": "Vùng trồng Lúa số 1",
  "farmCode": "FARM-001",
  "area": 1500.5,
  "productCategoryId": 1,
  "latitude": 10.762622,
  "longitude": 106.660172,
  "provinceCode": "79",
  "districtCode": "760",
  "wardCode": "27139",
  "addressDetail": "Ấp Mỹ Thuận"
}
```

#### Success Response

**HTTP Status:** `201`

**Response Body:** `ApiResult<FarmAreaResponse>`

`FarmAreaResponse` fields:

| Field | Type | Description |
|---|---|---|
| `id` | `UUID` | Farm area unique identifier |
| `name` | `String` | Farm area name |
| `farmCode` | `String` | Farm code |
| `area` | `double` | Area size |
| `productCategoryName` | `String` | Name of the product category (if resolved) |
| Coordinates / latitude / longitude fields related to geographic position are included in the response as determined by the service layer. | | |

```json
{
  "success": true,
  "status": 201,
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440000",
    "name": "Vùng trồng Lúa số 1",
    "farmCode": "FARM-001",
    "area": 1500.5,
    "productCategoryName": "Lúa"
  },
  "message": null,
  "timestamp": "2026-07-20T03:27:51Z"
}
```

#### Error Responses

| HTTP Status | Description |
|---|---|
| `400` | Validation error (e.g., `@NotBlank` on name/farmCode, `@NotNull`/`@Positive` on area) |
| `401` | Missing or invalid JWT token |

---

## 8. Product Category APIs

### 8.1 GET /api/v1/product-categories

#### Description

Returns a list of all product categories (loại cây trồng/nông sản).

#### Authentication

**Required.** The endpoint is not in the public paths list; authentication is enforced by `SecurityConfig` (`.anyRequest().authenticated()`).

#### Request Body

None.

#### Success Response

**HTTP Status:** `200`

**Response Body:** `ApiResult<List<ProductCategoryResponse>>`

`ProductCategoryResponse` fields:

| Field | Type | Description |
|---|---|---|
| `id` | `Integer` | Product category unique identifier |
| `name` | `String` | Category display name |
| `code` | `String` | Category code |
| `description` | `String` | Category description |

```json
{
  "success": true,
  "status": 200,
  "data": [
    {
      "id": 1,
      "name": "Lúa",
      "code": "RICE",
      "description": "Sản phẩm lúa gạo"
    },
    {
      "id": 2,
      "name": "Cà phê",
      "code": "COFFEE",
      "description": "Sản phẩm cà phê"
    }
  ],
  "message": null,
  "timestamp": "2026-07-20T03:27:51Z"
}
```

#### Error Responses

| HTTP Status | Description |
|---|---|
| `401` | Missing or invalid JWT token |

---

## 9. Production Lot APIs

### 9.1 POST /api/v1/production-lots

#### Description

Creates a new production lot (lô sản xuất). The organization is derived from the authenticated user's JWT token.

#### Authentication

**Required.** `@PreAuthorize("isAuthenticated()")`

No specific role is required — any authenticated user can access. (The source code comments note that role restrictions like `hasAnyRole('VT-02', 'VT-03')` may be added later.)

#### Request Body

| Field | Type | Required | Validation | Example |
|---|---|---|---|---|
| `farmAreaId` | `UUID` | Yes | `@NotNull` | `"880e8400-e29b-41d4-a716-446655440000"` |
| `description` | `String` | Yes | `@NotBlank`, max 2000 chars | `"Lô sản xuất lúa vụ Đông Xuân 2026"` |

#### Request Example

```json
{
  "farmAreaId": "880e8400-e29b-41d4-a716-446655440000",
  "description": "Lô sản xuất lúa vụ Đông Xuân 2026"
}
```

#### Success Response

**HTTP Status:** `200`

**Response Body:** `ApiResult<CreateProductionLotResponse>`

`CreateProductionLotResponse` fields:

| Field | Type | Description |
|---|---|---|
| `id` | `UUID` | Production lot unique identifier |
| `lotCode` | `String` | Generated lot code |
| `description` | `String` | Lot description |
| `status` | `ProductionLotStatus` | Initial status (typically `DRAFT`) |
| `createdAt` | `String` (ISO 8601) | Creation timestamp |
| `farmArea` | `FarmAreaResponse` | Nested farm area information |

```json
{
  "success": true,
  "status": 200,
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440000",
    "lotCode": "LOT-20260720-0001",
    "description": "Lô sản xuất lúa vụ Đông Xuân 2026",
    "status": "DRAFT",
    "createdAt": "2026-07-20T03:27:51Z",
    "farmArea": {
      "id": "880e8400-e29b-41d4-a716-446655440000",
      "name": "Vùng trồng Lúa số 1",
      "farmCode": "FARM-001",
      "area": 1500.5,
      "productCategoryName": "Lúa"
    }
  },
  "message": null,
  "timestamp": "2026-07-20T03:27:51Z"
}
```

#### Error Responses

| HTTP Status | Description |
|---|---|
| `400` | Validation error (`@NotBlank` on description, `@NotNull` on farmAreaId) |
| `401` | Missing or invalid JWT token |
| `404` | Farm area with given `farmAreaId` not found |

---

## 10. Enums

### 10.1 OrganizationType

Used in: `CreateOrganizationRequest`, `OrganizationResponse`, `OrganizationProfileResponse`, `UserProfileResponse`

| Value | Description |
|---|---|
| `COOPERATIVE` | Hợp tác xã (roles: VT-02, VT-03) — Organization code prefix: TC02 |
| `ENTERPRISE` | Doanh nghiệp (role: VT-04) — Organization code prefix: TC03 |
| `GOVERNMENT` | Cán bộ ngành (role: VT-05) — Organization code prefix: TC04 |
| `SYSTEM` | Tổ chức hệ thống (Admin: VT-01) — Organization code prefix: TC01 |

### 10.2 OrganizationStatus

Used in: `OrganizationResponse`, `OrganizationProfileResponse`

| Value | Description |
|---|---|
| `ACTIVE` | Organization is active |
| `INACTIVE` | Organization is inactive |

### 10.3 OrganizationUserStatus

Used in: `OrganizationUser` entity

| Value | Description |
|---|---|
| `ACTIVE` | User is active within the organization |
| `INACTIVE` | User is inactive within the organization |

### 10.4 ProductionLotStatus

Used in: `CreateProductionLotResponse`, `ProductionLot` entity

| Value | Description |
|---|---|
| `DRAFT` | Draft — initial state |
| `PENDING` | Pending review |
| `APPROVED` | Approved |
| `HARVESTED` | Harvested |
| `PACKAGED` | Packaged |
| `CLOSED` | Closed / completed |

### 10.5 UserStatus

Used in: `User` entity

| Value | Description |
|---|---|
| `ACTIVE` | User account is active |
| `LOCKED` | User account is locked |

---

## 11. API Endpoint Summary

| Method | Endpoint | Authentication | Role | Feature |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Public | — | Authentication |
| `GET` | `/api/v1/auth/me` | Required | Any authenticated | Authentication |
| `POST` | `/api/v1/admin/organizations` | Required | Any authenticated | Organization Management |
| `PUT` | `/api/v1/admin/organizations/profile/{id}` | Required | `VT-01` | Organization Management |
| `POST` | `/api/v1/farm-areas` | Required | Any authenticated | Farm Area Management |
| `GET` | `/api/v1/product-categories` | Required | Any authenticated | Product Category |
| `POST` | `/api/v1/production-lots` | Required | Any authenticated | Production Lot Management |

---

## 12. Frontend Integration Notes

### 12.1 Authentication Flow Implementation

```javascript
// 1. Login
const response = await fetch('http://localhost:8080/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'password123',
    organizationCode: 'SYS'
  })
});

const result = await response.json();
if (result.success) {
  const token = result.data.token;
  localStorage.setItem('accessToken', token);
}

// 2. Use token for subsequent requests
const token = localStorage.getItem('accessToken');
const meResponse = await fetch('http://localhost:8080/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### 12.2 Error Handling Pattern

Always check `response.success` before accessing `response.data`:

```javascript
const response = await fetch(url, options);
const result = await response.json();

if (!result.success) {
  // Handle error — show result.message to user
  console.error(`Error [${result.status}]: ${result.message}`);
  return;
}

// Use result.data safely
const data = result.data;
```

### 12.3 Token Expiration Handling

- Store the `expiresIn` value from the login response.
- Redirect to the login page when the token expires.
- Handle `401` responses globally by redirecting to login:

```javascript
if (response.status === 401) {
  localStorage.removeItem('accessToken');
  window.location.href = '/pages/auth/login.html';
}
```

### 12.4 Validation Error Handling

When the server returns a `400` status with validation errors, the `message` field contains the specific validation failure reason (in Vietnamese). Display this message to the user.

### 12.5 Organization Code Format

Organization codes must match the pattern: `^[A-Z0-9_-]+$` (uppercase letters A-Z, digits 0-9, hyphens, and underscores only). Validate this on the frontend before submitting.

### 12.6 UUID Format

All entity IDs are UUIDs in standard format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` (e.g., `"550e8400-e29b-41d4-a716-446655440000"`).

### 12.7 Coordinate Format

Farm area geographic coordinates (`latitude`, `longitude`) are `double` values. Use standard decimal degree format (e.g., `10.762622`, `106.660172`). The backend uses JTS (Java Topology Suite) `Point` type for spatial data.

---

## 13. DTOs Not Currently Exposed via Controllers

The following DTOs exist in the backend source code but are **not currently exposed** through any controller endpoint. They are documented here for future reference if new endpoints are added:

| DTO | Package |
|---|---|
| `AddMemberRequest` | `vn.nguongocso.auth.dto.request` |
| `AssignRoleRequest` | `vn.nguongocso.auth.dto.request` |
| `OrganizationUserResponse` | `vn.nguongocso.auth.dto.response` |

These DTOs are ready for use but have no corresponding controller methods at this time.

---

*Document generated from backend source code analysis. All information is based on actual source files in the `backend/` directory. No fields, endpoints, or rules were invented.*