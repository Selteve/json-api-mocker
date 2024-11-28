declare module 'express' {
  import express from 'express';
  export = express;
}

declare module 'cors' {
  import cors from 'cors';
  export = cors;
}

declare module 'fs' {
  import * as fs from 'node:fs';
  export = fs;
}

declare module 'path' {
  import * as path from 'node:path';
  export = path;
} 