package cache

import (
	"context"
	"time"
)

type Cache interface {
	Ping(ctx context.Context) error
	Close() error
	SetOTP(ctx context.Context, e164, hash string, ttl time.Duration) error
	GetOTP(ctx context.Context, e164 string) (string, error)
	IncrTries(ctx context.Context, e164 string) (int64, error)
	DeleteOTP(ctx context.Context, e164 string)
	AllowOTPRequest(ctx context.Context, e164, ip string) error
}
