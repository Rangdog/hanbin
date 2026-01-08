import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'supply_chain_finance',
};

let connection;
let testResults = {
  passed: 0,
  failed: 0,
  tests: [],
};

function logTest(name, passed, message = '') {
  testResults.tests.push({ name, passed, message });
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}${message ? ': ' + message : ''}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}${message ? ': ' + message : ''}`);
  }
}

async function testDatabase() {
  console.log('\n📊 Testing Database Connection...\n');
  
  try {
    connection = await mysql.createConnection(dbConfig);
    logTest('Database Connection', true);
    
    // Test tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    const requiredTables = ['users', 'orders', 'risk_metrics', 'password_reset_tokens'];
    const allTablesExist = requiredTables.every(t => tableNames.includes(t));
    logTest('Required Tables Exist', allTablesExist, allTablesExist ? '' : `Missing: ${requiredTables.filter(t => !tableNames.includes(t)).join(', ')}`);
    
    // Test users count
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const userCount = users[0].count;
    logTest('Users Seeded', userCount >= 8, `Found ${userCount} users`);
    
    // Test orders count
    const [orders] = await connection.execute('SELECT COUNT(*) as count FROM orders');
    const orderCount = orders[0].count;
    logTest('Orders Seeded', orderCount >= 40, `Found ${orderCount} orders`);
    
    // Test risk metrics count
    const [metrics] = await connection.execute('SELECT COUNT(*) as count FROM risk_metrics');
    const metricsCount = metrics[0].count;
    logTest('Risk Metrics Seeded', metricsCount >= 8, `Found ${metricsCount} risk metrics`);
    
    // Test user has orders
    const [userOrders] = await connection.execute(
      'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
      ['user-001']
    );
    logTest('User Has Orders', userOrders[0].count >= 10, `User-001 has ${userOrders[0].count} orders`);
    
    await connection.end();
  } catch (error) {
    logTest('Database Connection', false, error.message);
    if (connection) await connection.end();
  }
}

async function testAPI() {
  console.log('\n🌐 Testing API Endpoints...\n');
  
  // Check if server is running
  let serverRunning = false;
  try {
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    if (healthResponse.ok) {
      serverRunning = true;
      const healthData = await healthResponse.json();
      logTest('Health Check', true, healthData.status);
    } else {
      logTest('Health Check', false, `Server returned ${healthResponse.status}`);
    }
  } catch (error) {
    logTest('Health Check', false, `Server not running: ${error.message}`);
    console.log('\n⚠️  Backend server is not running. Start it with: npm run dev:server\n');
    return;
  }
  
  if (!serverRunning) return;
  
  // Test register
  try {
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: 'Test Company',
        industry: 'Testing',
        email: `test${Date.now()}@test.com`,
        password: 'test123456',
      }),
    });
    const registerData = await registerResponse.json();
    logTest('Register Endpoint', registerResponse.ok && registerData.success, registerData.error || 'Success');
  } catch (error) {
    logTest('Register Endpoint', false, error.message);
  }
  
  // Test login with demo user
  try {
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'contact@techinnovations.com',
        password: 'password123',
      }),
    });
    const loginData = await loginResponse.json();
    logTest('Login Endpoint', loginResponse.ok && loginData.success, loginData.error || 'Success');
    
    if (loginData.success && loginData.token) {
      const token = loginData.token;
      const userId = loginData.user.id;
      
      // Test get orders
      try {
        const ordersResponse = await fetch(`${API_BASE_URL}/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Id': userId,
          },
        });
        const ordersData = await ordersResponse.json();
        logTest('Get Orders', ordersResponse.ok && Array.isArray(ordersData), `Found ${ordersData.length} orders`);
      } catch (error) {
        logTest('Get Orders', false, error.message);
      }
      
      // Test get user
      try {
        const userResponse = await fetch(`${API_BASE_URL}/user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Id': userId,
          },
        });
        const userData = await userResponse.json();
        logTest('Get User', userResponse.ok && userData.id, `User: ${userData.companyName}`);
      } catch (error) {
        logTest('Get User', false, error.message);
      }
      
      // Test get risk metrics
      try {
        const metricsResponse = await fetch(`${API_BASE_URL}/risk-metrics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Id': userId,
          },
        });
        const metricsData = await metricsResponse.json();
        logTest('Get Risk Metrics', metricsResponse.ok && metricsData.creditScore, `Credit Score: ${metricsData.creditScore}`);
      } catch (error) {
        logTest('Get Risk Metrics', false, error.message);
      }
    }
  } catch (error) {
    logTest('Login Endpoint', false, error.message);
  }
  
  // Test forgot password
  try {
    const forgotResponse = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'contact@techinnovations.com',
        resetUrl: 'http://localhost:5173/reset-password',
      }),
    });
    const forgotData = await forgotResponse.json();
    logTest('Forgot Password Endpoint', forgotResponse.ok && forgotData.success, forgotData.message || forgotData.error);
  } catch (error) {
    logTest('Forgot Password Endpoint', false, error.message);
  }
}

async function runTests() {
  console.log('🧪 Starting Project Tests...\n');
  console.log('=' .repeat(50));
  
  await testDatabase();
  await testAPI();
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📈 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.passed + testResults.failed}`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Project is ready to use.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
  
  process.exit(testResults.failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
