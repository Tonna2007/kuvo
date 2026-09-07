package httpx

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"kuvo/server/internal/auth"
	"kuvo/server/internal/cache"
	"kuvo/server/internal/config"
	"kuvo/server/internal/media"
	"kuvo/server/internal/store"
	"kuvo/server/internal/ws"
)

type Server struct {
	cfg      config.Config
	db       store.Store
	cache    cache.Cache
	hub      *ws.Hub
	mediaDir string
	r2       *media.R2
}

func New(cfg config.Config, db store.Store, rdb cache.Cache, hub *ws.Hub) *gin.Engine {
	if !cfg.Dev() {
		gin.SetMode(gin.ReleaseMode)
	}
	mediaDir := filepath.Join("data", "media")
	_ = os.MkdirAll(mediaDir, 0o755)
	s := &Server{cfg: cfg, db: db, cache: rdb, hub: hub, mediaDir: mediaDir}
	if cfg.R2Account != "" && cfg.R2Access != "" && cfg.R2Secret != "" {
		s.r2 = &media.R2{
			Account: cfg.R2Account,
			Access:  cfg.R2Access,
			Secret:  cfg.R2Secret,
			Bucket:  cfg.R2Bucket,
			Public:  cfg.R2Public,
		}
	}
	r := gin.New()
	r.Use(gin.Recovery(), gin.Logger())
	corsCfg := cors.Config{
		AllowMethods:     []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	if len(cfg.CORSOrigins) == 1 && cfg.CORSOrigins[0] == "*" {
		corsCfg.AllowAllOrigins = true
		corsCfg.AllowCredentials = false
	} else {
		corsCfg.AllowOrigins = cfg.CORSOrigins
	}
	r.Use(cors.New(corsCfg))

	v1 := r.Group("/v1")
	v1.GET("/health", s.health)
	v1.GET("/campuses", s.listCampuses)
	v1.GET("/media/:name", s.getMedia)

	authg := v1.Group("/auth")
	authg.POST("/otp/request", s.requestOTP)
	authg.POST("/otp/verify", s.verifyOTP)
	authg.POST("/refresh", s.refresh)

	me := v1.Group("")
	me.Use(s.requireAuth())
	me.GET("/me", s.getMe)
	me.PATCH("/me", s.patchMe)
	me.POST("/me/campus", s.setCampus)
	me.POST("/campuses/requests", s.requestCampus)
	me.GET("/conversations", s.listConversations)
	me.POST("/conversations/direct", s.createDirect)
	me.POST("/conversations/groups", s.createGroup)
	me.GET("/conversations/:id/messages", s.listMessages)
	me.POST("/conversations/:id/messages", s.sendMessage)
	me.POST("/conversations/:id/read", s.markRead)
	me.POST("/conversations/:id/clear", s.clearChat)
	me.POST("/conversations/:id/leave", s.leaveConversation)
	me.GET("/gist", s.listGist)
	me.POST("/gist", s.createGist)
	me.POST("/media", s.uploadMedia)
	me.POST("/calls", s.startCall)
	me.GET("/stories", s.listStories)
	me.POST("/stories", s.createStory)
	me.PATCH("/conversations/:id", s.renameGroup)
	me.POST("/conversations/:id/members", s.addGroupMember)
	me.POST("/conversations/:id/role", s.setGroupRole)
	me.GET("/ws", s.websocket)

	return r
}

func (s *Server) health(c *gin.Context) {
	ctx := c.Request.Context()
	dbErr := s.db.Ping(ctx)
	cacheErr := s.cache.Ping(ctx)
	status := http.StatusOK
	if dbErr != nil || cacheErr != nil {
		status = http.StatusServiceUnavailable
	}
	c.JSON(status, gin.H{
		"ok":      dbErr == nil && cacheErr == nil,
		"service": "kuvo-api",
		"store":   s.cfg.Store,
	})
}

func (s *Server) requireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		h := c.GetHeader("Authorization")
		raw := strings.TrimPrefix(h, "Bearer ")
		if raw == "" || raw == h {
			raw = c.Query("access_token")
		}
		if raw == "" {
			Fail(c, http.StatusUnauthorized, "unauthorized", "missing bearer token")
			return
		}
		claims, err := auth.ParseAccess(s.cfg.JWTSecret, raw)
		if err != nil {
			Fail(c, http.StatusUnauthorized, "unauthorized", "invalid token")
			return
		}
		id, err := uuid.Parse(claims.UserID)
		if err != nil {
			Fail(c, http.StatusUnauthorized, "unauthorized", "invalid token")
			return
		}
		c.Set("userID", id)
		c.Next()
	}
}

func userID(c *gin.Context) uuid.UUID {
	v, _ := c.Get("userID")
	id, _ := v.(uuid.UUID)
	return id
}
