export interface ServerConfig {
  port: number;
  baseProxy: string;
}

export interface PaginationConfig {
  enabled: boolean;
  pageSize: number;
  totalCount: number;
}

export interface MethodConfig {
  type?: 'array' | 'object';
  pagination?: PaginationConfig;
  response: any;
  requestSchema?: Record<string, string>;
  params?: string[];
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