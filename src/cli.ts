#!/usr/bin/env node

import { startServer } from './index';

const configPath = process.argv[2] || 'data.json';
startServer(configPath); 