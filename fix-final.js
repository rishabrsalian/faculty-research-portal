const fs = require('fs');

function fixFile(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/sendSuccess\(res, (\d{3}), (.*?), ['"`](.*?)['"`]\);/g, 'sendSuccess(res, $2, "$3", $1);');
  content = content.replace(/sendSuccess\(res, (\d{3}), (.*?)\);/g, 'sendSuccess(res, $2, "Success", $1);');
  
  // also fix restrictTo imports
  if (file.includes('routes')) {
    content = content.replace(/import \{ protect \} from '\.\.\/middleware\/auth\.middleware';/, "import { protect } from '../middleware/auth.middleware';\nimport { restrictTo } from '../middleware/rbac.middleware';");
  }
  
  fs.writeFileSync(file, content);
}

fixFile('src/controllers/auth.controller.ts');
fixFile('src/controllers/faculty.controller.ts');
fixFile('src/controllers/publication.controller.ts');
fixFile('src/controllers/patent.controller.ts');
fixFile('src/controllers/project.controller.ts');
fixFile('src/controllers/contribution.controller.ts');

fixFile('src/routes/auth.routes.ts');
fixFile('src/routes/faculty.routes.ts');
fixFile('src/routes/publication.routes.ts');
fixFile('src/routes/patent.routes.ts');
fixFile('src/routes/project.routes.ts');
fixFile('src/routes/contribution.routes.ts');

// Fix seed script
let seedFile = 'src/database/seed/08-contributions.seed.ts';
if (fs.existsSync(seedFile)) {
  let seedContent = fs.readFileSync(seedFile, 'utf8');
  seedContent = seedContent.replace(/type: /g, 'contributionType: ');
  fs.writeFileSync(seedFile, seedContent);
}

console.log('Fixed');
