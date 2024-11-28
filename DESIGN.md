# JSON API Mocker 设计思路文档

## 1. 项目架构设计

### 1.1 核心模块划分
```
src/
├── types.ts      # 类型定义
├── server.ts     # 服务器核心逻辑
├── index.ts      # 入口文件
└── cli.ts        # 命令行工具
```

### 1.2 设计原则
- **配置驱动**: 通过 JSON 配置文件定义 API，而不是代码
- **约定优于配置**: 提供合理的默认值，减少配置复杂度
- **单一职责**: 每个模块只负责一个功能
- **开闭原则**: 扩展开放，修改关闭

## 2. 关键技术决策

### 2.1 为什么选择 JSON 配置文件
- **优点**:
  - 零代码门槛
  - 配置直观易读
  - 方便版本控制
  - 易于修改和共享
- **缺点**:
  - 灵活性相对较低
  - 不支持复杂逻辑

### 2.2 为什么选择文件系统而不是数据库
- **优点**:
  - 无需额外依赖
  - 配置即数据，直观明了
  - 方便迁移和备份
- **缺点**:
  - 并发性能较差
  - 不适合大规模数据

### 2.3 为什么使用 TypeScript
- 类型安全
- 更好的开发体验
- 自动生成类型声明文件
- 便于维护和重构

## 3. 核心功能实现

### 3.1 路由系统设计
```typescript
interface RouteConfig {
  path: string;
  methods: {
    [key: string]: MethodConfig;
  };
}

// 支持 RESTful API 的标准方法
type HttpMethod = 'get' | 'post' | 'put' | 'delete';
```

### 3.2 数据持久化方案
```typescript
class MockServer {
  private saveConfig() {
    // 同步写入确保数据一致性
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }
}
```

### 3.3 分页实现
```typescript
interface PaginationConfig {
  enabled: boolean;
  pageSize: number;
  totalCount: number;
}

// 分页处理逻辑
const handlePagination = (data: any[], page: number, pageSize: number) => {
  const start = (page - 1) * pageSize;
  return data.slice(start, start + pageSize);
};
```

## 4. 问题解决方案

### 4.1 并发写入问题
- **问题**: 多个请求同时修改配置文件可能导致数据不一致
- **解决方案**:
  1. 使用同步写入
  2. 考虑添加文件锁
  3. 实现写入队列

### 4.2 动态路由参数
- **问题**: 如何支持 `/users/:id` 这样的动态路径
- **解决方案**:
  ```typescript
  // 使用 Express 的路由参数功能
  app.get(`${baseProxy}${path}/:id`, (req, res) => {
    const id = req.params.id;
    // 处理逻辑
  });
  ```

### 4.3 类型安全
- **问题**: 如何确保运行时类型安全
- **解决方案**:
  ```typescript
  // 请求体验证
  interface RequestSchema {
    [key: string]: 'string' | 'number' | 'boolean';
  }
  
  const validateRequest = (body: any, schema: RequestSchema) => {
    // 实现验证逻辑
  };
  ```

## 5. 性能优化

### 5.1 当前实现
- 同步文件操作
- 内存中保存配置副本
- 简单的错误处理

### 5.2 可能的优化方向
1. **缓存优化**
   ```typescript
   class Cache {
     private static instance: Cache;
     private store: Map<string, any>;
     
     public get(key: string) {
       return this.store.get(key);
     }
   }
   ```

2. **并发处理**
   ```typescript
   class WriteQueue {
     private queue: Array<() => Promise<void>>;
     
     public async add(task: () => Promise<void>) {
       this.queue.push(task);
       await this.process();
     }
   }
   ```

## 6. 扩展性设计

### 6.1 中间件支持
```typescript
interface ServerConfig {
  middleware?: {
    before?: Function[];
    after?: Function[];
  };
}
```

### 6.2 自定义响应处理
```typescript
interface MethodConfig {
  transform?: (data: any) => any;
  headers?: Record<string, string>;
}
```

## 7. 未来规划

### 7.1 短期目标
- ✅ 添加请求日志 (Completed in v1.2.0)
- ✅ 支持文件上传 (Completed in v1.2.5)
- ✅ 添加测试用例 (Completed in v1.2.6)

### 7.2 长期目标
- 提供 Web 界面
- 支持 WebSocket
- 支持数据库存储
- 支持集群部署

## 8. 最佳实践

### 8.1 配置文件组织
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
        "get": { ... },
        "post": { ... }
      }
    }
  ]
}
```

### 8.2 错误处理
```typescript
class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

const errorHandler = (err: Error, req: Request, res: Response) => {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message });
  }
};
```

## 9. 总结

本项目的核心是通过配置驱动的方式简化 Mock 服务器的搭建过程。虽然在性能和功能上有一些限制，但对于前端开发中的 Mock 需求来说是一个很好的解决方案。通过合理的模块划分和接口设计，我们既保证了代码的可维护性，也为未来的功能扩展留下了空间。 