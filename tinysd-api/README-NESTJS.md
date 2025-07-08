# NestJS API Migration

This Express.js API has been converted to NestJS with the following improvements:

## Architecture Changes

### 1. **Modular Structure**

- `AppModule` - Main application module
- `DatabaseModule` - Database connection and configuration
- `LogsModule` - Logs feature module
- `ImageModule` - Image generation feature module

### 2. **Controllers**

- `LogsController` - Handles all log-related HTTP requests
- `ImageController` - Handles image generation requests
- Uses decorators: `@Controller()`, `@Get()`, `@Post()`, `@Put()`, `@Delete()`

### 3. **Services**

- `LogsService` - Business logic for log operations
- `ImageService` - Business logic for image generation
- Dependency injection via constructor

### 4. **DTOs (Data Transfer Objects)**

- `CreateLogDto` - Validation for creating logs
- `UpdateLogDto` - Validation for updating logs
- `GenerateImageDto` - Validation for image generation requests

### 5. **Entities**

- `Log` - Log entity class

## Key Features

### Dependency Injection

- Services are injected via constructors
- Database collections are provided globally
- Configuration service for environment variables

### Validation

- Class-validator decorators for request validation
- Automatic validation pipe integration

### Error Handling

- Proper HTTP exceptions with status codes
- Structured error responses

### Configuration

- Environment variables managed via `@nestjs/config`
- Global configuration module

## API Endpoints

### Logs

- `GET /api/logs` - Get all logs
- `GET /api/logs/:id` - Get log by ID
- `POST /api/logs` - Create new log
- `PUT /api/logs/:id` - Update log
- `DELETE /api/logs/:id` - Delete log

### Image Generation

- `POST /api/image/generate` - Generate image from prompt

## Installation

```bash
npm install
```

## Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Environment Variables

```env
DB_CONN_STRING=mongodb://localhost:27017
DB_NAME=tinysd
PORT=3000
```

## Migration Benefits

1. **Type Safety** - Better TypeScript support
2. **Modularity** - Clean separation of concerns
3. **Dependency Injection** - Easier testing and maintainability
4. **Validation** - Built-in request validation
5. **Error Handling** - Consistent error responses
6. **Documentation** - Auto-generated API documentation support
7. **Testing** - Better testing framework integration
