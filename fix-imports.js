const fs = require('fs');
const path = require('path');
const routesDir = 'src/routes';
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Clean up all auth imports
  content = content.replace(/import \{.*?\} from '\.\.\/middleware\/auth\.middleware';\r?\n?/g, '');
  content = content.replace(/import \{.*?\} from '\.\.\/middleware\/rbac\.middleware';\r?\n?/g, '');
  
  // Add them back at the top if protect or restrictTo is used
  const hasProtect = content.includes('protect');
  const hasRestrictTo = content.includes('restrictTo');
  
  let importsToAdd = '';
  if (hasProtect) importsToAdd += "import { protect } from '../middleware/auth.middleware';\n";
  if (hasRestrictTo) importsToAdd += "import { restrictTo } from '../middleware/rbac.middleware';\n";
  
  if (importsToAdd) {
    const firstImportIndex = content.indexOf('import');
    if (firstImportIndex !== -1) {
      content = content.slice(0, firstImportIndex) + importsToAdd + content.slice(firstImportIndex);
    } else {
      content = importsToAdd + content;
    }
  }
  
  fs.writeFileSync(filePath, content);
});
console.log('Imports fixed.');
