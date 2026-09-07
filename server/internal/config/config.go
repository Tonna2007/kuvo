package config

import (
	"fmt"
	"os"
	"strings"
)

type Config struct {
	Env         string
	Store       string
	HTTPAddr    string
	DatabaseURL string
	RedisURL    string
	JWTSecret   string
	OTPPepper   string
	DevOTP      string
	CORSOrigins []string
	R2Account   string
	R2Access    string
	R2Secret    string
	R2Bucket    string
	R2Public    string
	TermiiKey   string
	TermiiFrom  string
	StrictOTP   bool
}

func Load() (Config, error) {
	loadDotEnv(".env")
	addr := getenv("HTTP_ADDR", ":8080")
	if p := os.Getenv("PORT"); p != "" {
		addr = ":" + p
	}
	storeName := getenv("APP_STORE", "memory")
	dbURL := os.Getenv("DATABASE_URL")
	if strings.Contains(dbURL, "supabase") && os.Getenv("APP_STORE") == "" {
		storeName = "postgres"
	}
	cfg := Config{
		Env:         getenv("APP_ENV", "dev"),
		Store:       storeName,
		HTTPAddr:    addr,
		DatabaseURL: dbURL,
		RedisURL:    getenv("REDIS_URL", "redis://localhost:6379/0"),
		JWTSecret:   getenv("JWT_SECRET", "dev-only-change-me"),
		OTPPepper:   getenv("OTP_PEPPER", "dev-only-pepper"),
		DevOTP:      getenv("DEV_OTP", "1234"),
		R2Account:   os.Getenv("R2_ACCOUNT_ID"),
		R2Access:    os.Getenv("R2_ACCESS_KEY_ID"),
		R2Secret:    os.Getenv("R2_SECRET_ACCESS_KEY"),
		R2Bucket:    getenv("R2_BUCKET", "kuvo-media"),
		R2Public:    os.Getenv("R2_PUBLIC_BASE"),
		TermiiKey:   os.Getenv("TERMII_API_KEY"),
		TermiiFrom:  getenv("TERMII_FROM", "Kuvo"),
		StrictOTP:   os.Getenv("STRICT_OTP") == "1",
	}
	origins := getenv("CORS_ORIGINS", "*")
	cfg.CORSOrigins = splitCSV(origins)
	if cfg.DatabaseURL == "" {
		cfg.DatabaseURL = "postgres://kuvo:kuvo@localhost:5432/kuvo?sslmode=disable"
	}
	if cfg.Env == "prod" && (cfg.JWTSecret == "dev-only-change-me" || cfg.OTPPepper == "dev-only-pepper") {
		return Config{}, fmt.Errorf("JWT_SECRET and OTP_PEPPER must be set in prod")
	}
	return cfg, nil
}

func (c Config) Dev() bool { return c.Env == "dev" }

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func splitCSV(s string) []string {
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}

func loadDotEnv(path string) {
	data, err := os.ReadFile(path)
	if err != nil {
		return
	}
	for _, line := range strings.Split(string(data), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		k, v, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		k = strings.TrimSpace(k)
		v = strings.Trim(strings.TrimSpace(v), `"'`)
		if os.Getenv(k) == "" {
			_ = os.Setenv(k, v)
		}
	}
}
