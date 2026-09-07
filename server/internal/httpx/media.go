package httpx

import (
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func (s *Server) uploadMedia(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		Fail(c, http.StatusBadRequest, "invalid_file", "file required")
		return
	}
	if file.Size > 40<<20 {
		Fail(c, http.StatusRequestEntityTooLarge, "too_large", "max 40 MB")
		return
	}
	ext := strings.ToLower(filepath.Ext(file.Filename))
	kind := "image"
	switch ext {
	case ".jpg", ".jpeg", ".png", ".webp", ".gif":
		kind = "image"
	case ".mp4", ".mov", ".webm", ".m4v":
		kind = "video"
	case ".m4a", ".aac", ".mp3", ".wav", ".3gp":
		kind = "voice"
	case ".pdf":
		kind = "document"
	case "":
		ext = ".jpg"
		kind = "image"
	default:
		Fail(c, http.StatusBadRequest, "invalid_type", "unsupported file type")
		return
	}
	name := uuid.NewString() + ext
	src, err := file.Open()
	if err != nil {
		Fail(c, http.StatusBadRequest, "invalid_file", "could not read file")
		return
	}
	defer src.Close()
	body := make([]byte, file.Size)
	if _, err := io.ReadFull(src, body); err != nil && err != io.ErrUnexpectedEOF {
		Fail(c, http.StatusBadRequest, "invalid_file", "could not read file")
		return
	}
	mime := file.Header.Get("Content-Type")
	if mime == "" {
		mime = "application/octet-stream"
	}
	if s.r2 != nil && s.r2.Enabled() {
		url, err := s.r2.Put(c.Request.Context(), name, mime, body)
		if err != nil {
			Fail(c, http.StatusBadGateway, "r2_failed", err.Error())
			return
		}
		OK(c, gin.H{"id": name, "url": url, "kind": kind})
		return
	}
	if err := os.MkdirAll(s.mediaDir, 0o755); err != nil {
		Fail(c, http.StatusInternalServerError, "save_failed", "could not store file")
		return
	}
	dest := filepath.Join(s.mediaDir, name)
	if err := os.WriteFile(dest, body, 0o644); err != nil {
		Fail(c, http.StatusInternalServerError, "save_failed", "could not store file")
		return
	}
	OK(c, gin.H{"id": name, "url": "/v1/media/" + name, "kind": kind})
}

func (s *Server) getMedia(c *gin.Context) {
	name := filepath.Base(c.Param("name"))
	if name == "." || name == "" {
		Fail(c, http.StatusNotFound, "not_found", "missing")
		return
	}
	path := filepath.Join(s.mediaDir, name)
	if _, err := os.Stat(path); err != nil {
		Fail(c, http.StatusNotFound, "not_found", "missing")
		return
	}
	switch strings.ToLower(filepath.Ext(name)) {
	case ".jpg", ".jpeg":
		c.Header("Content-Type", "image/jpeg")
	case ".png":
		c.Header("Content-Type", "image/png")
	case ".webp":
		c.Header("Content-Type", "image/webp")
	case ".gif":
		c.Header("Content-Type", "image/gif")
	case ".mp4", ".m4v":
		c.Header("Content-Type", "video/mp4")
	case ".mov":
		c.Header("Content-Type", "video/quicktime")
	case ".m4a", ".aac":
		c.Header("Content-Type", "audio/mp4")
	case ".mp3":
		c.Header("Content-Type", "audio/mpeg")
	}
	c.Header("Cache-Control", "public, max-age=86400")
	c.File(path)
}
