package store

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type Member struct {
	UserID    string `json:"user_id"`
	Name      string `json:"name"`
	Username  string `json:"username"`
	Role      string `json:"role"`
	Initials  string `json:"initials"`
	AvatarURL string `json:"avatar_url,omitempty"`
	Phone     string `json:"phone,omitempty"`
	Me        bool   `json:"me"`
}

type Conversation struct {
	ID        string    `json:"id"`
	Kind      string    `json:"kind"`
	Title     string    `json:"title"`
	Preview   string    `json:"preview"`
	Unread    int       `json:"unread"`
	AvatarURL string    `json:"avatar_url,omitempty"`
	Members   []Member  `json:"members"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Message struct {
	ID             string    `json:"id"`
	ConversationID string    `json:"conversation_id"`
	SenderID       string    `json:"sender_id"`
	SenderName     string    `json:"sender_name"`
	Kind           string    `json:"kind"`
	Text           string    `json:"text"`
	CreatedAt      time.Time `json:"created_at"`
	Mine           bool      `json:"from_me"`
	Seen           bool      `json:"seen"`
}

type GistPost struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Text      string    `json:"text"`
	ImageURL  string    `json:"image_url,omitempty"`
	MediaKind string    `json:"media_kind,omitempty"`
	Initials  string    `json:"initials"`
	CreatedAt time.Time `json:"created_at"`
}

type StoryPost struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Name      string    `json:"name"`
	Initials  string    `json:"initials"`
	Text      string    `json:"text"`
	MediaURL  string    `json:"media_url,omitempty"`
	MediaKind string    `json:"media_kind,omitempty"`
	IsYou     bool      `json:"is_you"`
	CreatedAt time.Time `json:"created_at"`
}

func (db *DB) ListConversations(ctx context.Context, userID uuid.UUID) ([]Conversation, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT c.id, c.kind, c.title, c.preview, c.updated_at,
			COALESCE((
				SELECT COUNT(*) FROM messages m
				WHERE m.conversation_id = c.id
				  AND m.created_at > COALESCE(cm.last_read_at, '-infinity'::timestamptz)
				  AND m.sender_id <> $1
				  AND (cm.cleared_at IS NULL OR m.created_at > cm.cleared_at)
			), 0)
		FROM conversations c
		JOIN conversation_members cm ON cm.conversation_id = c.id
		WHERE cm.user_id = $1
		ORDER BY c.updated_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]Conversation, 0)
	for rows.Next() {
		var c Conversation
		if err := rows.Scan(&c.ID, &c.Kind, &c.Title, &c.Preview, &c.UpdatedAt, &c.Unread); err != nil {
			return nil, err
		}
		members, _ := db.members(ctx, c.ID)
		c.Members = members
		if c.Kind == "direct" {
			c.Title = otherName(members, userID.String())
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

func (db *DB) members(ctx context.Context, convID string) ([]Member, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT u.id, COALESCE(NULLIF(p.full_name,''), COALESCE(p.username::text, 'User')),
			COALESCE(p.username::text, ''), cm.role, COALESCE(p.avatar_key, ''), u.phone_e164
		FROM conversation_members cm
		JOIN users u ON u.id = cm.user_id
		JOIN profiles p ON p.user_id = u.id
		WHERE cm.conversation_id = $1::uuid
	`, convID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []Member
	for rows.Next() {
		var m Member
		if err := rows.Scan(&m.UserID, &m.Name, &m.Username, &m.Role, &m.AvatarURL, &m.Phone); err != nil {
			return nil, err
		}
		m.Initials = initials(m.Name)
		out = append(out, m)
	}
	return out, rows.Err()
}

func otherName(members []Member, me string) string {
	for _, m := range members {
		if m.UserID != me {
			return m.Name
		}
	}
	if len(members) > 0 {
		return members[0].Name
	}
	return "Chat"
}

func (db *DB) CreateDirect(ctx context.Context, userID uuid.UUID, username string) (Conversation, error) {
	var other uuid.UUID
	err := db.Pool.QueryRow(ctx, `SELECT user_id FROM profiles WHERE username = $1`, username).Scan(&other)
	if err != nil {
		return Conversation{}, fmt.Errorf("user not found")
	}
	var existing string
	err = db.Pool.QueryRow(ctx, `
		SELECT c.id::text FROM conversations c
		JOIN conversation_members a ON a.conversation_id = c.id AND a.user_id = $1
		JOIN conversation_members b ON b.conversation_id = c.id AND b.user_id = $2
		WHERE c.kind = 'direct'
		LIMIT 1
	`, userID, other).Scan(&existing)
	if err == nil {
		return db.getConv(ctx, userID, existing)
	}
	id := uuid.New()
	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return Conversation{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	if _, err := tx.Exec(ctx, `INSERT INTO conversations (id, kind, title) VALUES ($1,'direct','')`, id); err != nil {
		return Conversation{}, err
	}
	if _, err := tx.Exec(ctx, `INSERT INTO conversation_members (conversation_id, user_id, role) VALUES ($1,$2,'member'),($1,$3,'member')`, id, userID, other); err != nil {
		return Conversation{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return Conversation{}, err
	}
	return db.getConv(ctx, userID, id.String())
}

func (db *DB) CreateGroup(ctx context.Context, userID uuid.UUID, title string, memberNames []string) (Conversation, error) {
	id := uuid.New()
	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return Conversation{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	if _, err := tx.Exec(ctx, `INSERT INTO conversations (id, kind, title, created_by) VALUES ($1,'group',$2,$3)`, id, title, userID); err != nil {
		return Conversation{}, err
	}
	if _, err := tx.Exec(ctx, `INSERT INTO conversation_members (conversation_id, user_id, role) VALUES ($1,$2,'owner')`, id, userID); err != nil {
		return Conversation{}, err
	}
	for _, name := range memberNames {
		var uid uuid.UUID
		err := tx.QueryRow(ctx, `SELECT user_id FROM profiles WHERE username = $1 OR full_name ILIKE $1 LIMIT 1`, name).Scan(&uid)
		if err != nil {
			continue
		}
		_, _ = tx.Exec(ctx, `INSERT INTO conversation_members (conversation_id, user_id, role) VALUES ($1,$2,'member') ON CONFLICT DO NOTHING`, id, uid)
	}
	if err := tx.Commit(ctx); err != nil {
		return Conversation{}, err
	}
	return db.getConv(ctx, userID, id.String())
}

func (db *DB) getConv(ctx context.Context, userID uuid.UUID, id string) (Conversation, error) {
	list, err := db.ListConversations(ctx, userID)
	if err != nil {
		return Conversation{}, err
	}
	for _, c := range list {
		if c.ID == id {
			return c, nil
		}
	}
	return Conversation{}, pgx.ErrNoRows
}

func (db *DB) LeaveConversation(ctx context.Context, userID, convID uuid.UUID) error {
	_, err := db.Pool.Exec(ctx, `DELETE FROM conversation_members WHERE conversation_id=$1 AND user_id=$2`, convID, userID)
	return err
}

func (db *DB) ListMessages(ctx context.Context, userID, convID uuid.UUID) ([]Message, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT m.id, m.conversation_id, m.sender_id,
			COALESCE(NULLIF(p.full_name,''),'User'), m.kind, m.text, m.created_at
		FROM messages m
		JOIN profiles p ON p.user_id = m.sender_id
		JOIN conversation_members cm ON cm.conversation_id = m.conversation_id AND cm.user_id = $1
		WHERE m.conversation_id = $2 AND m.deleted_at IS NULL
		  AND (cm.cleared_at IS NULL OR m.created_at > cm.cleared_at)
		ORDER BY m.created_at ASC
	`, userID, convID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]Message, 0)
	for rows.Next() {
		var m Message
		if err := rows.Scan(&m.ID, &m.ConversationID, &m.SenderID, &m.SenderName, &m.Kind, &m.Text, &m.CreatedAt); err != nil {
			return nil, err
		}
		m.Mine = m.SenderID == userID.String()
		out = append(out, m)
	}
	return out, rows.Err()
}

func (db *DB) AppendMessage(ctx context.Context, userID, convID uuid.UUID, kind, text string) (Message, error) {
	var m Message
	err := db.Pool.QueryRow(ctx, `
		INSERT INTO messages (conversation_id, sender_id, kind, text)
		SELECT $1, $2, $3, $4
		WHERE EXISTS (SELECT 1 FROM conversation_members WHERE conversation_id=$1 AND user_id=$2)
		RETURNING id, conversation_id, sender_id, kind, text, created_at
	`, convID, userID, kind, text).Scan(&m.ID, &m.ConversationID, &m.SenderID, &m.Kind, &m.Text, &m.CreatedAt)
	if err != nil {
		return Message{}, err
	}
	preview := text
	if kind != "text" {
		preview = kind
	}
	_, _ = db.Pool.Exec(ctx, `UPDATE conversations SET preview=$2, updated_at=now() WHERE id=$1`, convID, preview)
	m.Mine = true
	_ = db.Pool.QueryRow(ctx, `SELECT COALESCE(NULLIF(full_name,''),'You') FROM profiles WHERE user_id=$1`, userID).Scan(&m.SenderName)
	return m, nil
}

func (db *DB) MarkRead(ctx context.Context, userID, convID uuid.UUID) error {
	_, err := db.Pool.Exec(ctx, `UPDATE conversation_members SET last_read_at=now() WHERE conversation_id=$1 AND user_id=$2`, convID, userID)
	return err
}

func (db *DB) ClearChat(ctx context.Context, userID, convID uuid.UUID) error {
	_, err := db.Pool.Exec(ctx, `UPDATE conversation_members SET cleared_at=now() WHERE conversation_id=$1 AND user_id=$2`, convID, userID)
	return err
}

func (db *DB) ListGist(ctx context.Context) ([]GistPost, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT g.id, COALESCE(NULLIF(p.full_name,''),'Student'), g.text, COALESCE(g.image_url,''),
			upper(left(COALESCE(NULLIF(p.full_name,''),'S'),2)), g.created_at
		FROM gist_posts g JOIN profiles p ON p.user_id = g.user_id
		ORDER BY g.created_at DESC LIMIT 50
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]GistPost, 0)
	for rows.Next() {
		var g GistPost
		if err := rows.Scan(&g.ID, &g.Name, &g.Text, &g.ImageURL, &g.Initials, &g.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, g)
	}
	return out, rows.Err()
}

func (db *DB) LookupUsername(ctx context.Context, username string) (uuid.UUID, string, error) {
	var id uuid.UUID
	var name string
	err := db.Pool.QueryRow(ctx, `
		SELECT u.id, COALESCE(NULLIF(p.full_name,''), COALESCE(p.username,''))
		FROM profiles p JOIN users u ON u.id = p.user_id
		WHERE lower(p.username)=lower($1)
	`, strings.TrimSpace(username)).Scan(&id, &name)
	if err != nil {
		return uuid.Nil, "", fmt.Errorf("user not found")
	}
	return id, name, nil
}

func (db *DB) CreateGist(ctx context.Context, userID uuid.UUID, text, imageURL, mediaKind string) (GistPost, error) {
	var g GistPost
	err := db.Pool.QueryRow(ctx, `
		INSERT INTO gist_posts (user_id, text, image_url) VALUES ($1,$2,$3)
		RETURNING id, text, image_url, created_at
	`, userID, text, imageURL).Scan(&g.ID, &g.Text, &g.ImageURL, &g.CreatedAt)
	if err != nil {
		return GistPost{}, err
	}
	_ = db.Pool.QueryRow(ctx, `SELECT COALESCE(NULLIF(full_name,''),'You') FROM profiles WHERE user_id=$1`, userID).Scan(&g.Name)
	g.Initials = initials(g.Name)
	return g, nil
}

func (db *DB) ListStories(context.Context, uuid.UUID) ([]StoryPost, error) {
	return nil, nil
}
func (db *DB) CreateStory(context.Context, uuid.UUID, string, string, string) (StoryPost, error) {
	return StoryPost{}, fmt.Errorf("stories require memory store in this build")
}
func (db *DB) RenameGroup(context.Context, uuid.UUID, uuid.UUID, string) (Conversation, error) {
	return Conversation{}, fmt.Errorf("not in postgres yet")
}
func (db *DB) SetGroupPhoto(context.Context, uuid.UUID, uuid.UUID, string) (Conversation, error) {
	return Conversation{}, fmt.Errorf("not in postgres yet")
}
func (db *DB) AddGroupMember(context.Context, uuid.UUID, uuid.UUID, string) (Conversation, error) {
	return Conversation{}, fmt.Errorf("not in postgres yet")
}
func (db *DB) SetGroupRole(context.Context, uuid.UUID, uuid.UUID, string, string) (Conversation, error) {
	return Conversation{}, fmt.Errorf("not in postgres yet")
}
