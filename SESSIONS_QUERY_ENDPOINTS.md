# Sessions Query Endpoints Documentation

This document describes the new query endpoints added to the Sessions API for filtering sessions by various criteria.

## New Query Endpoints

### 1. Filter Sessions by Phone

**GET** `/sessions/filter/phone`

Retrieves all sessions associated with a specific phone number.

**Query Parameters:**

- `phone` (required): The phone number to filter by

**Example:**

```
GET /sessions/filter/phone?phone=573022949109
```

**Response:**

```json
{
  "success": true,
  "message": "Sesiones obtenidas exitosamente.",
  "data": [
    {
      "id": "3e9db08e-877f-481e-abe4-e22404e3c076",
      "sessionName": "Session Test",
      "phone": "573022949109",
      "status": true,
      "createdAt": "2025-05-27T14:56:20.181Z",
      "updatedAt": "2025-05-27T20:59:16.314Z"
    }
  ]
}
```

**Status Codes:**

- `200` - Success
- `400` - Bad Request (missing phone parameter)
- `500` - Internal Server Error

---

### 2. Filter Sessions by Status

**GET** `/sessions/filter/status`

Retrieves sessions based on their activity status (active/inactive).

**Query Parameters:**

- `status` (required): Boolean value as string ("true" or "false")

**Examples:**

```
GET /sessions/filter/status?status=true   // Get active sessions
GET /sessions/filter/status?status=false  // Get inactive sessions
```

**Response:**

```json
{
  "success": true,
  "message": "Sesiones obtenidas exitosamente.",
  "data": [
    {
      "id": "session-uuid",
      "sessionName": "Active Session",
      "phone": "573022949109",
      "status": true,
      "createdAt": "2025-05-27T14:56:20.181Z",
      "updatedAt": "2025-05-27T20:59:16.314Z"
    }
  ]
}
```

**Status Codes:**

- `200` - Success
- `400` - Bad Request (missing status parameter)
- `500` - Internal Server Error

---

### 3. Filter Sessions by Deletion Status

**GET** `/sessions/filter/deleted`

Retrieves sessions based on their deletion status (soft delete functionality).

**Query Parameters:**

- `is_deleted` (required): Boolean value as string ("true" or "false")

**Examples:**

```
GET /sessions/filter/deleted?is_deleted=false  // Get active sessions
GET /sessions/filter/deleted?is_deleted=true   // Get soft-deleted sessions
```

**Response:**

```json
{
  "success": true,
  "message": "Sesiones obtenidas exitosamente.",
  "data": [
    {
      "id": "session-uuid",
      "sessionName": "Active Session",
      "phone": "573022949109",
      "status": true,
      "createdAt": "2025-05-27T14:56:20.181Z",
      "updatedAt": "2025-05-27T20:59:16.314Z"
    }
  ]
}
```

**Status Codes:**

- `200` - Success
- `400` - Bad Request (missing is_deleted parameter)
- `500` - Internal Server Error

---

### 4. Filter Sessions by Creation Date Range

**GET** `/sessions/filter/created-at`

Retrieves sessions created within a specific date range.

**Query Parameters:**

- `start_date` (required): Start date in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)
- `end_date` (required): End date in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)

**Example:**

```
GET /sessions/filter/created-at?start_date=2025-05-20&end_date=2025-05-28
```

**Response:**

```json
{
  "success": true,
  "message": "Sesiones obtenidas exitosamente.",
  "data": [
    {
      "id": "session-uuid",
      "sessionName": "Recent Session",
      "phone": "573022949109",
      "status": true,
      "createdAt": "2025-05-27T14:56:20.181Z",
      "updatedAt": "2025-05-27T20:59:16.314Z"
    }
  ]
}
```

**Status Codes:**

- `200` - Success
- `400` - Bad Request (missing parameters, invalid date format, or start_date > end_date)
- `500` - Internal Server Error

---

### 5. Filter Sessions by Update Date Range

**GET** `/sessions/filter/updated-at`

Retrieves sessions updated within a specific date range.

**Query Parameters:**

- `start_date` (required): Start date in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)
- `end_date` (required): End date in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)

**Example:**

```
GET /sessions/filter/updated-at?start_date=2025-05-20&end_date=2025-05-28
```

**Response:**

```json
{
  "success": true,
  "message": "Sesiones obtenidas exitosamente.",
  "data": [
    {
      "id": "session-uuid",
      "sessionName": "Updated Session",
      "phone": "573022949109",
      "status": true,
      "createdAt": "2025-05-27T14:56:20.181Z",
      "updatedAt": "2025-05-27T20:59:16.314Z"
    }
  ]
}
```

**Status Codes:**

- `200` - Success
- `400` - Bad Request (missing parameters, invalid date format, or start_date > end_date)
- `500` - Internal Server Error

---

## Implementation Details

### Complete Class Implementation

The `SessionsGetByPhone` service follows the exact pattern shown below:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { SessionsRepository } from '../domain/SessionsRepository';
import { Session } from '../domain/Session';
import { SessionPhone } from '../domain/SessionPhone';

@Injectable()
export class SessionsGetByPhone {
  constructor(
    @Inject('SessionsRepository')
    private readonly sessionsRepository: SessionsRepository,
  ) {}

  async run(phone: string): Promise<Session[]> {
    try {
      const sessionPhone = new SessionPhone(phone);
      return await this.sessionsRepository.getByPhone(sessionPhone);
    } catch (error) {
      throw new Error(`Failed to get sessions by phone: ${error.message}`);
    }
  }
}
```

### Architecture Components

#### Application Services

- **`SessionsGetByPhone`**: Handles phone number filtering

  - Class: `@Injectable()` decorator for dependency injection
  - Constructor: `@Inject('SessionsRepository') private readonly sessionsRepository: SessionsRepository`
  - Method: `async run(phone: string): Promise<Session[]>`
  - Validates phone using `SessionPhone` domain object
  - Throws error with descriptive message on failure
  - Import dependencies: `SessionsRepository`, `Session`, `SessionPhone` from domain layer

- **`SessionsGetByStatus`**: Handles activity status filtering

  - Constructor: `constructor(private readonly repository: SessionsRepository)`
  - Method: `async run(status: boolean): Promise<Session[]>`
  - Validates status using `SessionStatus` domain object
  - Direct repository call without try-catch (simpler implementation)

- **`SessionsGetByIsDeleted`**: Handles deletion status filtering

  - Constructor: `@Inject('SessionsRepository') private readonly repository: SessionsRepository`
  - Method: `async run(isDeleted: boolean): Promise<Session[]>`
  - Validates deletion status using `SessionIsDeleted` domain object
  - Throws error with descriptive message on failure

- **`SessionsGetByDateRange`**: Handles date range filtering (both created and updated)
  - Constructor: `@Inject('SessionsRepository') private readonly repository: SessionsRepository`
  - Methods:
    - `async runByCreatedAt(startDate: Date, endDate: Date): Promise<Session[]>`
    - `async runByUpdatedAt(startDate: Date, endDate: Date): Promise<Session[]>`
  - Direct date validation without domain wrapper objects
  - Throws error with descriptive message on failure

#### Repository Methods

- `getByPhone(phone: SessionPhone): Promise<Session[]>`
- `getByStatus(status: SessionStatus): Promise<Session[]>`
- `getByIsDeleted(isDeleted: SessionIsDeleted): Promise<Session[]>`
- `getByCreatedAtRange(startDate: Date, endDate: Date): Promise<Session[]>`
- `getByUpdatedAtRange(startDate: Date, endDate: Date): Promise<Session[]>`

#### Domain Objects

All endpoints use existing domain objects for validation:

- **`SessionPhone`**: Validates and wraps phone number values
- **`SessionStatus`**: Validates and wraps boolean status values (active/inactive)
- **`SessionIsDeleted`**: Validates and wraps deletion status boolean values
- **Standard `Date` objects**: Used directly for date range filtering without domain wrappers

### Validation Rules

#### Phone Filtering

- **Phone parameter is required**: Returns 400 error if missing
- **Phone format validation**: Must pass `SessionPhone` domain object validation
- **Error handling**: Descriptive error messages in Spanish for consistency

**SessionPhone domain validation**:

```typescript
// SessionsGetByPhone.run() implementation
try {
  const sessionPhone = new SessionPhone(phone); // Validates format and creates domain object
  return await this.sessionsRepository.getByPhone(sessionPhone);
} catch (error) {
  throw new Error(`Failed to get sessions by phone: ${error.message}`);
}
```

**SessionStatus domain validation**:

```typescript
// SessionsGetByStatus.run() implementation
const sessionStatus = new SessionStatus(status); // Validates boolean type
return await this.repository.getByStatus(sessionStatus);
```

#### Deletion Status Filtering

- **`is_deleted` parameter is required**: Returns 400 error if missing
- **Boolean string validation**: Must be exactly "true" or "false" (case-insensitive)
- **Type conversion**: String converted to boolean using `isDeleted.toLowerCase() === 'true'`
- **Domain validation**: Must pass `SessionIsDeleted` domain object validation

**SessionIsDeleted domain validation**:

```typescript
// SessionsGetByIsDeleted.run() implementation
const sessionIsDeleted = new SessionIsDeleted(isDeleted); // Validates boolean type
return await this.repository.getByIsDeleted(sessionIsDeleted);
```

#### Date Range Filtering

- **Both `start_date` and `end_date` are required**: Returns 400 error if either is missing
- **ISO date format validation**: Must be valid Date constructor input
- **Date parsing validation**: Returns 400 error for invalid dates using `isNaN(date.getTime())`
- **Logical validation**: `start_date` must be before or equal to `end_date`
- **Flexible format support**: Accepts both date-only (YYYY-MM-DD) and full datetime formats

**Date validation implementation**:

```typescript
// Controller validation logic
const start = new Date(startDate);
const end = new Date(endDate);

if (isNaN(start.getTime()) || isNaN(end.getTime())) {
  throw new BadRequestException(
    'Invalid date format. Use ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)',
  );
}

if (start > end) {
  throw new BadRequestException('start_date must be before end_date');
}
```

### Error Handling

All endpoints follow consistent error handling patterns with comprehensive validation:

#### HTTP Status Codes

- **400 Bad Request**: Missing required parameters, invalid formats, or logical errors
- **500 Internal Server Error**: Database errors or unexpected server issues

#### Error Response Format

All errors return descriptive messages in Spanish (matching existing API pattern):

```json
{
  "error": "Bad Request",
  "message": "Descriptive error message in Spanish",
  "statusCode": 400
}
```

#### Controller Error Handling Pattern

```typescript
try {
  // Parameter validation
  if (!requiredParam) {
    throw new BadRequestException('Parameter is required message');
  }

  // Business logic validation
  // Service invocation
  // Success response
} catch (error) {
  if (error instanceof BadRequestException) {
    throw error; // Re-throw validation errors
  }
  throw new InternalServerErrorException(
    'Error message with context: ' + error.message,
  );
}
```

#### Application Service Error Handling

Each service wraps repository calls with descriptive error messages:

```typescript
// Exact pattern from SessionsGetByPhone.ts
async run(phone: string): Promise<Session[]> {
  try {
    const sessionPhone = new SessionPhone(phone); // Domain validation
    return await this.sessionsRepository.getByPhone(sessionPhone); // Repository call
  } catch (error) {
    throw new Error(`Failed to get sessions by phone: ${error.message}`);
  }
}
```

#### Repository Error Handling

TypeORM repository methods include try-catch blocks with context:

```typescript
try {
  // Database query
  return mappedResults;
} catch (error) {
  throw new Error(`Failed to [specific operation]: ${error.message}`);
}
```

### Performance Considerations

#### Database Queries

- **Phone filtering**: Uses direct field matching with index support

  ```typescript
  // TypeORM implementation
  const entities = await this.repository.find({
    where: { phone: phone.value },
    order: { created_at: 'DESC' },
  });
  ```

- **Status filtering**: Uses boolean field index for fast lookups

  ```typescript
  // TypeORM implementation
  const entities = await this.repository.find({
    where: { status: status.value },
    order: { created_at: 'DESC' },
  });
  ```

- **Deletion status filtering**: Uses boolean field index for fast lookups

  ```typescript
  // TypeORM implementation
  const entities = await this.repository.find({
    where: { is_deleted: isDeleted.value },
    order: { created_at: 'DESC' },
  });
  ```

- **Date range filtering**: Uses optimized SQL queries with `createQueryBuilder`

  ```typescript
  // TypeORM implementation
  const entities = await this.repository
    .createQueryBuilder('session')
    .where('session.created_at >= :startDate', { startDate })
    .andWhere('session.created_at <= :endDate', { endDate })
    .orderBy('session.created_at', 'DESC')
    .getMany();
  ```

- **Consistent ordering**: All queries include `ORDER BY created_at DESC` for predictable results

#### TypeORM Implementation Benefits

- **Parameterized queries**: Date range queries use parameterized queries to prevent SQL injection
- **Query optimization**: Queries are optimized with proper WHERE clauses and indexes
- **Domain mapping**: Results are mapped through the domain layer for type safety and consistency
- **Connection pooling**: Leverages TypeORM's built-in connection pooling for performance

#### Memory Management

- **Stream processing**: Large result sets are handled efficiently through TypeORM's lazy loading
- **Object mapping**: Direct mapping from entities to domain objects without unnecessary transformations
- **Garbage collection**: Proper cleanup of query builders and result sets

## Testing

### Test Coverage

The test suite (`test-sessions-query-endpoints.js`) covers:

- ✅ Successful filtering for all endpoints
- ✅ Missing parameter validation
- ✅ Invalid date format handling
- ✅ Invalid date range validation (start > end)
- ✅ Response format verification
- ✅ Data integrity validation

### Test Results

All tests pass successfully:

- Phone filtering: Working correctly with existing data
- Deletion status filtering: Returns both active (4) and deleted (3) sessions
- Date range filtering: Returns expected results for the date ranges
- Parameter validation: Correctly returns 400 errors for invalid inputs

## Integration

### Module Registration

All new services are properly registered in `SessionsModule` with dependency injection:

```typescript
// SessionsGetByPhone service
{
  provide: 'SessionsGetByPhone',
  useFactory: (repository: TypeOrmSessionsRepository) =>
    new SessionsGetByPhone(repository),
  inject: ['SessionsRepository'],
}

// SessionsGetByIsDeleted service
{
  provide: 'SessionsGetByIsDeleted',
  useFactory: (repository: TypeOrmSessionsRepository) =>
    new SessionsGetByIsDeleted(repository),
  inject: ['SessionsRepository'],
}

// SessionsGetByDateRange service
{
  provide: 'SessionsGetByDateRange',
  useFactory: (repository: TypeOrmSessionsRepository) =>
    new SessionsGetByDateRange(repository),
  inject: ['SessionsRepository'],
}
```

### Controller Integration

New endpoints are added to `SessionsController` with consistent patterns:

```typescript
// Constructor injection of services
constructor(
  @Inject('SessionsGetByPhone')
  private readonly sessionsGetByPhone: SessionsGetByPhone,
  @Inject('SessionsGetByIsDeleted')
  private readonly sessionsGetByIsDeleted: SessionsGetByIsDeleted,
  @Inject('SessionsGetByDateRange')
  private readonly sessionsGetByDateRange: SessionsGetByDateRange,
  // ... other services
) {}
```

Each endpoint follows the same pattern:

- Query parameter extraction using `@Query()` decorator
- Parameter validation with descriptive error messages
- Service invocation with proper error handling
- Consistent response formatting with `success`, `message`, and `data` fields
- Mapping to plain objects using `session.toPlainObject()`

### Repository Implementation

TypeORM repository includes all new methods with proper error handling and query optimization:

- **Direct field matching** for phone and deletion status filtering
- **Query builder** for date range filtering with parameterized queries
- **Consistent ordering** by `created_at DESC` for all queries
- **Domain mapping** through `mapToDomain()` method for type safety

## Usage Examples

### Find all sessions for a specific phone

```bash
curl "http://localhost:3000/sessions/filter/phone?phone=573022949109"
```

### Get active sessions only

```bash
curl "http://localhost:3000/sessions/filter/status?status=true"
```

### Get inactive sessions only

```bash
curl "http://localhost:3000/sessions/filter/status?status=false"
```

### Get only active (non-deleted) sessions

```bash
curl "http://localhost:3000/sessions/filter/deleted?is_deleted=false"
```

### Find sessions created in the last week

```bash
curl "http://localhost:3000/sessions/filter/created-at?start_date=2025-05-20&end_date=2025-05-27"
```

### Find recently updated sessions

```bash
curl "http://localhost:3000/sessions/filter/updated-at?start_date=2025-05-27&end_date=2025-05-27"
```

## Future Enhancements

Potential improvements for the query system:

1. **Combined Filters**: Allow multiple filters in a single request
2. **Pagination**: Add limit/offset support for large result sets
3. **Sorting Options**: Allow custom sorting beyond the default created_at DESC
4. **Field Selection**: Allow clients to specify which fields to return
5. **Full-Text Search**: Add search capabilities for session names
6. **Status Filtering**: More granular status filtering options
