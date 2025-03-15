/**
 * This script is used to keep the application alive on Render.com
 * by periodically pinging the health endpoint.
 */

import { ping } from './ping';

// Set up interval for pinging
const pingInterval = parseInt(process.env.PING_INTERVAL || '300000', 10); // Default 5 minutes

ping();

setInterval(ping, pingInterval);

console.log('ping service started'.toLowerCase());

process.on('SIGINT', () => {
  console.log('ping service stopped'.toLowerCase());
  process.exit(0);
});
