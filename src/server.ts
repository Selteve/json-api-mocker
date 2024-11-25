import Mock from 'mockjs';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { Config, MethodConfig } from './types';

export class MockServer {
  private app = express();
  private config: Config;
  private configPath: string;

  constructor(config: Config, configPath: string = 'data.json') {
    this.config = config;
    this.configPath = configPath;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private generateMockData(config: MethodConfig) {
    try {
      if (config.mock?.enabled && config.mock.template) {
        const { total, template } = config.mock;
        return Mock.mock({
          [`data|${total}`]: [template]
        }).data;
      }
      return config.response;
    } catch (error) {
      console.error('生成 Mock 数据时出错:', error);
      return config.response;
    }
  }

  private handleRequest(config: MethodConfig) {
    return (req: Request, res: Response) => {
      try {
        console.log(`收到请求: ${req.method} ${req.url}`);
        
        let responseData = this.generateMockData(config);

        if (config.pagination?.enabled && Array.isArray(responseData)) {
          const page = parseInt(req.query.page as string) || 1;
          const pageSize = parseInt(req.query.pageSize as string) || config.pagination.pageSize;
          const startIndex = (page - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          
          const paginatedData = responseData.slice(startIndex, endIndex);
          
          res.header('X-Total-Count', responseData.length.toString());
          responseData = paginatedData;
        }

        res.json(responseData);
      } catch (error) {
        console.error('处理请求时出错:', error);
        res.status(500).json({ error: '服务器内部错误' });
      }
    };
  }

  private setupRoutes() {
    this.config.routes.forEach((route) => {
      Object.entries(route.methods).forEach(([method, methodConfig]) => {
        this.createRoute(route.path, method, methodConfig);
      });
    });
  }

  private createRoute(path: string, method: string, config: MethodConfig) {
    const fullPath = `${this.config.server.baseProxy}${path}`;
    console.log(`创建路由: ${method.toUpperCase()} ${fullPath}`);
    
    switch (method.toLowerCase()) {
      case 'get':
        this.app.get(fullPath, this.handleRequest(config));
        break;
      case 'post':
        this.app.post(fullPath, this.handleRequest(config));
        break;
      case 'put':
        this.app.put(`${fullPath}/:id`, this.handleRequest(config));
        break;
      case 'delete':
        this.app.delete(`${fullPath}/:id`, this.handleRequest(config));
        break;
    }
  }

  public start() {
    this.app.listen(this.config.server.port, () => {
      console.log(`Mock 服务器已启动:`);
      console.log(`- 地址: http://localhost:${this.config.server.port}`);
      console.log(`- 基础路径: ${this.config.server.baseProxy}`);
      console.log('可用的接口:');
      this.config.routes.forEach(route => {
        Object.keys(route.methods).forEach(method => {
          console.log(`  ${method.toUpperCase()} http://localhost:${this.config.server.port}${this.config.server.baseProxy}${route.path}`);
        });
      });
    });
  }
} 