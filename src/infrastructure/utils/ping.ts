import https from 'https';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const pingInterval = parseInt(process.env.PING_INTERVAL || '300000', 10); // Default 5 minutes
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

export function ping() {
  console.log(`pinging ${baseUrl}/health at ${new Date().toISOString()}`);
  
  const httpModule = baseUrl.startsWith('https') ? https : http;
  
  const req = httpModule.get(`${baseUrl}/health`, (res) => {
    const { statusCode } = res;
    
    if (statusCode !== 200) {
      console.error(`ping failed with status code: ${statusCode}`);
      return;
    }
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`ping successful: ${data}`);
    });
  });
  
  req.on('error', (error) => {
    console.error(`ping failed: ${error.message}`);
  });
  
  req.end();
}

if (require.main === module) {
  console.log(`starting ping service for ${baseUrl}`);
  ping();
  setInterval(ping, pingInterval);
  
  process.on('SIGINT', () => {
    console.log('ping service stopped');
    process.exit(0);
  });
}
