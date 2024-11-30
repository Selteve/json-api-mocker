# JSON API Mocker Configuration Guide

A comprehensive guide to help you understand and write the `data.json` configuration file.

## Configuration Structure

```json
{
  "server": {
    "port": 8080,
    "baseProxy": "/api"
  },
  "routes": []
}
```

## Configuration Details

### 1. Server Configuration (server)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| port | number | No | 8080 | Server port number |
| baseProxy | string | No | "/api" | Base path for all APIs |

### 2. Routes Configuration (routes)

Routes is an array where each element is a route configuration object:

```json
{
  "path": "/users",
  "methods": {
    "get": {},
    "post": {},
    "put": {},
    "delete": {}
  }
}
```

#### 2.1 Route Basic Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| path | string | Yes | Route path, supports parameters like `/users/:id` |
| methods | object | Yes | HTTP methods configuration object |

#### 2.2 Method Configuration (methods)

Each HTTP method can include the following configurations:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | No | Response type: "array" or "object" |
| response | any | No | Static response data |
| mock | object | No | Mock.js configuration |
| pagination | object | No | Pagination configuration |
| requestSchema | object | No | Request body validation schema |

### 3. Mock Data Configuration (mock)

```json
{
  "mock": {
    "enabled": true,
    "total": 100,
    "template": {
      "id|+1": 1,
      "name": "@name",
      "email": "@email"
    }
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| enabled | boolean | Yes | Enable/disable mock data |
| total | number | Yes | Total number of records to generate |
| template | object | Yes | Mock.js data template |

### 4. Pagination Configuration (pagination)

```json
{
  "pagination": {
    "enabled": true,
    "pageSize": 10
  }
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| enabled | boolean | No | false | Enable/disable pagination |
| pageSize | number | No | 10 | Number of items per page |

### 5. Request Validation Configuration (requestSchema)

```json
{
  "requestSchema": {
    "name": "string",
    "age": "number",
    "email": "string"
  }
}
```

### 6. File Upload Configuration

You can configure file upload endpoints in your `data.json`:

```json
{
  "path": "/upload/avatar",
  "methods": {
    "post": {
      "type": "object",
      "mock": {
        "enabled": true,
        "template": {
          "success": true,
          "message": "Upload successful",
          "data": {
            "url": "@image('200x200')",
            "filename": "@string(10).jpg",
            "size": "@integer(1000, 1000000)"
          }
        }
      }
    }
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | Must be "object" for file uploads |
| mock.enabled | boolean | Yes | Enable mock response |
| mock.template | object | Yes | Response template using Mock.js syntax |

## Complete Configuration Examples

### 1. Basic User CRUD API

```json
{
  "server": {
    "port": 8080,
    "baseProxy": "/api"
  },
  "routes": [
    {
      "path": "/users",
      "methods": {
        "get": {
          "type": "array",
          "mock": {
            "enabled": true,
            "total": 100,
            "template": {
              "id|+1": 1,
              "name": "@name",
              "age|18-60": 1,
              "email": "@email",
              "address": "@city"
            }
          },
          "pagination": {
            "enabled": true,
            "pageSize": 10
          }
        },
        "post": {
          "requestSchema": {
            "name": "string",
            "age": "number",
            "email": "string"
          },
          "response": {
            "success": true,
            "message": "Created successfully"
          }
        }
      }
    }
  ]
}
```

### 2. Articles API with Nested Data

```json
{
  "path": "/articles",
  "methods": {
    "get": {
      "type": "array",
      "mock": {
        "enabled": true,
        "total": 50,
        "template": {
          "id|+1": 1,
          "title": "@title",
          "content": "@paragraph",
          "author": {
            "id|+1": 100,
            "name": "@name",
            "avatar": "@image('100x100')"
          },
          "comments|0-10": [{
            "id|+1": 1,
            "content": "@sentence",
            "user": "@name",
            "createTime": "@datetime"
          }]
        }
      }
    }
  }
}
```

### 3. Dynamic Route Parameters Example

```json
{
  "path": "/users/:id/posts",
  "methods": {
    "get": {
      "type": "array",
      "mock": {
        "enabled": true,
        "total": 10,
        "template": {
          "id|+1": 1,
          "title": "@title",
          "content": "@paragraph"
        }
      }
    }
  }
}
```

## Important Notes

1. **Route Parameters**
   - Dynamic route parameters use `:paramName` format
   - Example: `/users/:id/posts/:postId`

2. **Mock Data**
   - Mock data generation only works when `enabled` is `true`
   - `template` supports all Mock.js syntax

3. **Pagination**
   - When enabled, use `?page=1&pageSize=10` to access paginated data
   - Response headers include `X-Total-Count` for total count

4. **Data Persistence**
   - POST, PUT, DELETE operations automatically save to data.json
   - Data persists after server restart

## Best Practices

1. **Effective Use of Mock Data**
   ```json
   {
     "mock": {
       "enabled": true,
       "total": 100,
       "template": {
         // Use auto-increment for IDs
         "id|+1": 1,
         // Use appropriate data types
         "age|18-60": 1
       }
     }
   }
   ```

2. **Proper Pagination Settings**
   ```json
   {
     "pagination": {
       "enabled": true,
       "pageSize": 10  // Set appropriate page size based on data volume
     }
   }
   ```

3. **Request Validation**
   ```json
   {
     "requestSchema": {
       // Ensure all required fields have type validation
       "name": "string",
       "age": "number",
       "email": "string"
    }
  }
```

### WebSocket Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| enabled | boolean | Yes | Enable/disable WebSocket support |
| path | string | Yes | WebSocket endpoint path |
| events | object | No | Event configurations |

#### Event Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| mock.enabled | boolean | Yes | Enable/disable mock data for this event |
| mock.interval | number | No | Interval (ms) for automatic data sending |
| mock.template | object | Yes | Mock.js template for response data |

Example:
```json
{
  "websocket": {
    "enabled": true,
    "path": "/ws",
    "events": {
      "event-name": {
        "mock": {
          "enabled": true,
          "interval": 5000,
          "template": {
            "field1": "@value",
            "field2|1-100": 1
          }
        }
      }
    }
  }
}
```
