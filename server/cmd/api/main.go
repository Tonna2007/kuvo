package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"kuvo/server/internal/cache"
	"kuvo/server/internal/config"
	"kuvo/server/internal/httpx"
	"kuvo/server/internal/store"
	"kuvo/server/internal/ws"
)

func main() {
	log := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(log)

	cfg, err := config.Load()
	if err != nil {
		slog.Error("config", "err", err)
		os.Exit(1)
	}

	ctx := context.Background()
	var db store.Store
	var rdb cache.Cache

	if cfg.Store == "memory" {
		slog.Info("using in-memory store (no Docker, no cloud APIs)")
		db = store.NewMemory()
		rdb = cache.NewMemory()
	} else {
		pg, err := store.Connect(ctx, cfg.DatabaseURL)
		if err != nil {
			slog.Error("postgres", "err", err)
			os.Exit(1)
		}
		defer pg.Close()
		if err := pg.Migrate(ctx, ""); err != nil {
			slog.Error("migrate", "err", err)
			os.Exit(1)
		}
		db = pg
		if cfg.RedisURL == "" || cfg.RedisURL == "redis://localhost:6379/0" {
			slog.Info("redis not configured, using in-process cache")
			rdb = cache.NewMemory()
		} else {
			rc, err := cache.Connect(cfg.RedisURL)
			if err != nil {
				slog.Warn("redis unavailable, using in-process cache", "err", err)
				rdb = cache.NewMemory()
			} else {
				defer rc.Close()
				rdb = rc
			}
		}
	}

	engine := httpx.New(cfg, db, rdb, ws.NewHub())
	srv := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           engine,
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		slog.Info("listening", "addr", cfg.HTTPAddr, "env", cfg.Env, "store", cfg.Store)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("http", "err", err)
			os.Exit(1)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop
	shutdown, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = srv.Shutdown(shutdown)
}
