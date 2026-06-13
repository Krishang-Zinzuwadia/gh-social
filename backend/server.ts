import 'dotenv/config';

console.log('PORT from env =', process.env.PORT);


import app from './app.js';

const port: number = parseInt(process.env.PORT ?? '5000', 10);

const server = app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});

// Graceful shutdown
function shutdown(): void {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
