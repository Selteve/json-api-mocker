# JSON API Mocker 配置指南

本文档将帮助你理解和编写 `data.json` 配置文件。

## 配置文件结构

```json
{
  "server": {
    "port": 8080,
    "baseProxy": "/api"
  },
  "routes": []
}
```

## 配置项详解

### 1. 服务器配置 (server)

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| port | number | 否 | 8080 | 服务器端口号 |
| baseProxy | string | 否 | "/api" | API 的基础路径 |

### 2. 路由配置 (routes)

routes 是一个数组，每个元素都是一个路由配置对象：

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

#### 2.1 路由基础配置

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| path | string | 是 | 路由路径，支持参数如 `/users/:id` |
| methods | object | 是 | HTTP 方法配置对象 |

#### 2.2 方法配置 (methods)

每个 HTTP 方法可以包含以下配置：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | 响应类型："array" 或 "object" |
| response | any | 否 | 静态响应数据 |
| mock | object | 否 | Mock.js 配置 |
| pagination | object | 否 | 分页配置 |
| requestSchema | object | 否 | 请求体验证模式 |

### 3. Mock 数据配置 (mock)

```json
{
  "mock": {
    "enabled": true,
    "total": 100,
    "template": {
      "id|+1": 1,
      "name": "@cname",
      "email": "@email"
    }
  }
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| enabled | boolean | 是 | 是否启用 mock 数据 |
| total | number | 是 | 生成数据的总条数 |
| template | object | 是 | Mock.js 的数据模板 |

### 4. 分页配置 (pagination)

```json
{
  "pagination": {
    "enabled": true,
    "pageSize": 10
  }
}
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| enabled | boolean | 否 | false | 是否启用分页 |
| pageSize | number | 否 | 10 | 每页数据条数 |

### 5. 请求验证配置 (requestSchema)

```json
{
  "requestSchema": {
    "name": "string",
    "age": "number",
    "email": "string"
  }
}
```

### 6. 文件上传配置

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

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 文件上传必须为 "object" |
| mock.enabled | boolean | 是 | 启用模拟响应 |
| mock.template | object | 是 | 使用 Mock.js 语法的响应模板 |

## 完整配置示例

### 1. 用户管理接口

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
              "name": "@cname",
              "age|18-60": 1,
              "email": "@email",
              "address": "@city(true)"
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
            "message": "创建成功"
          }
        }
      }
    }
  ]
}
```

### 2. 文章管理接口（带嵌套数据）

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
          "title": "@ctitle",
          "content": "@cparagraph",
          "author": {
            "id|+1": 100,
            "name": "@cname",
            "avatar": "@image('100x100')"
          },
          "comments|0-10": [{
            "id|+1": 1,
            "content": "@csentence",
            "user": "@cname",
            "createTime": "@datetime"
          }]
        }
      }
    }
  }
}
```

## 使用技巧

### 1. 动态路由参数
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
          "title": "@ctitle",
          "content": "@cparagraph"
        }
      }
    }
  }
}
```

### 2. 分页查询
```bash
# 获取第二页，每页10条数据
curl http://localhost:8080/api/users?page=2&pageSize=10
```

### 3. 数据范围生成
```json
{
  "template": {
    "age|18-60": 1,        // 生成18-60之间的数字
    "score|1-100.1": 1,    // 生成1-100之间的浮点数，保留1位小数
    "items|1-5": ["item"]  // 生成1-5个重复项
  }
}
```

## 注意事项

1. **路径参数**
   - 动态路由参数使用 `:参数名` 格式
   - 例如：`/users/:id/posts/:postId`

2. **Mock 数据**
   - `enabled` 为 `true` 时才会生成 mock 数据
   - `template` 中可以使用所有 Mock.js 支持的语法

3. **分页**
   - 启用分页后，可通过 `?page=1&pageSize=10` 访问分页数据
   - 响应头会包含 `X-Total-Count` 表示总数据量

4. **数据持久化**
   - POST、PUT、DELETE 操作会自动保存到 data.json 文件
   - 重启服务器后数据仍然保留

## 最佳实践

1. **合理使用 Mock 数据**
   ```json
   {
     "mock": {
       "enabled": true,
       "total": 100,
       "template": {
         // 使用自增ID避免重复
         "id|+1": 1,
         // 使用合适的数据类型
         "age|18-60": 1
       }
     }
   }
   ```

2. **适当的分页配置**
   ```json
   {
     "pagination": {
       "enabled": true,
       "pageSize": 10  // 根据数据量设置合适的页大小
     }
   }
   ```

3. **请求验证**
   ```json
   {
     "requestSchema": {
       // 确保必要的字段都有类型验证
       "name": "string",
       "age": "number",
       "email": "string"
     }
   }
   ```
