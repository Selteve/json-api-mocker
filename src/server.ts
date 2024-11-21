import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { Config, MethodConfig } from './types';

export class MockServer {
  private app = express();
  private config: Config;
  private configPath: string;

  constructor(config: Config, configPath: string = 'data.json') {
    this.config = config;
    this.configPath = path.resolve(process.cwd(), configPath);
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private setupRoutes() {
    this.config.routes.forEach((route) => {
      Object.entries(route.methods).forEach(([method, methodConfig]) => {
        this.createRoute(route.path, method, methodConfig);
      });
    });
  }

  private saveConfig() {
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf-8');
  }

  private findUserById(id: number) {
    const usersRoute = this.config.routes.find(route => route.path === '/users');
    if (!usersRoute) return null;

    const getMethod = usersRoute.methods.get;
    if (!getMethod || !Array.isArray(getMethod.response)) return null;

    return getMethod.response.find(user => user.id === id);
  }

  private getNextUserId() {
    const usersRoute = this.config.routes.find(route => route.path === '/users');
    if (!usersRoute) return 1;

    const getMethod = usersRoute.methods.get;
    if (!getMethod || !Array.isArray(getMethod.response)) return 1;

    const maxId = Math.max(...getMethod.response.map(user => user.id));
    return maxId + 1;
  }

  private createRoute(path: string, method: string, config: MethodConfig) {
    const fullPath = `${this.config.server.baseProxy}${path}`;
    console.log(`创建路由: ${method.toUpperCase()} ${fullPath}`);
    
    switch (method.toLowerCase()) {
      case 'get':
        this.app.get(fullPath, this.handleRequest(config));
        break;
      case 'post':
        this.app.post(fullPath, this.handlePostRequest(config));
        break;
      case 'put':
        this.app.put(`${fullPath}/:id`, this.handlePutRequest(config));
        break;
      case 'delete':
        this.app.delete(`${fullPath}/:id`, this.handleDeleteRequest(config));
        break;
    }
  }

  private handleRequest(config: MethodConfig) {
    return (req: Request, res: Response) => {
      console.log(`收到请求: ${req.method} ${req.url}`);
      
      if (config.pagination?.enabled && config.type === 'array') {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || config.pagination.pageSize;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const data = config.response.slice(startIndex, endIndex);
        
        res.header('X-Total-Count', config.pagination.totalCount.toString());
        res.json(data);
      } else {
        res.json(config.response);
      }
    };
  }

  private handlePostRequest(config: MethodConfig) {
    return (req: Request, res: Response) => {
      console.log(`收到创建请求: ${req.url}`, req.body);

      const usersRoute = this.config.routes.find(route => route.path === '/users');
      if (!usersRoute) {
        return res.status(404).json({ error: '路由未找到' });
      }

      const getMethod = usersRoute.methods.get;
      if (!getMethod || !Array.isArray(getMethod.response)) {
        return res.status(500).json({ error: '数据格式错误' });
      }

      const newUser = {
        id: this.getNextUserId(),
        ...req.body
      };

      getMethod.response.push(newUser);
      this.saveConfig();

      res.status(201).json(newUser);
    };
  }

  private handlePutRequest(config: MethodConfig) {
    return (req: Request, res: Response) => {
      const userId = parseInt(req.params.id);
      console.log(`收到更新请求: ${req.url}`, req.body);

      const user = this.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: '用户未找到' });
      }

      Object.assign(user, req.body);
      this.saveConfig();

      res.json(user);
    };
  }

  private handleDeleteRequest(config: MethodConfig) {
    return (req: Request, res: Response) => {
      const userId = parseInt(req.params.id);
      console.log(`收到删除请求: ${req.url}`);

      const usersRoute = this.config.routes.find(route => route.path === '/users');
      if (!usersRoute) {
        return res.status(404).json({ error: '路由未找到' });
      }

      const getMethod = usersRoute.methods.get;
      if (!getMethod || !Array.isArray(getMethod.response)) {
        return res.status(500).json({ error: '数据格式错误' });
      }

      const userIndex = getMethod.response.findIndex(user => user.id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ error: '用户未找到' });
      }

      getMethod.response.splice(userIndex, 1);
      this.saveConfig();

      res.json({ success: true, message: '删除成功' });
    };
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