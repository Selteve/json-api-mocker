import fs from 'fs';
import path from 'path';
import { Config } from './types';
import { MockServer } from './server';

export function startServer(configPath: string = 'data.json') {
  const fullPath = path.resolve(process.cwd(), configPath);
  
  try {
    const configContent = fs.readFileSync(fullPath, 'utf-8');
    const config: Config = JSON.parse(configContent);
    
    const server = new MockServer(config, configPath);
    server.start();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

export { MockServer } from './server';
export * from './types'; 