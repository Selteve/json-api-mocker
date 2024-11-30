# JSON API Mocker

一个轻量级且灵活的 Mock 服务器，通过 JSON 配置快速创建 RESTful API。

<p align="center">
  <img src="https://img.shields.io/npm/v/json-api-mocker" alt="npm 版本" />
  <img src="https://img.shields.io/npm/l/json-api-mocker" alt="许可证" />
  <img src="https://img.shields.io/npm/dt/json-api-mocker" alt="下载量" />
</p>

## ✨ 特性

- 🚀 通过 JSON 配置快速搭建
- 🔄 支持 GET、POST、PUT、DELETE 方法
- 📝 自动数据持久化
- 🔍 内置分页支持
- 🛠 可自定义响应结构
- 🎭 集成 Mock.js 实现强大的数据模拟
- 📤 支持文件上传
- 🔌 支持 WebSocket 实时通信
- 💡 TypeScript 支持

## 📦 安装

```bash
# 使用 npm
npm install json-api-mocker

# 使用 yarn
yarn add json-api-mocker

# 使用 pnpm
pnpm add json-api-mocker
```

## 🚀 快速开始

### 1. 创建配置文件

在项目根目录创建 `data.json` 文件：

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
              "name": "张三",
              "age": 30,
              "city": "北京"
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
              "message": "上传成功",
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

### 2. 启动服务器

有多种方式可以启动 Mock 服务器：

```bash
# 方式一：使用 npx（推荐）
npx json-api-mocker

# 方式二：使用 npx 并指定配置文件
npx json-api-mocker ./custom-config.json

# 方式三：如果全局安装了包
json-api-mocker

# 方式四：如果作为项目依赖安装
# 在 package.json 的 scripts 中添加：
{
  "scripts": {
    "mock": "json-api-mocker"
  }
}
# 然后运行：
npm run mock
```

现在你的 Mock 服务器已经在 `http://localhost:8080` 运行了！

你会看到类似这样的输出：
```bash
Mock 服务器已启动：
- 地址：http://localhost:8080
- 基础路径：/api
可用的接口：
  GET http://localhost:8080/api/users
  POST http://localhost:8080/api/users
  POST http://localhost:8080/api/upload/avatar
```

## 📖 配置指南

详细配置请参考 [CONFIG.ch.md](./CONFIG.ch.md)。

### 服务器配置

`server` 部分配置基本的服务器设置：

```json
{
  "server": {
    "port": 8080,      // 服务器端口号
    "baseProxy": "/api" // 所有路由的基础路径
  }
}
```

### 路由配置

每个路由可以支持多个 HTTP 方法：

```json
{
  "path": "/users",    // 路由路径
  "methods": {
    "get": {
      "type": "array", // 响应类型：array 或 object
      "pagination": {  // 可选的分页设置
        "enabled": true,
        "pageSize": 10,
        "totalCount": 100
      },
      "response": []   // 响应数据
    },
    "post": {
      "requestSchema": {  // 请求体验证模式
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

### 文件上传支持

你可以在 `data.json` 中配置文件上传接口：

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
          "message": "上传成功",
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

#### 使用示例：

```bash
# 上传单个文件
curl -X POST http://localhost:8080/api/upload/avatar \
  -H "Content-Type: multipart/form-data" \
  -F "avatar=@/path/to/your/image.jpg"

# 上传多个文件
curl -X POST http://localhost:8080/api/upload/images \
  -H "Content-Type: multipart/form-data" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

详细配置选项请参考 [CONFIG.ch.md](./CONFIG.ch.md#文件上传配置)。

## 🎯 API 示例

### 基本的 CRUD 操作

#### 获取用户列表
```bash
curl http://localhost:8080/api/users
```

#### 获取单个用户
```bash
curl http://localhost:8080/api/users/1
```

#### 创建用户
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"李四","age":25,"city":"上海"}'
```

#### 更新用户
```bash
curl -X PUT http://localhost:8080/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"李四","age":26,"city":"上海"}'
```

#### 删除用户
```bash
curl -X DELETE http://localhost:8080/api/users/1
```

### 高级用法

#### 分页
```bash
# 获取第2页，每页10条数据
curl http://localhost:8080/api/users?page=2&pageSize=10
```

#### 自定义响应头
服务器自动添加以下响应头：
- `X-Total-Count`：数据总条数（用于分页响应）

## 🔧 高级配置

### 动态路由

你可以在路由中使用 URL 参数：

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

### 请求验证

为 POST/PUT 请求添加模式验证：

```json
{
  "requestSchema": {
    "name": "string",
    "age": "number",
    "email": "string"
  }
}
```

### WebSocket 支持

你可以在 `data.json` 中配置 WebSocket 接口：

```json
{
  "websocket": {
    "enabled": true,
    "path": "/ws",
    "events": {
      "realtime-data": {
        "mock": {
          "enabled": true,
          "interval": 5000,  // 每5秒发送一次数据
          "template": {
            "timestamp": "@datetime",
            "value|1-100": 1,
            "status|1": ["normal", "warning", "error"]
          }
        }
      },
      "user-status": {
        "mock": {
          "enabled": true,
          "template": {
            "userId|+1": 1,
            "status|1": ["online", "offline", "away"],
            "lastActive": "@datetime"
          }
        }
      }
    }
  }
}
```

#### 客户端使用示例：

```javascript
// 连接 WebSocket 服务器
const ws = new WebSocket('ws://localhost:8080/ws');

// 处理连接打开
ws.onopen = () => {
  console.log('已连接到 WebSocket 服务器');
  
  // 请求实时数据
  ws.send(JSON.stringify({
    event: 'realtime-data'
  }));
};

// 处理接收到的消息
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('收到数据:', data);
  // {
  //   event: 'realtime-data',
  //   data: {
  //     timestamp: '2024-01-01 12:00:00',
  //     value: 75,
  //     status: 'normal'
  //   }
  // }
};

// 处理错误
ws.onerror = (error) => {
  console.error('WebSocket 错误:', error);
};

// 处理连接关闭
ws.onclose = () => {
  console.log('与 WebSocket 服务器断开连接');
};
```

#### 特性：
- 基于事件的通信
- 支持指定间隔自动发送数据
- 支持 Mock.js 模板生成动态数据
- 支持多个事件处理器

## 🤝 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的改动 (`git commit -m '添加一些很棒的特性'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个 Pull Request

## 📄 许可证

MIT © [熊海银]

## 🙏 致谢

- 感谢 Express.js 提供出色的 Web 框架
- 感谢所有贡献者和用户