import 'reflect-metadata';
import dotenv from 'dotenv';

// Load environment variables BEFORE importing modules that depend on them
dotenv.config();

import { AppDataSource } from './config/data-source';
import { createApp } from './app';

const PORT = Number(process.env.PORT || 4000);

const bootstrap = async () => {
  try {
    await AppDataSource.initialize();
    const app = createApp();

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

bootstrap();

