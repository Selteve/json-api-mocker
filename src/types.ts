export interface ServerConfig {
  port: number;
  baseProxy: string;
}

export interface PaginationConfig {
  enabled: boolean;
  pageSize: number;
  totalCount: number;
}

export interface MockConfig {
  enabled: boolean;
  total: number;
  template: Record<string, any>;
}

export interface MethodConfig {
  type?: 'array' | 'object';
  response?: any;
  mock?: MockConfig;
  pagination?: PaginationConfig;
  requestSchema?: Record<string, string>;
}

export interface RouteConfig {
  path: string;
  methods: {
    [key: string]: MethodConfig;
  };
}

export interface Config {
  server: ServerConfig;
  routes: RouteConfig[];
} 