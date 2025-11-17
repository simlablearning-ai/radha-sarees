import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function getAllTsxFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, dist, etc.
      if (!['node_modules', 'dist', '.git'].includes(file)) {
        getAllTsxFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function fixImports(filePath) {
  let content = readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace versioned imports with non-versioned ones
  // Pattern: from "package@version" -> from "package"
  const versionedImportRegex = /from\s+["']([^"']+)@[\d.]+["']/g;
  
  const newContent = content.replace(versionedImportRegex, (match, packageName) => {
    modified = true;
    return `from "${packageName}"`;
  });
  
  if (modified) {
    writeFileSync(filePath, newContent, 'utf8');
    console.log(`✓ Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
console.log('🔧 Fixing versioned imports...\n');

const files = getAllTsxFiles('.');
let fixedCount = 0;

files.forEach(file => {
  if (fixImports(file)) {
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} files!`);
