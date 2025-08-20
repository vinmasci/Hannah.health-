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