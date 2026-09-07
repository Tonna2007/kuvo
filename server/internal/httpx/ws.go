package httpx

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"

	"kuvo/server/internal/ws"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func (s *Server) websocket(c *gin.Context) {
	if s.hub == nil {
		Fail(c, http.StatusServiceUnavailable, "ws_unavailable", "hub not ready")
		return
	}
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	client := ws.NewClient(userID(c), conn)
	s.hub.Add(client)
	go client.WriteLoop()
	defer func() {
		s.hub.Remove(client)
		_ = conn.Close()
	}()
	for {
		_, raw, err := conn.ReadMessage()
		if err != nil {
			return
		}
		var msg map[string]any
		if json.Unmarshal(raw, &msg) != nil {
			continue
		}
		if msg["t"] != "call" {
			continue
		}
		to, _ := msg["to_id"].(string)
		if to == "" {
			continue
		}
		msg["from_id"] = userID(c).String()
		s.hub.BroadcastJSON([]string{to}, msg)
	}
}
