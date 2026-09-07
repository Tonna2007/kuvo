package cache

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type Redis struct {
	rdb *redis.Client
}

func Connect(url string) (*Redis, error) {
	opt, err := redis.ParseURL(url)
	if err != nil {
		return nil, err
	}
	rdb := redis.NewClient(opt)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("redis: %w", err)
	}
	return &Redis{rdb: rdb}, nil
}

func (r *Redis) Close() error { return r.rdb.Close() }

func (r *Redis) SetOTP(ctx context.Context, e164, hash string, ttl time.Duration) error {
	pipe := r.rdb.TxPipeline()
	pipe.Set(ctx, "otp:"+e164, hash, ttl)
	pipe.Del(ctx, "otp:tries:"+e164)
	_, err := pipe.Exec(ctx)
	return err
}

func (r *Redis) GetOTP(ctx context.Context, e164 string) (string, error) {
	v, err := r.rdb.Get(ctx, "otp:"+e164).Result()
	if err == redis.Nil {
		return "", nil
	}
	return v, err
}

func (r *Redis) IncrTries(ctx context.Context, e164 string) (int64, error) {
	key := "otp:tries:" + e164
	n, err := r.rdb.Incr(ctx, key).Result()
	if err != nil {
		return 0, err
	}
	if n == 1 {
		_ = r.rdb.Expire(ctx, key, 5*time.Minute).Err()
	}
	return n, nil
}

func (r *Redis) DeleteOTP(ctx context.Context, e164 string) {
	_ = r.rdb.Del(ctx, "otp:"+e164, "otp:tries:"+e164).Err()
}

func (r *Redis) AllowOTPRequest(ctx context.Context, e164, ip string) error {
	if err := hit(ctx, r.rdb, "rl:otp:phone:"+e164, 5, time.Hour); err != nil {
		return err
	}
	if ip != "" {
		if err := hit(ctx, r.rdb, "rl:otp:ip:"+ip, 20, time.Hour); err != nil {
			return err
		}
	}
	return nil
}

func hit(ctx context.Context, rdb *redis.Client, key string, limit int64, window time.Duration) error {
	n, err := rdb.Incr(ctx, key).Result()
	if err != nil {
		return err
	}
	if n == 1 {
		_ = rdb.Expire(ctx, key, window).Err()
	}
	if n > limit {
		return fmt.Errorf("rate limited")
	}
	return nil
}

func (r *Redis) Ping(ctx context.Context) error {
	return r.rdb.Ping(ctx).Err()
}
