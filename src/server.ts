import Mock from 'mockjs';
import express, { Request, Response, Express } from 'express';
import cors from 'cors';
import { Config, MethodConfig } from './types';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Server as WebSocketServer } from 'ws';
import http from 'http';

// 扩展 Request 类型以包含文件
interface MulterRequest extends Request {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

export class MockServer {
  private app: Express = express();
  private server: http.Server;
  private wss: WebSocketServer | null = null;
  private config: Config;
  private configPath: string;

  constructor(config: Config, configPath: string = 'data.json') {
    this.config = config;
    this.configPath = configPath;
    this.server = http.createServer(this.app);
    this.setupMiddleware();
    this.setupRoutes();
    if (config.websocket?.enabled) {
      this.setupWebSocket();
    }
  }

  public getApp(): Express {
    return this.app;
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use('/uploads', express.static('uploads'));
    this.app.use(this.logRequest);
  }

  private logRequest = (req: Request, res: Response, next: Function) => {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    console.log(`[${new Date().toISOString()}] Request ${requestId}:`);
    console.log(`  Method: ${req.method}`);
    console.log(`  URL: ${req.url}`);
    console.log(`  Query Params: ${JSON.stringify(req.query)}`);
    console.log(`  Body: ${JSON.stringify(req.body)}`);

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      console.log(`[${new Date().toISOString()}] Response ${requestId}:`);
      console.log(`  Status: ${res.statusCode}`);
      console.log(`  Duration: ${duration}ms`);
      console.log('----------------------------------------');
    });

    next();
  };

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
      console.error('Error generating mock data:', error);
      return config.response;
    }
  }

  private handleRequest(config: MethodConfig) {
    return (req: Request, res: Response) => {
      try {
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
        console.error('Error handling request:', error);
        res.status(500).json({ error: 'Internal server error' });
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
        if (path === '/upload/avatar') {
          // 对于文件上传路由，使用特殊处理
          this.app.post(fullPath, (req: Request, res: Response) => {
            const mockResponse = this.generateMockData(config);
            res.json(mockResponse);
          });
        } else {
          this.app.post(fullPath, this.handleRequest(config));
        }
        break;
      case 'put':
        this.app.put(`${fullPath}/:id`, this.handleRequest(config));
        break;
      case 'delete':
        this.app.delete(`${fullPath}/:id`, this.handleRequest(config));
        break;
    }
  }

  private findRouteConfig(path: string, method: string): MethodConfig | null {
    const route = this.config.routes.find(r => r.path === path);
    return route?.methods[method] || null;
  }

  private generateMockResponse(config: MethodConfig) {
    if (config.mock?.enabled && config.mock.template) {
      return Mock.mock(config.mock.template);
    }
    return config.response;
  }

  private setupWebSocket() {
    if (!this.config.websocket) return;

    this.wss = new WebSocketServer({ 
      server: this.server,
      path: this.config.websocket.path 
    });

    this.wss.on('connection', (ws) => {
      console.log('WebSocket client connected');

      // 处理客户端消息
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          const eventConfig = this.config.websocket?.events?.[data.event];
          
          if (eventConfig?.mock.enabled) {
            const response = Mock.mock(eventConfig.mock.template);
            ws.send(JSON.stringify({
              event: data.event,
              data: response
            }));
          }
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
        }
      });

      // 设置自动发送数据的定时器
      if (this.config.websocket && this.config.websocket.events) {
        Object.entries(this.config.websocket.events).forEach(([event, config]) => {
          if (config.mock.interval) {
            setInterval(() => {
              const response = Mock.mock(config.mock.template);
              ws.send(JSON.stringify({
                event,
                data: response
              }));
            }, config.mock.interval);
          }
        });
      }

      ws.on('close', () => {
        // 移除日志，避免测试完成后的日志输出
        // console.log('WebSocket client disconnected');
      });
    });
  }

  public start() {
    this.server.listen(this.config.server.port, () => {
      console.log(`Mock 服务器已启动:`);
      console.log(`- HTTP 地址: http://localhost:${this.config.server.port}`);
      if (this.config.websocket?.enabled) {
        console.log(`- WebSocket 地址: ws://localhost:${this.config.server.port}${this.config.websocket.path}`);
      }
      console.log(`- 基础路径: ${this.config.server.baseProxy}`);
      console.log('可用的接口:');
      this.config.routes.forEach(route => {
        Object.keys(route.methods).forEach(method => {
          console.log(`  ${method.toUpperCase()} http://localhost:${this.config.server.port}${this.config.server.baseProxy}${route.path}`);
        });
      });
    });
  }

  public close() {
    // 关闭所有 WebSocket 连接
    if (this.wss) {
      this.wss.clients.forEach(client => {
        client.close();
      });
      this.wss.close();
    }
    // 关闭 HTTP 服务器
    this.server.close();
  }
} 