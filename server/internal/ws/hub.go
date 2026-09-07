package ws

import (
	"encoding/json"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type Client struct {
	UserID uuid.UUID
	conn   *websocket.Conn
	send   chan []byte
}

type Hub struct {
	mu    sync.Mutex
	conns map[uuid.UUID]map[*Client]struct{}
}

func NewHub() *Hub {
	return &Hub{conns: map[uuid.UUID]map[*Client]struct{}{}}
}

func (h *Hub) Add(c *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	set, ok := h.conns[c.UserID]
	if !ok {
		set = map[*Client]struct{}{}
		h.conns[c.UserID] = set
	}
	set[c] = struct{}{}
}

func (h *Hub) Remove(c *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if set, ok := h.conns[c.UserID]; ok {
		delete(set, c)
		if len(set) == 0 {
			delete(h.conns, c.UserID)
		}
	}
	close(c.send)
}

func (h *Hub) BroadcastJSON(userIDs []string, payload any) {
	b, err := json.Marshal(payload)
	if err != nil {
		return
	}
	h.mu.Lock()
	defer h.mu.Unlock()
	for _, id := range userIDs {
		uid, err := uuid.Parse(id)
		if err != nil {
			continue
		}
		for c := range h.conns[uid] {
			select {
			case c.send <- b:
			default:
			}
		}
	}
}

func NewClient(userID uuid.UUID, conn *websocket.Conn) *Client {
	return &Client{UserID: userID, conn: conn, send: make(chan []byte, 16)}
}

func (c *Client) WriteLoop() {
	for msg := range c.send {
		_ = c.conn.WriteMessage(websocket.TextMessage, msg)
	}
}

func (c *Client) Conn() *websocket.Conn { return c.conn }
