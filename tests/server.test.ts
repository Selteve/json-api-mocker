import { MockServer } from '../src/server';
import request from 'supertest';
import { Config } from '../src/types';

describe('MockServer', () => {
  let config: Config;

  beforeEach(() => {
    // 测试配置
    config = {
      server: {
        port: 8080,
        baseProxy: '/api'
      },
      routes: [
        {
          path: '/users',
          methods: {
            get: {
              type: 'array',
              mock: {
                enabled: true,
                total: 2,
                template: {
                  "id|+1": 1,
                  "name": "@name"
                }
              }
            }
          }
        }
      ]
    };
  });

  it('should return mocked data for GET /users', async () => {
    const server = new MockServer(config);
    const response = await request(server.getApp())
      .get('/api/users')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('name');
  });

  it('should handle pagination correctly', async () => {
    config.routes[0].methods.get.pagination = {
      enabled: true,
      pageSize: 1,
      totalCount: 2
    };

    const server = new MockServer(config);
    const response = await request(server.getApp())
      .get('/api/users?page=1&pageSize=1')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.headers['x-total-count']).toBe('2');
  });

  it('should handle mock file upload', async () => {
    config.routes.push({
      path: '/upload/avatar',
      methods: {
        post: {
          type: 'object',
          mock: {
            enabled: true,
            total: 1,
            template: {
              success: true,
              message: "Upload successful",
              data: {
                url: "@image('200x200')",
                filename: "@string(10).jpg",
                size: "@integer(1000, 1000000)"
              }
            }
          }
        }
      }
    });

    const server = new MockServer(config);
    const response = await request(server.getApp())
      .post('/api/upload/avatar')
      .field('avatar', 'test.jpg')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('url');
    expect(response.body.data).toHaveProperty('filename');
    expect(response.body.data).toHaveProperty('size');
  });
}); 