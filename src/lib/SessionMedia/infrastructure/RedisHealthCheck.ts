import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisHealthCheck {
  async testConnection(): Promise<{ status: string; error?: string }> {
    let client: any = null;
    
    try {
      console.log('Attempting to connect to Redis...');
      
      client = createClient({
        username: process.env.REDIS_USERNAME || 'default',
        password: process.env.REDIS_PASSWORD,
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379,
        }
      });

      console.log('Redis client created, attempting to connect...');
      await client.connect();
      
      console.log('Connected! Testing ping...');
      const pong = await client.ping();
      console.log('Ping response:', pong);
      
      await client.disconnect();
      
      return { status: 'Redis connection successful' };
    } catch (error) {
      console.error('Redis connection failed:', error);
      return { 
        status: 'Redis connection failed', 
        error: error.message 
      };
    } finally {
      if (client) {
        try {
          await client.disconnect();
        } catch (e) {
          console.warn('Error disconnecting from Redis:', e);
        }
      }
    }
  }
}