import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StatusSeeder } from './lib/Status/infrastructure/StatusSeeder';
import 'reflect-metadata';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ejecutar seeder de status
  const statusSeeder = app.get(StatusSeeder);
  await statusSeeder.seed();

  // Manejo global de errores no capturados
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // No terminar el proceso, solo loggear el error
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // No terminar el proceso, solo loggear el error
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Server running on port ${process.env.PORT ?? 3000}`);
}

bootstrap().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});
