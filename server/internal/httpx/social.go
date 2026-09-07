package httpx

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"kuvo/server/internal/store"
)

func (s *Server) listStories(c *gin.Context) {
	list, err := s.db.ListStories(c.Request.Context(), userID(c))
	if err != nil {
		Fail(c, http.StatusInternalServerError, "list_failed", err.Error())
		return
	}
	OK(c, gin.H{"stories": list})
}

type storyBody struct {
	Text      string `json:"text"`
	MediaURL  string `json:"media_url"`
	MediaKind string `json:"media_kind"`
}

func (s *Server) createStory(c *gin.Context) {
	var body storyBody
	if err := c.ShouldBindJSON(&body); err != nil {
		Fail(c, http.StatusBadRequest, "invalid_json", "invalid body")
		return
	}
	if strings.TrimSpace(body.Text) == "" && body.MediaURL == "" {
		Fail(c, http.StatusBadRequest, "invalid_json", "text or media required")
		return
	}
	st, err := s.db.CreateStory(c.Request.Context(), userID(c), body.Text, body.MediaURL, body.MediaKind)
	if err != nil {
		Fail(c, http.StatusInternalServerError, "create_failed", err.Error())
		return
	}
	OK(c, st)
}

type groupPatch struct {
	Title     string `json:"title"`
	AvatarURL string `json:"avatar_url"`
}

func (s *Server) renameGroup(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		Fail(c, http.StatusBadRequest, "invalid_id", "bad id")
		return
	}
	var body groupPatch
	if err := c.ShouldBindJSON(&body); err != nil {
		Fail(c, http.StatusBadRequest, "invalid_json", "invalid body")
		return
	}
	var conv store.Conversation
	if strings.TrimSpace(body.Title) != "" {
		conv, err = s.db.RenameGroup(c.Request.Context(), userID(c), id, body.Title)
		if err != nil {
			Fail(c, http.StatusForbidden, "rename_failed", err.Error())
			return
		}
	}
	if body.AvatarURL != "" || (strings.TrimSpace(body.Title) == "" && body.AvatarURL == "") {
		if body.AvatarURL != "" {
			conv, err = s.db.SetGroupPhoto(c.Request.Context(), userID(c), id, body.AvatarURL)
			if err != nil {
				Fail(c, http.StatusForbidden, "photo_failed", err.Error())
				return
			}
		}
	}
	if conv.ID == "" {
		Fail(c, http.StatusBadRequest, "invalid_json", "title or avatar_url required")
		return
	}
	OK(c, conv)
}

type memberBody struct {
	Username string `json:"username"`
	Role     string `json:"role"`
}

func (s *Server) addGroupMember(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		Fail(c, http.StatusBadRequest, "invalid_id", "bad id")
		return
	}
	var body memberBody
	if err := c.ShouldBindJSON(&body); err != nil || strings.TrimSpace(body.Username) == "" {
		Fail(c, http.StatusBadRequest, "invalid_json", "username or phone required")
		return
	}
	conv, err := s.db.AddGroupMember(c.Request.Context(), userID(c), id, body.Username)
	if err != nil {
		Fail(c, http.StatusForbidden, "add_failed", err.Error())
		return
	}
	OK(c, conv)
}

func (s *Server) setGroupRole(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		Fail(c, http.StatusBadRequest, "invalid_id", "bad id")
		return
	}
	var body memberBody
	if err := c.ShouldBindJSON(&body); err != nil || body.Username == "" {
		Fail(c, http.StatusBadRequest, "invalid_json", "username and role required")
		return
	}
	conv, err := s.db.SetGroupRole(c.Request.Context(), userID(c), id, body.Username, body.Role)
	if err != nil {
		Fail(c, http.StatusForbidden, "role_failed", err.Error())
		return
	}
	OK(c, conv)
}
