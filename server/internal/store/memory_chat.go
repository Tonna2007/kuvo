package store

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type memConv struct {
	Conversation
	MemberIDs []uuid.UUID
	Roles     map[uuid.UUID]string
	ReadAt    map[uuid.UUID]time.Time
	Cleared   map[uuid.UUID]time.Time
}

func (m *Memory) ensureChatMaps() {
	if m.convs == nil {
		m.convs = map[uuid.UUID]*memConv{}
		m.msgs = map[uuid.UUID][]Message{}
		m.gist = []GistPost{}
		m.stories = []StoryPost{}
		m.byUsername = map[string]uuid.UUID{}
	}
}

func (m *Memory) ListConversations(_ context.Context, userID uuid.UUID) ([]Conversation, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.ensureChatMaps()
	out := make([]Conversation, 0)
	for _, c := range m.convs {
		if !containsID(c.MemberIDs, userID) {
			continue
		}
		cp := c.Conversation
		cp.Members = m.memberViews(c)
		for i := range cp.Members {
			cp.Members[i].Me = cp.Members[i].UserID == userID.String()
		}
		if cp.Kind == "direct" {
			if len(uniqueIDs(c.MemberIDs)) == 1 {
				cp.Title = "You"
			} else {
				cp.Title = otherName(cp.Members, userID.String())
			}
		}
		unread := 0
		readAt := c.ReadAt[userID]
		cid, _ := uuid.Parse(c.ID)
		for _, msg := range m.msgs[cid] {
			if msg.SenderID != userID.String() && msg.CreatedAt.After(readAt) {
				if t, ok := c.Cleared[userID]; !ok || msg.CreatedAt.After(t) {
					unread++
				}
			}
		}
		cp.Unread = unread
		out = append(out, cp)
	}
	return out, nil
}

func (m *Memory) memberViews(c *memConv) []Member {
	out := make([]Member, 0, len(c.MemberIDs))
	for _, id := range c.MemberIDs {
		u := m.users[id]
		if u == nil {
			continue
		}
		name := u.Profile.FullName
		if name == "" && u.Profile.Username != nil {
			name = *u.Profile.Username
		}
		if name == "" {
			name = "User"
		}
		uname := ""
		if u.Profile.Username != nil {
			uname = *u.Profile.Username
		}
		avatar := ""
		if u.Profile.AvatarKey != nil {
			avatar = *u.Profile.AvatarKey
		}
		out = append(out, Member{
			UserID: id.String(), Name: name, Username: uname,
			Role: c.Roles[id], Initials: initials(name),
			AvatarURL: avatar, Phone: u.PhoneE164,
		})
	}
	return out
}

func uniqueIDs(ids []uuid.UUID) []uuid.UUID {
	seen := map[uuid.UUID]struct{}{}
	out := make([]uuid.UUID, 0, len(ids))
	for _, id := range ids {
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		out = append(out, id)
	}
	return out
}

func containsID(ids []uuid.UUID, id uuid.UUID) bool {
	for _, x := range ids {
		if x == id {
			return true
		}
	}
	return false
}

func (m *Memory) LookupUsername(_ context.Context, username string) (uuid.UUID, string, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	id, ok := m.lookupUser(username)
	if !ok {
		return uuid.Nil, "", fmt.Errorf("user not found")
	}
	name := "User"
	if u := m.users[id]; u != nil {
		if u.Profile.FullName != "" {
			name = u.Profile.FullName
		} else if u.Profile.Username != nil {
			name = *u.Profile.Username
		}
	}
	return id, name, nil
}

func (m *Memory) CreateDirect(_ context.Context, userID uuid.UUID, username string) (Conversation, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.ensureChatMaps()
	self := strings.EqualFold(strings.TrimSpace(username), "me") || strings.EqualFold(strings.TrimSpace(username), "you")
	var other uuid.UUID
	if self {
		other = userID
	} else {
		id, ok := m.lookupUser(username)
		if !ok {
			return Conversation{}, fmt.Errorf("user not found")
		}
		other = id
	}
	for _, c := range m.convs {
		if c.Kind != "direct" || !containsID(c.MemberIDs, userID) {
			continue
		}
		if other == userID {
			if len(uniqueIDs(c.MemberIDs)) == 1 {
				cp := c.Conversation
				cp.Members = m.memberViews(c)
				cp.Title = "You"
				return cp, nil
			}
			continue
		}
		if containsID(c.MemberIDs, other) {
			cp := c.Conversation
			cp.Members = m.memberViews(c)
			cp.Title = otherName(cp.Members, userID.String())
			return cp, nil
		}
	}
	id := uuid.New()
	members := []uuid.UUID{userID}
	if other != userID {
		members = append(members, other)
	}
	title := ""
	if other == userID {
		title = "You"
	}
	c := &memConv{
		Conversation: Conversation{ID: id.String(), Kind: "direct", Title: title, UpdatedAt: time.Now()},
		MemberIDs:    members,
		Roles:        map[uuid.UUID]string{userID: "member", other: "member"},
		ReadAt:       map[uuid.UUID]time.Time{},
		Cleared:      map[uuid.UUID]time.Time{},
	}
	m.convs[id] = c
	cp := c.Conversation
	cp.Members = m.memberViews(c)
	cp.Title = otherName(cp.Members, userID.String())
	return cp, nil
}

func digitsOnly(s string) string {
	out := make([]rune, 0, len(s))
	for _, r := range s {
		if r >= '0' && r <= '9' {
			out = append(out, r)
		}
	}
	return string(out)
}

func (m *Memory) lookupUser(name string) (uuid.UUID, bool) {
	n := strings.ToLower(strings.TrimSpace(name))
	if id, ok := m.byUsername[n]; ok {
		return id, true
	}
	digits := digitsOnly(n)
	for id, u := range m.users {
		if u.Profile.Username != nil && strings.ToLower(*u.Profile.Username) == n {
			return id, true
		}
		if strings.ToLower(u.Profile.FullName) == n {
			return id, true
		}
		if len(digits) >= 7 {
			phone := digitsOnly(u.PhoneE164)
			if strings.HasSuffix(phone, digits) || (len(phone) >= 10 && strings.HasSuffix(digits, phone[len(phone)-10:])) {
				return id, true
			}
		}
		if len(n) >= 3 && strings.HasPrefix(strings.ToLower(u.Profile.FullName), n) {
			return id, true
		}
	}
	return uuid.Nil, false
}

func (m *Memory) CreateGroup(_ context.Context, userID uuid.UUID, title string, memberNames []string) (Conversation, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.ensureChatMaps()
	id := uuid.New()
	ids := []uuid.UUID{userID}
	roles := map[uuid.UUID]string{userID: "owner"}
	for _, name := range memberNames {
		if oid, ok := m.lookupUser(name); ok && oid != userID {
			ids = append(ids, oid)
			roles[oid] = "member"
		}
	}
	c := &memConv{
		Conversation: Conversation{ID: id.String(), Kind: "group", Title: title, UpdatedAt: time.Now(), Preview: "You created this group"},
		MemberIDs:    ids,
		Roles:        roles,
		ReadAt:       map[uuid.UUID]time.Time{},
		Cleared:      map[uuid.UUID]time.Time{},
	}
	m.convs[id] = c
	cp := c.Conversation
	cp.Members = m.memberViews(c)
	return cp, nil
}

func (m *Memory) LeaveConversation(_ context.Context, userID, convID uuid.UUID) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	c, ok := m.convs[convID]
	if !ok {
		return pgx.ErrNoRows
	}
	next := make([]uuid.UUID, 0)
	for _, id := range c.MemberIDs {
		if id != userID {
			next = append(next, id)
		}
	}
	c.MemberIDs = next
	return nil
}

func (m *Memory) ListMessages(_ context.Context, userID, convID uuid.UUID) ([]Message, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.ensureChatMaps()
	c, ok := m.convs[convID]
	if !ok || !containsID(c.MemberIDs, userID) {
		return nil, pgx.ErrNoRows
	}
	out := make([]Message, 0)
	cleared := c.Cleared[userID]
	peerRead := time.Time{}
	for id, t := range c.ReadAt {
		if id != userID && t.After(peerRead) {
			peerRead = t
		}
	}
	for _, msg := range m.msgs[convID] {
		if !cleared.IsZero() && !msg.CreatedAt.After(cleared) {
			continue
		}
		cp := msg
		cp.Mine = msg.SenderID == userID.String()
		cp.Seen = cp.Mine && !peerRead.IsZero() && !cp.CreatedAt.After(peerRead)
		out = append(out, cp)
	}
	return out, nil
}

func (m *Memory) AppendMessage(_ context.Context, userID, convID uuid.UUID, kind, text string) (Message, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.ensureChatMaps()
	c, ok := m.convs[convID]
	if !ok || !containsID(c.MemberIDs, userID) {
		return Message{}, fmt.Errorf("not a member")
	}
	u := m.users[userID]
	name := "You"
	if u != nil && u.Profile.FullName != "" {
		name = u.Profile.FullName
	}
	msg := Message{
		ID: uuid.NewString(), ConversationID: convID.String(), SenderID: userID.String(),
		SenderName: name, Kind: kind, Text: text, CreatedAt: time.Now(), Mine: true,
	}
	m.msgs[convID] = append(m.msgs[convID], msg)
	c.Preview = text
	if kind != "text" {
		c.Preview = kind
	}
	c.UpdatedAt = msg.CreatedAt
	return msg, nil
}

func (m *Memory) MarkRead(_ context.Context, userID, convID uuid.UUID) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	c, ok := m.convs[convID]
	if !ok {
		return pgx.ErrNoRows
	}
	c.ReadAt[userID] = time.Now()
	return nil
}

func (m *Memory) ClearChat(_ context.Context, userID, convID uuid.UUID) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	c, ok := m.convs[convID]
	if !ok {
		return pgx.ErrNoRows
	}
	c.Cleared[userID] = time.Now()
	return nil
}

func (m *Memory) ListGist(_ context.Context) ([]GistPost, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.ensureChatMaps()
	out := append([]GistPost{}, m.gist...)
	return out, nil
}

func (m *Memory) CreateGist(_ context.Context, userID uuid.UUID, text, imageURL, mediaKind string) (GistPost, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.ensureChatMaps()
	u := m.users[userID]
	name := "You"
	if u != nil && u.Profile.FullName != "" {
		name = u.Profile.FullName
	}
	if mediaKind == "" && imageURL != "" {
		mediaKind = "image"
	}
	g := GistPost{
		ID: uuid.NewString(), Name: name, Text: text, ImageURL: imageURL, MediaKind: mediaKind,
		Initials: initials(name), CreatedAt: time.Now(),
	}
	m.gist = append([]GistPost{g}, m.gist...)
	return g, nil
}

func (m *Memory) ListStories(_ context.Context, userID uuid.UUID) ([]StoryPost, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.ensureChatMaps()
	out := make([]StoryPost, 0, len(m.stories)+1)
	out = append(out, StoryPost{ID: "you", Name: "You", Initials: "+", IsYou: true})
	cutoff := time.Now().Add(-24 * time.Hour)
	for _, s := range m.stories {
		if s.CreatedAt.Before(cutoff) {
			continue
		}
		cp := s
		cp.IsYou = s.UserID == userID.String()
		out = append(out, cp)
	}
	return out, nil
}

func (m *Memory) CreateStory(_ context.Context, userID uuid.UUID, text, mediaURL, mediaKind string) (StoryPost, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.ensureChatMaps()
	u := m.users[userID]
	name := "You"
	if u != nil && u.Profile.FullName != "" {
		name = u.Profile.FullName
	}
	if mediaKind == "" && mediaURL != "" {
		mediaKind = "image"
	}
	s := StoryPost{
		ID: uuid.NewString(), UserID: userID.String(), Name: name, Initials: initials(name),
		Text: text, MediaURL: mediaURL, MediaKind: mediaKind, IsYou: true, CreatedAt: time.Now(),
	}
	m.stories = append([]StoryPost{s}, m.stories...)
	return s, nil
}

func (m *Memory) adminOf(c *memConv, userID uuid.UUID) bool {
	r := c.Roles[userID]
	return r == "owner" || r == "admin"
}

func (m *Memory) SetGroupPhoto(_ context.Context, userID, convID uuid.UUID, avatarURL string) (Conversation, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	c, ok := m.convs[convID]
	if !ok || c.Kind != "group" {
		return Conversation{}, pgx.ErrNoRows
	}
	if !m.adminOf(c, userID) {
		return Conversation{}, fmt.Errorf("admins only")
	}
	c.AvatarURL = strings.TrimSpace(avatarURL)
	cp := c.Conversation
	cp.Members = m.memberViews(c)
	return cp, nil
}

func (m *Memory) RenameGroup(_ context.Context, userID, convID uuid.UUID, title string) (Conversation, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	c, ok := m.convs[convID]
	if !ok || c.Kind != "group" {
		return Conversation{}, pgx.ErrNoRows
	}
	if !m.adminOf(c, userID) {
		return Conversation{}, fmt.Errorf("admins only")
	}
	c.Title = strings.TrimSpace(title)
	cp := c.Conversation
	cp.Members = m.memberViews(c)
	return cp, nil
}

func (m *Memory) AddGroupMember(_ context.Context, userID, convID uuid.UUID, username string) (Conversation, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	c, ok := m.convs[convID]
	if !ok || c.Kind != "group" {
		return Conversation{}, pgx.ErrNoRows
	}
	if !m.adminOf(c, userID) {
		return Conversation{}, fmt.Errorf("admins only")
	}
	oid, ok := m.lookupUser(username)
	if !ok {
		return Conversation{}, fmt.Errorf("user not found")
	}
	if !containsID(c.MemberIDs, oid) {
		c.MemberIDs = append(c.MemberIDs, oid)
		c.Roles[oid] = "member"
	}
	cp := c.Conversation
	cp.Members = m.memberViews(c)
	return cp, nil
}

func (m *Memory) SetGroupRole(_ context.Context, userID, convID uuid.UUID, username, role string) (Conversation, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	c, ok := m.convs[convID]
	if !ok || c.Kind != "group" {
		return Conversation{}, pgx.ErrNoRows
	}
	if c.Roles[userID] != "owner" {
		return Conversation{}, fmt.Errorf("owner only")
	}
	oid, ok := m.lookupUser(username)
	if !ok || !containsID(c.MemberIDs, oid) {
		return Conversation{}, fmt.Errorf("user not found")
	}
	if role != "admin" && role != "member" {
		role = "member"
	}
	c.Roles[oid] = role
	cp := c.Conversation
	cp.Members = m.memberViews(c)
	return cp, nil
}
