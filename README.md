# JSON API Mocker

A lightweight and flexible mock server that uses JSON configuration to quickly create RESTful APIs.

<p align="center">
  <img src="https://img.shields.io/npm/v/json-api-mocker" alt="npm version" />
  <img src="https://img.shields.io/npm/l/json-api-mocker" alt="license" />
  <img src="https://img.shields.io/npm/dt/json-api-mocker" alt="downloads" />
</p>

## ✨ Features

- 🚀 Quick setup with JSON configuration
- 🔄 Support for GET, POST, PUT, DELETE methods
- 📝 Automatic data persistence
- 🔍 Built-in pagination support
- 🛠 Customizable response schemas
- 🎭 Integration with Mock.js for powerful data mocking
- 📤 File upload support
- 💡 TypeScript support

## 📦 Installation

```bash
# Using npm
npm install json-api-mocker

# Using yarn
yarn add json-api-mocker

# Using pnpm
pnpm add json-api-mocker
```

## 🚀 Quick Start

### 1. Create Configuration File

Create a `data.json` file in your project root:

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
          "pagination": {
            "enabled": true,
            "pageSize": 10,
            "totalCount": 100
          },
          "response": [
            {
              "id": 1,
              "name": "John",
              "age": 30,
              "city": "New York"
            }
          ]
        }
      }
    },
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
  ]
}
```

### 2. Start the Server

There are several ways to start the mock server:

```bash
# Method 1: Using npx (Recommended)
npx json-api-mocker

# Method 2: Using npx with a custom config file
npx json-api-mocker ./custom-config.json

# Method 3: If installed globally
json-api-mocker

# Method 4: If installed as a project dependency
# Add this to your package.json scripts:
{
  "scripts": {
    "mock": "json-api-mocker"
  }
}
# Then run:
npm run mock
```

Now your mock server is running at `http://localhost:8080`!

You'll see output like this:
```bash
Mock Server is running:
- Address: http://localhost:8080
- Base Path: /api
Available APIs:
  GET http://localhost:8080/api/users
  POST http://localhost:8080/api/users
  POST http://localhost:8080/api/upload/avatar
```

## 📖 Configuration Guide

### Server Configuration

The `server` section configures basic server settings:

```json
{
  "server": {
    "port": 8080,      // Server port number
    "baseProxy": "/api" // Base path for all routes
  }
}
```

### Route Configuration

Each route can support multiple HTTP methods:

```json
{
  "path": "/users",    // Route path
  "methods": {
    "get": {
      "type": "array", // Response type: "array" or "object"
      "pagination": {  // Optional pagination settings
        "enabled": true,
        "pageSize": 10,
        "totalCount": 100
      },
      "response": []   // Response data
    },
    "post": {
      "requestSchema": {  // Request body validation schema
        "name": "string",
        "age": "number"
      },
      "response": {
        "success": true
      }
    }
  }
}
```

### File Upload Support

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

#### Example Usage:

```bash
# Upload single file
curl -X POST http://localhost:8080/api/upload/avatar \
  -H "Content-Type: multipart/form-data" \
  -F "avatar=@/path/to/your/image.jpg"

# Upload multiple files
curl -X POST http://localhost:8080/api/upload/images \
  -H "Content-Type: multipart/form-data" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

For detailed configuration options, please refer to [CONFIG.md](./CONFIG.md#file-upload-configuration).

## 🎯 API Examples

### Basic CRUD Operations

#### Get Users List
```bash
curl http://localhost:8080/api/users
```

#### Get Single User
```bash
curl http://localhost:8080/api/users/1
```

#### Create User
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","age":25,"city":"Boston"}'
```

#### Update User
```bash
curl -X PUT http://localhost:8080/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","age":26,"city":"Boston"}'
```

#### Delete User
```bash
curl -X DELETE http://localhost:8080/api/users/1
```

### Advanced Usage

#### Pagination
```bash
# Get page 2 with 10 items per page
curl http://localhost:8080/api/users?page=2&pageSize=10
```

#### Custom Response Headers
The server automatically adds these headers:
- `X-Total-Count`: Total number of items (for paginated responses)

## 🔧 Advanced Configuration

### Dynamic Routes

You can use URL parameters in routes:

```json
{
  "path": "/users/:id/posts",
  "methods": {
    "get": {
      "type": "array",
      "response": []
    }
  }
}
```

### Request Validation

Add schema validation for POST/PUT requests:

```json
{
  "requestSchema": {
    "name": "string",
    "age": "number",
    "email": "string"
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT © [Xiong Haiyin]

## 🙏 Acknowledgments

- Express.js for the excellent web framework
- All our contributors and users