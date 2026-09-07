package cache

import (
	"context"
	"fmt"
	"sync"
	"time"
)

type memItem struct {
	val string
	exp time.Time
	n   int64
}

type Memory struct {
	mu    sync.Mutex
	otp   map[string]memItem
	tries map[string]memItem
	rl    map[string]memItem
}

func NewMemory() *Memory {
	return &Memory{
		otp:   map[string]memItem{},
		tries: map[string]memItem{},
		rl:    map[string]memItem{},
	}
}

func (m *Memory) Ping(context.Context) error { return nil }
func (m *Memory) Close() error               { return nil }

func (m *Memory) SetOTP(_ context.Context, e164, hash string, ttl time.Duration) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.otp[e164] = memItem{val: hash, exp: time.Now().Add(ttl)}
	delete(m.tries, e164)
	return nil
}

func (m *Memory) GetOTP(_ context.Context, e164 string) (string, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	it, ok := m.otp[e164]
	if !ok || time.Now().After(it.exp) {
		delete(m.otp, e164)
		return "", nil
	}
	return it.val, nil
}

func (m *Memory) IncrTries(_ context.Context, e164 string) (int64, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	it := m.tries[e164]
	if it.exp.IsZero() || time.Now().After(it.exp) {
		it = memItem{n: 0, exp: time.Now().Add(5 * time.Minute)}
	}
	it.n++
	m.tries[e164] = it
	return it.n, nil
}

func (m *Memory) DeleteOTP(_ context.Context, e164 string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.otp, e164)
	delete(m.tries, e164)
}

func (m *Memory) AllowOTPRequest(_ context.Context, e164, ip string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if err := m.hit("phone:"+e164, 5, time.Hour); err != nil {
		return err
	}
	if ip != "" {
		if err := m.hit("ip:"+ip, 20, time.Hour); err != nil {
			return err
		}
	}
	return nil
}

func (m *Memory) hit(key string, limit int64, window time.Duration) error {
	it := m.rl[key]
	if it.exp.IsZero() || time.Now().After(it.exp) {
		it = memItem{n: 0, exp: time.Now().Add(window)}
	}
	it.n++
	m.rl[key] = it
	if it.n > limit {
		return fmt.Errorf("rate limited")
	}
	return nil
}
