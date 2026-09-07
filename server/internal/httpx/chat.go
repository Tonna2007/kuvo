package httpx

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func (s *Server) listConversations(c *gin.Context) {
	list, err := s.db.ListConversations(c.Request.Context(), userID(c))
	if err != nil {
		Fail(c, http.StatusInternalServerError, "list_failed", err.Error())
		return
	}
	OK(c, gin.H{"conversations": list})
}

type directBody struct {
	Username string `json:"username"`
}

func (s *Server) createDirect(c *gin.Context) {
	var body directBody
	if err := c.ShouldBindJSON(&body); err != nil || body.Username == "" {
		Fail(c, http.StatusBadRequest, "invalid_json", "username required")
		return
	}
	conv, err := s.db.CreateDirect(c.Request.Context(), userID(c), body.Username)
	if err != nil {
		Fail(c, http.StatusNotFound, "not_found", err.Error())
		return
	}
	OK(c, conv)
}

type groupBody struct {
	Title     string   `json:"title"`
	Members   []string `json:"members"`
	AvatarURL string   `json:"avatar_url"`
}

func (s *Server) createGroup(c *gin.Context) {
	var body groupBody
	if err := c.ShouldBindJSON(&body); err != nil || body.Title == "" {
		Fail(c, http.StatusBadRequest, "invalid_json", "title required")
		return
	}
	conv, err := s.db.CreateGroup(c.Request.Context(), userID(c), body.Title, body.Members)
	if err != nil {
		Fail(c, http.StatusInternalServerError, "create_failed", err.Error())
		return
	}
	if strings.TrimSpace(body.AvatarURL) != "" {
		id, perr := uuid.Parse(conv.ID)
		if perr == nil {
			if next, perr := s.db.SetGroupPhoto(c.Request.Context(), userID(c), id, body.AvatarURL); perr == nil {
				conv = next
			}
		}
	}
	OK(c, conv)
}

func (s *Server) leaveConversation(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		Fail(c, http.StatusBadRequest, "invalid_id", "bad conversation id")
		return
	}
	if err := s.db.LeaveConversation(c.Request.Context(), userID(c), id); err != nil {
		Fail(c, http.StatusInternalServerError, "leave_failed", err.Error())
		return
	}
	OK(c, gin.H{"ok": true})
}

func (s *Server) listMessages(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		Fail(c, http.StatusBadRequest, "invalid_id", "bad conversation id")
		return
	}
	list, err := s.db.ListMessages(c.Request.Context(), userID(c), id)
	if err != nil {
		Fail(c, http.StatusNotFound, "not_found", "conversation not found")
		return
	}
	OK(c, gin.H{"messages": list})
}

type msgBody struct {
	Kind string `json:"kind"`
	Text string `json:"text"`
}

func (s *Server) sendMessage(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		Fail(c, http.StatusBadRequest, "invalid_id", "bad conversation id")
		return
	}
	var body msgBody
	if err := c.ShouldBindJSON(&body); err != nil || body.Text == "" {
		Fail(c, http.StatusBadRequest, "invalid_json", "text required")
		return
	}
	if body.Kind == "" {
		body.Kind = "text"
	}
	msg, err := s.db.AppendMessage(c.Request.Context(), userID(c), id, body.Kind, body.Text)
	if err != nil {
		Fail(c, http.StatusForbidden, "send_failed", err.Error())
		return
	}
	if s.hub != nil {
		conv, _ := s.db.ListConversations(c.Request.Context(), userID(c))
		ids := []string{}
		for _, cv := range conv {
			if cv.ID == id.String() {
				for _, m := range cv.Members {
					if m.UserID != userID(c).String() {
						ids = append(ids, m.UserID)
					}
				}
			}
		}
		s.hub.BroadcastJSON(ids, gin.H{"t": "message", "message": msg})
	}
	OK(c, msg)
}

func (s *Server) markRead(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		Fail(c, http.StatusBadRequest, "invalid_id", "bad conversation id")
		return
	}
	_ = s.db.MarkRead(c.Request.Context(), userID(c), id)
	if s.hub != nil {
		list, _ := s.db.ListConversations(c.Request.Context(), userID(c))
		ids := []string{}
		for _, cv := range list {
			if cv.ID == id.String() {
				for _, m := range cv.Members {
					if m.UserID != userID(c).String() {
						ids = append(ids, m.UserID)
					}
				}
			}
		}
		s.hub.BroadcastJSON(ids, gin.H{"t": "read", "conversation_id": id.String()})
	}
	OK(c, gin.H{"ok": true})
}

func (s *Server) clearChat(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		Fail(c, http.StatusBadRequest, "invalid_id", "bad conversation id")
		return
	}
	if err := s.db.ClearChat(c.Request.Context(), userID(c), id); err != nil {
		Fail(c, http.StatusInternalServerError, "clear_failed", err.Error())
		return
	}
	OK(c, gin.H{"ok": true})
}

func (s *Server) listGist(c *gin.Context) {
	list, err := s.db.ListGist(c.Request.Context())
	if err != nil {
		Fail(c, http.StatusInternalServerError, "list_failed", err.Error())
		return
	}
	OK(c, gin.H{"posts": list})
}

type gistBody struct {
	Text      string `json:"text"`
	ImageURL  string `json:"image_url"`
	MediaKind string `json:"media_kind"`
}

func (s *Server) createGist(c *gin.Context) {
	var body gistBody
	if err := c.ShouldBindJSON(&body); err != nil {
		Fail(c, http.StatusBadRequest, "invalid_json", "invalid body")
		return
	}
	if body.Text == "" && body.ImageURL == "" {
		Fail(c, http.StatusBadRequest, "invalid_json", "text or media required")
		return
	}
	post, err := s.db.CreateGist(c.Request.Context(), userID(c), body.Text, body.ImageURL, body.MediaKind)
	if err != nil {
		Fail(c, http.StatusInternalServerError, "create_failed", err.Error())
		return
	}
	OK(c, post)
}
