import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseProviders } from './database.providers';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      synchronize: false,
      migrationsRun: false,
    }),
  ],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class AppModule {}
