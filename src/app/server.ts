// src/app/server.ts
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  
  setTimeout(() => process.exit(1), 1000); // Graceful exit with delay to ensure logs are flushed
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  
  setTimeout(() => process.exit(1), 1000); // Graceful exit with delay to ensure logs are flushed
});
