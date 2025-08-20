# Documentation Maintenance Agent

## Purpose
Automated agent responsible for keeping project documentation synchronized and up-to-date as the codebase evolves.

## Responsibilities

### 1. Context.md Maintenance
- Update technical architecture when stack changes
- Add new components as they're created
- Update status of features (completed, in progress, upcoming)
- Refresh file structure when directories change
- Update API endpoints documentation

### 2. Sitemap.md Maintenance
- Add new files with descriptions when created
- Update file purposes when functionality changes
- Mark deprecated files
- Update migration status
- Maintain accurate directory structure

### 3. Cross-Documentation Sync
- Ensure consistency across all documentation files
- Update links when files are renamed or moved
- Verify all referenced files exist
- Maintain version numbers and dates

## Trigger Events

### Automatic Updates Required When:
1. **New files created** → Add to sitemap.md
2. **Files deleted** → Mark as deprecated or remove
3. **Major refactoring** → Update architecture in context.md
4. **New features added** → Update feature lists
5. **Dependencies changed** → Update tech stack
6. **API routes modified** → Update endpoint documentation
7. **Database schema changes** → Update database section

## Update Checklist

### Daily Maintenance
```markdown
- [ ] Check for new uncommitted files
- [ ] Verify all links in documentation work
- [ ] Update "Last Updated" dates
- [ ] Ensure version numbers are current
```

### Weekly Review
```markdown
- [ ] Review project structure changes
- [ ] Update completed/in-progress/upcoming sections
- [ ] Verify all file descriptions are accurate
- [ ] Check for deprecated code to document
- [ ] Update migration status
```

### On Each Feature Completion
```markdown
- [ ] Add feature to context.md completed section
- [ ] Document new files in sitemap.md
- [ ] Update relevant documentation sections
- [ ] Add any new API endpoints
- [ ] Update user flows if changed
```

## Implementation Instructions

### Manual Process (Current)
Run these commands periodically to check for updates needed:

```bash
# Check for new files not in sitemap
git status --porcelain | grep "^??" | cut -c4-

# Find recently modified files
find . -type f -name "*.js" -o -name "*.html" -o -name "*.css" -mtime -7

# Check for broken links in markdown
grep -r "\[.*\](.*.md)" *.md | while read line; do
  # Verify each linked file exists
done
```

### Semi-Automated Process (Recommended)

Create a Node.js script `update-docs.js`:

```javascript
const fs = require('fs');
const path = require('path');

class DocMaintainer {
  constructor() {
    this.contextPath = './context.md';
    this.sitemapPath = './sitemap.md';
    this.changes = [];
  }

  // Scan for new files
  scanForNewFiles() {
    // Implementation to find files not documented
  }

  // Update context.md
  updateContext() {
    // Implementation to update context sections
  }

  // Update sitemap.md
  updateSitemap() {
    // Implementation to update file listings
  }

  // Generate report
  generateReport() {
    console.log('Documentation Update Report:');
    console.log('============================');
    this.changes.forEach(change => console.log(`- ${change}`));
  }
}

// Run maintenance
const maintainer = new DocMaintainer();
maintainer.scanForNewFiles();
maintainer.updateContext();
maintainer.updateSitemap();
maintainer.generateReport();
```

### Git Hooks Integration

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
echo "Reminder: Update documentation if you've added new files or features"
echo "Files to document:"
git diff --cached --name-only --diff-filter=A
```

## Documentation Standards

### File Description Format
```markdown
#### `filename.ext`
**Purpose:** Primary function in one line  
**Features/Functionality:**
- Key feature 1
- Key feature 2
**Status:** Active/Deprecated/In Development
**Dependencies:** List of dependencies
```

### Context.md Section Updates
```markdown
### Completed
- ✅ Feature name - Brief description

### In Progress  
- 🔄 Feature name - Brief description

### Upcoming
- 📋 Feature name - Brief description
```

## Large File Detection

### Why Monitor Large Files?
- **Performance**: Large files slow down git operations
- **Repository Size**: GitHub has file size limits (100MB warning, 50MB recommended)
- **Load Times**: Large JS/CSS files impact application performance
- **Maintenance**: Large files are harder to review and maintain

### Size Thresholds
- **Warning**: Files over 500KB
- **Concern**: Files over 1MB  
- **Critical**: Files over 5MB
- **GitHub Limit**: Files over 100MB (will be rejected)

### Line Count Thresholds
- **Warning**: Files over 300 lines (getting complex)
- **Concern**: Files over 500 lines (should consider splitting)
- **Critical**: Files over 1000 lines (definitely needs refactoring)
- **Extreme**: Files over 2000 lines (maintenance nightmare)

### Detection Commands - By File Size

```bash
# Find all files larger than 500KB
find . -type f -size +500k -exec ls -lh {} \; | awk '{print $5, $NF}'

# Find top 10 largest files in the project
find . -type f -exec ls -l {} \; | sort -k5 -rn | head -10

# Find large JavaScript files specifically
find . -name "*.js" -size +100k -exec ls -lh {} \;

# Find large CSS files
find . -name "*.css" -size +100k -exec ls -lh {} \;

# Check total size of node_modules (usually git-ignored)
du -sh node_modules/ 2>/dev/null || echo "No node_modules found"

# Find large files NOT in .gitignore
git ls-files | xargs -I {} du -h {} | sort -rh | head -20

# Get size of all tracked files in git
git ls-files | xargs du -ch | tail -1

# Find large images
find . \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" \) -size +500k -exec ls -lh {} \;

# Find large JSON files
find . -name "*.json" -size +100k -exec ls -lh {} \;
```

### Detection Commands - By Line Count

```bash
# Find JavaScript files with more than 500 lines
find . -name "*.js" -exec wc -l {} \; | awk '$1 > 500 {print $1, $2}' | sort -rn

# Find CSS files with more than 1000 lines
find . -name "*.css" -exec wc -l {} \; | awk '$1 > 1000 {print $1, $2}' | sort -rn

# Find all files with more than 300 lines
find . -type f -exec wc -l {} \; | awk '$1 > 300 {print $1, $2}' | sort -rn | head -20

# Top 10 longest files in the project (by lines)
find . -type f -name "*.js" -o -name "*.css" -o -name "*.html" | xargs wc -l | sort -rn | head -10

# Count lines in all JavaScript files
find . -name "*.js" -exec wc -l {} \; | sort -rn

# Get detailed line count report for a specific directory
find ./src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \) -exec wc -l {} \; | sort -rn

# Find files with specific line ranges
echo "Files 100-300 lines (manageable):"
find . -name "*.js" -exec sh -c 'lines=$(wc -l < "$1"); [ $lines -ge 100 ] && [ $lines -le 300 ] && echo "$lines $1"' _ {} \; | sort -rn

echo "Files 300-500 lines (getting large):"
find . -name "*.js" -exec sh -c 'lines=$(wc -l < "$1"); [ $lines -ge 300 ] && [ $lines -le 500 ] && echo "$lines $1"' _ {} \; | sort -rn

echo "Files 500-1000 lines (should split):"
find . -name "*.js" -exec sh -c 'lines=$(wc -l < "$1"); [ $lines -ge 500 ] && [ $lines -le 1000 ] && echo "$lines $1"' _ {} \; | sort -rn

echo "Files over 1000 lines (refactor needed):"
find . -name "*.js" -exec sh -c 'lines=$(wc -l < "$1"); [ $lines -gt 1000 ] && echo "$lines $1"' _ {} \; | sort -rn

# Quick summary of line counts by file type
echo "JavaScript:" && find . -name "*.js" | xargs wc -l | tail -1
echo "CSS:" && find . -name "*.css" | xargs wc -l | tail -1
echo "HTML:" && find . -name "*.html" | xargs wc -l | tail -1
echo "Markdown:" && find . -name "*.md" | xargs wc -l | tail -1
```

### Automated Large File Report Script (By Line Count)

Create `check-line-count.js`:

```javascript
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class LineCountAnalyzer {
  constructor() {
    this.results = {
      small: [],      // < 100 lines
      medium: [],     // 100-300 lines
      large: [],      // 300-500 lines
      veryLarge: [],  // 500-1000 lines
      huge: [],       // 1000-2000 lines
      massive: []     // > 2000 lines
    };
    
    this.fileTypes = {
      js: { pattern: /\.js$/, name: 'JavaScript' },
      jsx: { pattern: /\.jsx$/, name: 'React JSX' },
      ts: { pattern: /\.ts$/, name: 'TypeScript' },
      tsx: { pattern: /\.tsx$/, name: 'React TSX' },
      css: { pattern: /\.css$/, name: 'CSS' },
      scss: { pattern: /\.scss$/, name: 'SCSS' },
      html: { pattern: /\.html$/, name: 'HTML' },
      md: { pattern: /\.md$/, name: 'Markdown' },
      json: { pattern: /\.json$/, name: 'JSON' },
      sql: { pattern: /\.sql$/, name: 'SQL' }
    };
    
    this.stats = {};
    this.ignore = ['node_modules', '.git', 'dist', 'build', 'coverage', '.next'];
  }

  async countLines(filePath) {
    return new Promise((resolve) => {
      let lineCount = 0;
      let blankLines = 0;
      let commentLines = 0;
      
      const stream = readline.createInterface({
        input: fs.createReadStream(filePath),
        crlfDelay: Infinity
      });
      
      stream.on('line', (line) => {
        lineCount++;
        const trimmed = line.trim();
        if (!trimmed) blankLines++;
        if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
          commentLines++;
        }
      });
      
      stream.on('close', () => {
        resolve({
          total: lineCount,
          blank: blankLines,
          comment: commentLines,
          code: lineCount - blankLines - commentLines
        });
      });
      
      stream.on('error', () => {
        resolve({ total: 0, blank: 0, comment: 0, code: 0 });
      });
    });
  }

  categorizeFile(filePath, lines) {
    const fileInfo = {
      path: filePath,
      lines: lines.total,
      codeLines: lines.code,
      blankLines: lines.blank,
      commentLines: lines.comment
    };
    
    if (lines.total < 100) {
      this.results.small.push(fileInfo);
    } else if (lines.total <= 300) {
      this.results.medium.push(fileInfo);
    } else if (lines.total <= 500) {
      this.results.large.push(fileInfo);
    } else if (lines.total <= 1000) {
      this.results.veryLarge.push(fileInfo);
    } else if (lines.total <= 2000) {
      this.results.huge.push(fileInfo);
    } else {
      this.results.massive.push(fileInfo);
    }
  }

  async scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!this.ignore.includes(file) && !file.startsWith('.')) {
          await this.scanDirectory(filePath);
        }
      } else {
        // Check if it's a code file
        const ext = path.extname(file).toLowerCase();
        const isCodeFile = Object.values(this.fileTypes).some(ft => ft.pattern.test(file));
        
        if (isCodeFile) {
          const lines = await this.countLines(filePath);
          this.categorizeFile(filePath, lines);
          
          // Track stats by file type
          const fileType = Object.entries(this.fileTypes).find(([key, val]) => val.pattern.test(file));
          if (fileType) {
            const [key, val] = fileType;
            if (!this.stats[key]) {
              this.stats[key] = { 
                name: val.name, 
                files: 0, 
                totalLines: 0, 
                codeLines: 0,
                largestFile: { path: '', lines: 0 }
              };
            }
            this.stats[key].files++;
            this.stats[key].totalLines += lines.total;
            this.stats[key].codeLines += lines.code;
            if (lines.total > this.stats[key].largestFile.lines) {
              this.stats[key].largestFile = { path: filePath, lines: lines.total };
            }
          }
        }
      }
    }
  }

  generateReport() {
    console.log('\n📊 Line Count Analysis Report');
    console.log('=====================================\n');
    
    // Critical files that need attention
    if (this.results.massive.length > 0) {
      console.log('🔴 MASSIVE FILES (>2000 lines) - Urgent refactoring needed:');
      this.results.massive.sort((a, b) => b.lines - a.lines).forEach(file => {
        console.log(`   ${String(file.lines).padStart(5)} lines - ${file.path}`);
        console.log(`         (${file.codeLines} code, ${file.commentLines} comments, ${file.blankLines} blank)`);
      });
      console.log();
    }
    
    if (this.results.huge.length > 0) {
      console.log('🟠 HUGE FILES (1000-2000 lines) - Should be split:');
      this.results.huge.sort((a, b) => b.lines - a.lines).forEach(file => {
        console.log(`   ${String(file.lines).padStart(5)} lines - ${file.path}`);
      });
      console.log();
    }
    
    if (this.results.veryLarge.length > 0) {
      console.log('🟡 VERY LARGE FILES (500-1000 lines) - Consider refactoring:');
      this.results.veryLarge.sort((a, b) => b.lines - a.lines).slice(0, 10).forEach(file => {
        console.log(`   ${String(file.lines).padStart(5)} lines - ${file.path}`);
      });
      if (this.results.veryLarge.length > 10) {
        console.log(`   ... and ${this.results.veryLarge.length - 10} more files`);
      }
      console.log();
    }
    
    // Summary statistics
    console.log('📈 Summary Statistics:');
    console.log('---------------------');
    console.log(`Small files (<100 lines):        ${this.results.small.length}`);
    console.log(`Medium files (100-300 lines):    ${this.results.medium.length}`);
    console.log(`Large files (300-500 lines):     ${this.results.large.length}`);
    console.log(`Very large (500-1000 lines):     ${this.results.veryLarge.length}`);
    console.log(`Huge files (1000-2000 lines):    ${this.results.huge.length}`);
    console.log(`Massive files (>2000 lines):     ${this.results.massive.length}`);
    console.log();
    
    // File type statistics
    console.log('📁 Statistics by File Type:');
    console.log('---------------------------');
    Object.entries(this.stats).forEach(([key, stats]) => {
      if (stats.files > 0) {
        const avgLines = Math.round(stats.totalLines / stats.files);
        console.log(`${stats.name}:`);
        console.log(`   Files: ${stats.files}`);
        console.log(`   Total lines: ${stats.totalLines.toLocaleString()}`);
        console.log(`   Code lines: ${stats.codeLines.toLocaleString()}`);
        console.log(`   Average lines/file: ${avgLines}`);
        console.log(`   Largest: ${stats.largestFile.lines} lines (${stats.largestFile.path})`);
      }
    });
    console.log();
    
    // Recommendations
    const totalProblematic = this.results.veryLarge.length + 
                           this.results.huge.length + 
                           this.results.massive.length;
    
    if (totalProblematic > 0) {
      console.log('💡 Recommendations:');
      console.log('-------------------');
      console.log(`• You have ${totalProblematic} files that should be refactored`);
      
      if (this.results.massive.length > 0) {
        console.log('• URGENT: Files over 2000 lines are extremely hard to maintain');
        console.log('  Consider splitting them into multiple modules immediately');
      }
      
      if (this.results.huge.length > 0) {
        console.log('• Files over 1000 lines should be split into logical components');
      }
      
      console.log('\n📚 Refactoring Strategies:');
      console.log('• Extract reusable functions into utility modules');
      console.log('• Split by feature or responsibility');
      console.log('• Create separate files for constants and configurations');
      console.log('• Move type definitions to separate files (TypeScript)');
      console.log('• Extract React components into separate files');
      console.log('• Use barrel exports (index.js) to organize module exports');
    } else {
      console.log('✅ Great job! All files are within reasonable size limits.');
    }
  }
}

// Run the analyzer
async function analyze() {
  const analyzer = new LineCountAnalyzer();
  console.log('🔍 Scanning files...\n');
  await analyzer.scanDirectory('.');
  analyzer.generateReport();
}

analyze().catch(console.error);
```

### Automated Large File Report Script (By File Size)

Create `check-large-files.js`:

```javascript
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class LargeFileDetector {
  constructor() {
    this.warnings = [];
    this.concerns = [];
    this.critical = [];
    
    // Size thresholds in bytes
    this.thresholds = {
      warning: 500 * 1024,      // 500KB
      concern: 1024 * 1024,     // 1MB
      critical: 5 * 1024 * 1024 // 5MB
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  checkFile(filePath) {
    try {
      const stats = fs.statSync(filePath);
      const size = stats.size;
      
      if (size > this.thresholds.critical) {
        this.critical.push({ path: filePath, size });
      } else if (size > this.thresholds.concern) {
        this.concerns.push({ path: filePath, size });
      } else if (size > this.thresholds.warning) {
        this.warnings.push({ path: filePath, size });
      }
    } catch (error) {
      // File might be deleted or inaccessible
    }
  }

  scanDirectory(dir, ignore = ['node_modules', '.git', 'dist', 'build']) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!ignore.includes(file)) {
          this.scanDirectory(filePath, ignore);
        }
      } else {
        this.checkFile(filePath);
      }
    });
  }

  generateReport() {
    console.log('\n📊 Large File Detection Report');
    console.log('================================\n');
    
    if (this.critical.length > 0) {
      console.log('🔴 CRITICAL (>5MB):');
      this.critical.forEach(file => {
        console.log(`   ${this.formatBytes(file.size).padEnd(10)} - ${file.path}`);
      });
      console.log();
    }
    
    if (this.concerns.length > 0) {
      console.log('🟡 CONCERN (>1MB):');
      this.concerns.forEach(file => {
        console.log(`   ${this.formatBytes(file.size).padEnd(10)} - ${file.path}`);
      });
      console.log();
    }
    
    if (this.warnings.length > 0) {
      console.log('⚠️  WARNING (>500KB):');
      this.warnings.forEach(file => {
        console.log(`   ${this.formatBytes(file.size).padEnd(10)} - ${file.path}`);
      });
      console.log();
    }
    
    if (this.critical.length === 0 && this.concerns.length === 0 && this.warnings.length === 0) {
      console.log('✅ No large files detected!\n');
    }
    
    // Recommendations
    if (this.critical.length > 0 || this.concerns.length > 0) {
      console.log('📝 Recommendations:');
      console.log('   • Consider using Git LFS for large binary files');
      console.log('   • Compress images using tools like ImageOptim or TinyPNG');
      console.log('   • Split large JavaScript files into smaller modules');
      console.log('   • Minify CSS and JavaScript for production');
      console.log('   • Move large datasets to external storage or CDN\n');
    }
  }

  checkGitLFS() {
    try {
      execSync('git lfs version', { stdio: 'ignore' });
      console.log('ℹ️  Git LFS is installed');
      
      const tracked = execSync('git lfs ls-files', { encoding: 'utf-8' });
      if (tracked) {
        console.log('📦 Files tracked by Git LFS:');
        console.log(tracked);
      }
    } catch {
      console.log('⚠️  Git LFS is not installed or not initialized');
      console.log('   Install with: git lfs install');
    }
  }
}

// Run the detector
const detector = new LargeFileDetector();
detector.scanDirectory('.');
detector.generateReport();
detector.checkGitLFS();
```

### File Size Management Strategies

#### 1. **Image Optimization**
```bash
# Install image optimization tools
npm install -g imagemin-cli

# Compress all images
imagemin images/* --out-dir=images

# Convert images to WebP format (smaller file size)
for file in *.png *.jpg; do
  cwebp -q 80 "$file" -o "${file%.*}.webp"
done
```

#### 2. **Code Splitting**
```javascript
// Before: large single file
// app.js (2MB)

// After: split into modules
// app.js (50KB)
// modules/feature1.js (200KB)
// modules/feature2.js (200KB)
// Load on demand with dynamic imports
```

#### 3. **Git LFS Setup**
```bash
# Initialize Git LFS
git lfs install

# Track large file types
git lfs track "*.psd"
git lfs track "*.zip"
git lfs track "*.pdf"
git lfs track "images/*.png"

# Add .gitattributes
git add .gitattributes
git commit -m "Configure Git LFS"
```

#### 4. **Build Optimization**
```json
// package.json scripts
{
  "scripts": {
    "build": "npm run build:js && npm run build:css",
    "build:js": "terser app.js -o app.min.js",
    "build:css": "cssnano styles.css styles.min.css",
    "check:size": "node check-large-files.js",
    "optimize:images": "imagemin images/* --out-dir=images/optimized"
  }
}
```

### Add to .gitignore
```gitignore
# Large files that shouldn't be committed
*.log
*.sql
*.sqlite
*.psd
*.ai
*.sketch
node_modules/
dist/
build/
*.mp4
*.mov
*.avi
temp/
cache/
```

## Quick Commands

### Check Documentation Health
```bash
# Count undocumented files
find . -type f \( -name "*.js" -o -name "*.html" \) | wc -l
# Compare with documented count in sitemap.md

# Find TODO/FIXME in docs
grep -r "TODO\|FIXME" *.md

# Check last update dates
grep -r "Last Updated" *.md

# Run large file detection
node check-large-files.js
```

### Update Documentation Dates
```bash
# Update all Last Updated dates to today
sed -i '' "s/Last Updated: .*/Last Updated: $(date +%B\ %Y)/" *.md
```

## AI Assistant Prompt

When asking an AI assistant to update documentation:

```
Please update the project documentation:
1. Review all files in the project
2. Update context.md with any new features or changes
3. Update sitemap.md with new files and descriptions
4. Ensure all links between documents are working
5. Update Last Updated dates
6. Mark any deprecated features
7. Verify consistency across all documentation
```

## Maintenance Schedule

- **Daily**: Quick scan for new files
- **Weekly**: Full documentation review
- **Sprint End**: Comprehensive update
- **Major Release**: Complete documentation overhaul

## Quality Checks

1. **Completeness**: Every file has a description
2. **Accuracy**: Descriptions match current functionality  
3. **Consistency**: Naming and formatting is uniform
4. **Currency**: Dates and versions are current
5. **Linkage**: All cross-references work

---

*This agent specification created: January 2025*
*Maintenance Agent Version: 1.0.0*