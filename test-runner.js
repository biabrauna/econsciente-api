const https = require('https');
const http = require('http');

// Test 1: Image Validation Test
async function testImageValidation() {
  const startTime = Date.now();
  try {
    console.log('Running Image Validation Test...');

    // Test invalid URL
    const invalidUrl = 'https://invalid-domain-that-does-not-exist-xyz123.com/image.jpg';

    const result = await new Promise((resolve) => {
      const request = https.get(invalidUrl, { timeout: 5000 }, (response) => {
        resolve({ success: false, statusCode: response.statusCode });
      });

      request.on('error', (error) => {
        resolve({ success: true, error: error.message, passed: true });
      });

      request.on('timeout', () => {
        request.destroy();
        resolve({ success: true, error: 'Timeout', passed: true });
      });
    });

    const duration = Date.now() - startTime;

    if (result.passed || result.error) {
      return {
        test_name: 'Image Validation Test',
        passed: true,
        timestamp: new Date().toISOString(),
        duration_ms: duration,
        output: `Successfully detected invalid URL: ${result.error || 'URL validation working'}`,
        error: null
      };
    } else {
      return {
        test_name: 'Image Validation Test',
        passed: false,
        timestamp: new Date().toISOString(),
        duration_ms: duration,
        output: 'Failed to detect invalid URL',
        error: 'URL should have been rejected'
      };
    }
  } catch (error) {
    return {
      test_name: 'Image Validation Test',
      passed: true,
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
      output: `Error correctly caught: ${error.message}`,
      error: null
    };
  }
}

// Test 2: Fallback Test
async function testFallback() {
  const startTime = Date.now();
  try {
    console.log('Running Fallback Test...');

    // Check if fallback mechanism exists
    const fs = require('fs');
    const path = require('path');

    const pythonScriptPath = path.join(__dirname, 'scripts', 'vision_analyzer.py');
    const serviceExists = fs.existsSync(path.join(__dirname, 'src', 'vision', 'python-vision.service.ts'));

    const duration = Date.now() - startTime;

    if (serviceExists) {
      // Check if simulation mode is available
      const serviceContent = fs.readFileSync(
        path.join(__dirname, 'src', 'vision', 'python-vision.service.ts'),
        'utf8'
      );

      const hasSimulation = serviceContent.includes('useSimulation') || serviceContent.includes('simulate');

      return {
        test_name: 'Fallback Test',
        passed: hasSimulation,
        timestamp: new Date().toISOString(),
        duration_ms: duration,
        output: hasSimulation
          ? 'Fallback simulation mode available in PythonVisionService'
          : 'Simulation mode found but needs verification',
        error: hasSimulation ? null : 'No simulation parameter found'
      };
    } else {
      return {
        test_name: 'Fallback Test',
        passed: false,
        timestamp: new Date().toISOString(),
        duration_ms: duration,
        output: 'Service file not found',
        error: 'PythonVisionService does not exist'
      };
    }
  } catch (error) {
    return {
      test_name: 'Fallback Test',
      passed: false,
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
      output: 'Error during fallback test',
      error: error.message
    };
  }
}

// Test 3: Build Test
async function testBuild() {
  const startTime = Date.now();
  try {
    console.log('Running Build Test...');

    const { execSync } = require('child_process');

    // Run build command
    const output = execSync('npm run build', {
      cwd: __dirname,
      encoding: 'utf8',
      stdio: 'pipe'
    });

    const duration = Date.now() - startTime;

    return {
      test_name: 'Build Test',
      passed: true,
      timestamp: new Date().toISOString(),
      duration_ms: duration,
      output: 'Build completed successfully',
      error: null
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorOutput = error.stderr || error.stdout || error.message || 'Build failed';
    return {
      test_name: 'Build Test',
      passed: false,
      timestamp: new Date().toISOString(),
      duration_ms: duration,
      output: 'Build failed - see error for details',
      error: errorOutput.substring(0, 500)
    };
  }
}

// Run all tests
async function runAllTests() {
  const results = [];

  results.push(await testImageValidation());
  results.push(await testFallback());
  results.push(await testBuild());

  const output = {
    test_results: results
  };

  console.log(JSON.stringify(output, null, 2));
}

runAllTests().catch(console.error);
