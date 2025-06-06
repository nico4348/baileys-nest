import { Injectable, Logger, Inject } from '@nestjs/common';
import Redis from 'ioredis';

export interface RateLimitResult {
  allowed: boolean;
  current: number;
  limit: number;
  resetTime: number;
  retryAfter?: number;
}

export interface SessionLimitConfig {
  sessionId: string;
  limit: number;
  window: number;
}

@Injectable()
export class SessionRateLimiter {
  private readonly logger = new Logger(SessionRateLimiter.name);
  private readonly redis: Redis;
  private readonly defaultLimit: number;
  private readonly defaultWindow: number;
  private limitCache = new Map<string, { limit: number; expires: number }>();

  constructor(
    @Inject('SessionsGetOneById')
    private readonly sessionsGetOneById: any,
  ) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      username: process.env.REDIS_USERNAME || 'default',
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
    });

    this.defaultLimit = parseInt(process.env.DEFAULT_RATE_LIMIT || '30');
    this.defaultWindow = 60; // 60 seconds
  }

  async canSend(sessionId: string): Promise<RateLimitResult> {
    const key = `rate_limit:${sessionId}`;
    const limit = await this.getSessionLimit(sessionId);
    
    try {
      const current = await this.redis.get(key);
      const currentCount = current ? parseInt(current) : 0;
      
      if (currentCount >= limit) {
        const ttl = await this.redis.ttl(key);
        const retryAfter = ttl > 0 ? ttl : this.defaultWindow;
        
        this.logger.warn(
          `Rate limit exceeded for session ${sessionId}: ${currentCount}/${limit}. Retry in ${retryAfter}s`
        );
        
        return {
          allowed: false,
          current: currentCount,
          limit,
          resetTime: Date.now() + (retryAfter * 1000),
          retryAfter,
        };
      }

      return {
        allowed: true,
        current: currentCount,
        limit,
        resetTime: Date.now() + (this.defaultWindow * 1000),
      };
    } catch (error) {
      this.logger.error(`Error checking rate limit for session ${sessionId}:`, error);
      return {
        allowed: true,
        current: 0,
        limit,
        resetTime: Date.now() + (this.defaultWindow * 1000),
      };
    }
  }

  async scheduleReset(sessionId: string): Promise<void> {
    const key = `rate_limit:${sessionId}`;
    const ttl = await this.redis.ttl(key);
    
    if (ttl > 0) {
      this.logger.debug(`Rate limit for session ${sessionId} will reset in ${ttl}s`);
      
      setTimeout(async () => {
        await this.redis.del(key);
        this.logger.log(`Rate limit reset for session ${sessionId}`);
      }, ttl * 1000);
    }
  }

  async increment(sessionId: string): Promise<number> {
    const key = `rate_limit:${sessionId}`;
    
    try {
      const pipeline = this.redis.pipeline();
      pipeline.incr(key);
      pipeline.expire(key, this.defaultWindow);
      const results = await pipeline.exec();
      
      if (!results || !results[0] || !results[0][1]) {
        throw new Error('Failed to increment rate limit counter');
      }
      
      const newCount = results[0][1] as number;
      
      this.logger.debug(
        `Rate limit incremented for session ${sessionId}: ${newCount}`
      );
      
      return newCount;
    } catch (error) {
      this.logger.error(`Error incrementing rate limit for session ${sessionId}:`, error);
      throw error;
    }
  }

  async reset(sessionId: string): Promise<void> {
    const key = `rate_limit:${sessionId}`;
    
    try {
      await this.redis.del(key);
      this.logger.debug(`Rate limit reset for session ${sessionId}`);
    } catch (error) {
      this.logger.error(`Error resetting rate limit for session ${sessionId}:`, error);
      throw error;
    }
  }

  async setSessionLimit(sessionId: string, limit: number): Promise<void> {
    const cacheKey = `session_limit:${sessionId}`;
    const expires = Date.now() + (5 * 60 * 1000); // Cache for 5 minutes
    
    this.limitCache.set(sessionId, { limit, expires });
    
    try {
      await this.redis.setex(cacheKey, 300, limit.toString()); // 5 minute TTL
      this.logger.debug(`Set rate limit for session ${sessionId}: ${limit}`);
    } catch (error) {
      this.logger.error(`Error setting rate limit for session ${sessionId}:`, error);
      throw error;
    }
  }

  async getSessionLimit(sessionId: string): Promise<number> {
    const cached = this.limitCache.get(sessionId);
    if (cached && cached.expires > Date.now()) {
      return cached.limit;
    }

    const cacheKey = `session_limit:${sessionId}`;
    
    try {
      // First check Redis cache
      const storedLimit = await this.redis.get(cacheKey);
      
      if (storedLimit) {
        const limit = parseInt(storedLimit);
        const expires = Date.now() + (5 * 60 * 1000);
        this.limitCache.set(sessionId, { limit, expires });
        return limit;
      }
      
      // If not in cache, get from database
      try {
        const session = await this.sessionsGetOneById.run(sessionId);
        if (session && session.rateLimit) {
          const limit = session.rateLimit;
          await this.setSessionLimit(sessionId, limit);
          return limit;
        }
      } catch (dbError) {
        this.logger.warn(`Could not get session from database: ${dbError.message}`);
      }
      
      // Fall back to default
      const limit = this.defaultLimit;
      await this.setSessionLimit(sessionId, limit);
      return limit;
    } catch (error) {
      this.logger.error(`Error getting rate limit for session ${sessionId}:`, error);
      return this.defaultLimit;
    }
  }

  async getRateLimitStats(sessionId: string): Promise<{
    current: number;
    limit: number;
    remaining: number;
    resetTime: number;
    percentage: number;
  }> {
    const key = `rate_limit:${sessionId}`;
    const limit = await this.getSessionLimit(sessionId);
    
    try {
      const current = await this.redis.get(key);
      const currentCount = current ? parseInt(current) : 0;
      const remaining = Math.max(0, limit - currentCount);
      const ttl = await this.redis.ttl(key);
      const resetTime = ttl > 0 ? Date.now() + (ttl * 1000) : Date.now() + (this.defaultWindow * 1000);
      const percentage = limit > 0 ? (currentCount / limit) * 100 : 0;
      
      return {
        current: currentCount,
        limit,
        remaining,
        resetTime,
        percentage,
      };
    } catch (error) {
      this.logger.error(`Error getting rate limit stats for session ${sessionId}:`, error);
      return {
        current: 0,
        limit,
        remaining: limit,
        resetTime: Date.now() + (this.defaultWindow * 1000),
        percentage: 0,
      };
    }
  }

  async getDelayUntilNextSlot(sessionId: string): Promise<number> {
    const result = await this.canSend(sessionId);
    
    if (result.allowed) {
      return 0;
    }
    
    return (result.retryAfter || 60) * 1000; // Return delay in milliseconds
  }

  async cleanup(): Promise<void> {
    this.limitCache.clear();
    await this.redis.disconnect();
  }
}