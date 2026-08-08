const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    content = content.replace(/import prisma from ['"]\.\.\/config\/database['"]/g, "import { prisma } from '../config/database'");
    content = content.replace(/import env from ['"]\.\.\/config\/env['"]/g, "import { env } from '../config/env'");
    content = content.replace(/requireAuth/g, 'protect');
    content = content.replace(/requireRole/g, 'restrictTo');
    
    // Quick fix for route imports
    if (filePath.includes('routes') && !filePath.includes('auth.routes.ts') && !filePath.includes('index.ts')) {
      content = content.replace(/import { protect } from '\.\.\/middleware\/auth\.middleware';/, "import { protect } from '../middleware/auth.middleware';\nimport { restrictTo } from '../middleware/rbac.middleware';");
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed', filePath);
    }
  }
});
