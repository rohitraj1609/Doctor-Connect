import { createServer } from 'http';
import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';

const httpServer = createServer(app);
initSocket(httpServer);

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error('\n╔══════════════════════════════════════════╗');
    console.error('║  MongoDB connection failed!               ║');
    console.error('╚══════════════════════════════════════════╝');
    console.error('Error:', err.message);
    console.error('\nFix: Make sure MongoDB is running:');
    console.error('  brew services start mongodb-community');
    console.error('  OR: mongod --dbpath /data/db');
    console.error('\nOr run: npm run setup');
    process.exit(1);
  }

  httpServer.listen(config.port, () => {
    console.log(`Server running on port ${config.port} [${config.nodeEnv}]`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n╔══════════════════════════════════════════╗`);
      console.error(`║  Port ${config.port} is already in use!            ║`);
      console.error(`╚══════════════════════════════════════════╝`);
      console.error(`\nFix: Kill the process using port ${config.port}:`);
      console.error(`  lsof -ti:${config.port} | xargs kill -9`);
      console.error(`\nThen restart: npm run dev`);
    } else {
      console.error('Server error:', err.message);
    }
    process.exit(1);
  });
}

start();
