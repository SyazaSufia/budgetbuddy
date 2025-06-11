// Create this as debug-files.js and run it on your VPS
const fs = require('fs');
const path = require('path');

const debugFileStructure = () => {
  console.log('=== BudgetBuddy File Structure Debug ===\n');
  
  // Check current working directory
  console.log('Current working directory:', process.cwd());
  console.log('__dirname (script location):', __dirname);
  console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('');
  
  // Define possible paths
  const possiblePaths = [
    // Relative to current script
    path.join(__dirname, 'public'),
    path.join(__dirname, 'public', 'uploads'),
    path.join(__dirname, 'public', 'uploads', 'ads'),
    
    // Absolute VPS paths
    '/var/www/budgetbuddy/backend',
    '/var/www/budgetbuddy/backend/public',
    '/var/www/budgetbuddy/backend/public/uploads',
    '/var/www/budgetbuddy/backend/public/uploads/ads',
    
    // Alternative paths
    '/var/www/budgetbuddy/public',
    '/var/www/budgetbuddy/public/uploads',
    '/var/www/budgetbuddy/public/uploads/ads',
  ];
  
  console.log('=== Directory Existence Check ===');
  possiblePaths.forEach(dirPath => {
    const exists = fs.existsSync(dirPath);
    console.log(`${exists ? '✅' : '❌'} ${dirPath}`);
    
    if (exists) {
      try {
        const stats = fs.statSync(dirPath);
        if (stats.isDirectory()) {
          const files = fs.readdirSync(dirPath);
          console.log(`   └── Contains ${files.length} items`);
          
          // If this is an ads directory, show the files
          if (dirPath.includes('ads') && files.length > 0) {
            console.log('   └── Ad files:');
            files.slice(0, 5).forEach(file => {
              const filePath = path.join(dirPath, file);
              const fileStats = fs.statSync(filePath);
              console.log(`       - ${file} (${fileStats.size} bytes)`);
            });
            if (files.length > 5) {
              console.log(`       ... and ${files.length - 5} more files`);
            }
          }
        }
      } catch (error) {
        console.log(`   └── Error reading directory: ${error.message}`);
      }
    }
  });
  
  console.log('\n=== File Access Test ===');
  // Test specific files from your error logs
  const testFiles = [
    'ad-1747488992042-914197259.jpeg',
    'ad-1749113049113-38010746.png',
    'ad-1747583179124-161752352.jpeg'
  ];
  
  testFiles.forEach(filename => {
    console.log(`\nTesting file: ${filename}`);
    
    const testPaths = [
      path.join(__dirname, 'public', 'uploads', 'ads', filename),
      path.join('/var/www/budgetbuddy/backend/public/uploads/ads', filename),
      path.join('/var/www/budgetbuddy/public/uploads/ads', filename),
    ];
    
    let found = false;
    testPaths.forEach(testPath => {
      const exists = fs.existsSync(testPath);
      console.log(`  ${exists ? '✅' : '❌'} ${testPath}`);
      if (exists && !found) {
        found = true;
        const stats = fs.statSync(testPath);
        console.log(`      Size: ${stats.size} bytes`);
        console.log(`      Modified: ${stats.mtime}`);
        console.log(`      Permissions: ${stats.mode.toString(8)}`);
      }
    });
    
    if (!found) {
      console.log(`  ❌ File not found in any expected location`);
    }
  });
  
  console.log('\n=== Recommendations ===');
  
  // Find the correct uploads directory
  const correctUploadsPath = possiblePaths.find(p => 
    p.includes('uploads/ads') && fs.existsSync(p)
  );
  
  if (correctUploadsPath) {
    console.log(`✅ Found uploads directory at: ${correctUploadsPath}`);
    console.log(`📝 Use this path in your Express static config:`);
    console.log(`   app.use('/uploads', express.static('${path.dirname(correctUploadsPath)}'));`);
  } else {
    console.log(`❌ No uploads directory found. You may need to:`);
    console.log(`   1. Check if files were uploaded to a different location`);
    console.log(`   2. Verify the upload functionality is working`);
    console.log(`   3. Check file permissions`);
  }
};

// Additional function to check Express static config
const testExpressStatic = () => {
  console.log('\n=== Express Static Config Test ===');
  
  const testConfigs = [
    { path: path.join(__dirname, 'public', 'uploads'), description: 'Current directory relative' },
    { path: '/var/www/budgetbuddy/backend/public/uploads', description: 'Hardcoded VPS path' },
    { path: '/var/www/budgetbuddy/public/uploads', description: 'Alternative VPS path' },
  ];
  
  testConfigs.forEach(config => {
    const exists = fs.existsSync(config.path);
    console.log(`${exists ? '✅' : '❌'} ${config.description}: ${config.path}`);
    
    if (exists) {
      const adsPath = path.join(config.path, 'ads');
      const adsExists = fs.existsSync(adsPath);
      console.log(`   └── ads subdirectory: ${adsExists ? '✅' : '❌'} ${adsPath}`);
      
      if (adsExists) {
        try {
          const files = fs.readdirSync(adsPath);
          console.log(`   └── Contains ${files.length} ad files`);
        } catch (error) {
          console.log(`   └── Error reading ads: ${error.message}`);
        }
      }
    }
  });
};

// Run the debug
console.log('Starting BudgetBuddy file structure debug...\n');
debugFileStructure();
testExpressStatic();

console.log('\n=== Debug Complete ===');
console.log('Save this output and use it to configure your static file serving correctly.');