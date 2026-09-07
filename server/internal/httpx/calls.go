package httpx

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type callBody struct {
	Username string `json:"username"`
	Action   string `json:"action"`
	CallID   string `json:"call_id"`
}

func (s *Server) startCall(c *gin.Context) {
	var body callBody
	if err := c.ShouldBindJSON(&body); err != nil || strings.TrimSpace(body.Username) == "" {
		Fail(c, http.StatusBadRequest, "invalid_json", "username required")
		return
	}
	action := body.Action
	if action == "" {
		action = "ring"
	}
	peerID, peerName, err := s.db.LookupUsername(c.Request.Context(), body.Username)
	if err != nil {
		Fail(c, http.StatusNotFound, "not_found", "user not found")
		return
	}
	meID := userID(c)
	if peerID == meID {
		Fail(c, http.StatusBadRequest, "invalid_call", "call someone else")
		return
	}
	callID := body.CallID
	if callID == "" {
		callID = uuid.NewString()
	}
	me, _ := s.db.GetMe(c.Request.Context(), meID)
	fromName := me.Profile.FullName
	if fromName == "" && me.Profile.Username != nil {
		fromName = *me.Profile.Username
	}
	if s.hub != nil {
		s.hub.BroadcastJSON([]string{peerID.String()}, gin.H{
			"t":         "call",
			"action":    action,
			"call_id":   callID,
			"from_id":   meID.String(),
			"from_name": fromName,
			"to_id":     peerID.String(),
		})
	}
	OK(c, gin.H{"call_id": callID, "peer_name": peerName, "peer_id": peerID.String(), "action": action})
}
