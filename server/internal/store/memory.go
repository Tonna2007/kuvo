package store

import (
	"context"
	"encoding/json"
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type memUser struct {
	User
	Profile Profile
}

type memRefresh struct {
	UserID uuid.UUID
	Exp    time.Time
	Revoked bool
}

type Memory struct {
	mu         sync.Mutex
	users      map[uuid.UUID]*memUser
	byPhone    map[string]uuid.UUID
	byUsername map[string]uuid.UUID
	campuses   map[string]Campus
	refresh    map[string]memRefresh
	convs      map[uuid.UUID]*memConv
	msgs       map[uuid.UUID][]Message
	gist       []GistPost
	stories    []StoryPost
}

func NewMemory() *Memory {
	m := &Memory{
		users:      map[uuid.UUID]*memUser{},
		byPhone:    map[string]uuid.UUID{},
		byUsername: map[string]uuid.UUID{},
		campuses:   map[string]Campus{},
		refresh:    map[string]memRefresh{},
		convs:      map[uuid.UUID]*memConv{},
		msgs:       map[uuid.UUID][]Message{},
		gist:       []GistPost{},
	}
	for _, c := range seedCampuses() {
		m.campuses[c.ID] = c
	}
	return m
}

func (m *Memory) Ping(context.Context) error { return nil }
func (m *Memory) Close()                     {}
func (m *Memory) Migrate(context.Context, string) error {
	return nil
}

func (m *Memory) FindOrCreateUser(_ context.Context, phone string) (User, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if id, ok := m.byPhone[phone]; ok {
		return m.users[id].User, nil
	}
	id := uuid.New()
	u := User{ID: id, PhoneE164: phone, CreatedAt: time.Now()}
	notes, _ := json.Marshal(map[string]bool{
		"messages": true, "groups": true, "preview": true, "sound": true, "vibrate": false,
	})
	m.users[id] = &memUser{
		User: u,
		Profile: Profile{
			UserID:        id,
			Verified:      "unverified",
			Notifications: notes,
			ThemeMode:     "light",
			ThemeColor:    "#145C38",
			Wallpaper:     "#FFFFFF",
			LowDataMode:   true,
			ShowLastSeen:  true,
			ReadReceipts:  true,
			ShowCampusBadge: true,
		},
	}
	m.byPhone[phone] = id
	return u, nil
}

func (m *Memory) GetMe(_ context.Context, userID uuid.UUID) (Me, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	u, ok := m.users[userID]
	if !ok {
		return Me{}, pgx.ErrNoRows
	}
	me := Me{ID: u.ID.String(), PhoneE164: u.PhoneE164, Profile: u.Profile}
	if u.Profile.CampusID != nil {
		if c, ok := m.campuses[*u.Profile.CampusID]; ok {
			cp := c
			me.Campus = &cp
		}
	}
	return me, nil
}

func (m *Memory) UpdateProfile(_ context.Context, userID uuid.UUID, patch map[string]any) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	u, ok := m.users[userID]
	if !ok {
		return pgx.ErrNoRows
	}
	p := &u.Profile
	setStr := func(key string, dst *string) {
		if v, ok := patch[key]; ok {
			if s, ok := v.(string); ok {
				*dst = s
			}
		}
	}
	setBool := func(key string, dst *bool) {
		if v, ok := patch[key]; ok {
			if b, ok := v.(bool); ok {
				*dst = b
			}
		}
	}
	setStr("full_name", &p.FullName)
	setStr("about", &p.About)
	setStr("school_email", &p.SchoolEmail)
	setStr("theme_mode", &p.ThemeMode)
	setStr("theme_color", &p.ThemeColor)
	setStr("wallpaper", &p.Wallpaper)
	setStr("verified", &p.Verified)
	setBool("two_step_enabled", &p.TwoStepEnabled)
	setBool("low_data_mode", &p.LowDataMode)
	setBool("auto_download_photos", &p.AutoDownloadPhotos)
	setBool("auto_download_documents", &p.AutoDownloadDocuments)
	setBool("show_last_seen", &p.ShowLastSeen)
	setBool("read_receipts", &p.ReadReceipts)
	setBool("show_campus_badge", &p.ShowCampusBadge)
	if v, ok := patch["username"]; ok {
		if s, ok := v.(string); ok && s != "" {
			p.Username = &s
			m.byUsername[strings.ToLower(s)] = userID
		}
	}
	if v, ok := patch["campus_id"]; ok {
		if s, ok := v.(string); ok && s != "" {
			p.CampusID = &s
		}
	}
	if v, ok := patch["avatar_key"]; ok {
		if s, ok := v.(string); ok {
			if s == "" {
				p.AvatarKey = nil
			} else {
				p.AvatarKey = &s
			}
		}
	}
	return nil
}

func (m *Memory) SaveRefresh(_ context.Context, userID uuid.UUID, tokenHash string, exp time.Time) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.refresh[tokenHash] = memRefresh{UserID: userID, Exp: exp}
	return nil
}

func (m *Memory) ConsumeRefresh(_ context.Context, tokenHash string) (uuid.UUID, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	it, ok := m.refresh[tokenHash]
	if !ok || it.Revoked || time.Now().After(it.Exp) {
		return uuid.Nil, fmt.Errorf("invalid refresh")
	}
	it.Revoked = true
	m.refresh[tokenHash] = it
	return it.UserID, nil
}

func (m *Memory) ListCampuses(_ context.Context, q string, limit int) ([]Campus, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	q = strings.ToLower(strings.TrimSpace(q))
	out := make([]Campus, 0)
	for _, c := range m.campuses {
		if q != "" && !strings.Contains(strings.ToLower(c.Name), q) && !strings.Contains(strings.ToLower(c.City), q) {
			continue
		}
		out = append(out, c)
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].ID == "kaaf" {
			return true
		}
		if out[j].ID == "kaaf" {
			return false
		}
		return out[i].Name < out[j].Name
	})
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if len(out) > limit {
		out = out[:limit]
	}
	return out, nil
}

func (m *Memory) GetCampus(_ context.Context, id string) (Campus, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	c, ok := m.campuses[id]
	if !ok {
		return Campus{}, pgx.ErrNoRows
	}
	return c, nil
}

func (m *Memory) RequestCampus(_ context.Context, _ uuid.UUID, name, country, city string) (Campus, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	c := Campus{
		ID:       slug(name) + "-" + uuid.NewString()[:8],
		Name:     name,
		Country:  country,
		City:     city,
		Initials: initials(name),
		Status:   "user_added",
	}
	m.campuses[c.ID] = c
	return c, nil
}

func seedCampuses() []Campus {
	gh := func(id, name, city, initials string) Campus {
		return Campus{ID: id, Name: name, Country: "GH", City: city, Initials: initials, Status: "official"}
	}
	ng := func(id, name, city, initials string) Campus {
		return Campus{ID: id, Name: name, Country: "NG", City: city, Initials: initials, Status: "official"}
	}
	return []Campus{
		gh("kaaf", "KAAF University College", "Buduburam", "KA"),
		gh("ug", "University of Ghana", "Legon, Accra", "UG"),
		gh("knust", "Kwame Nkrumah University of Science and Technology", "Kumasi", "KN"),
		gh("ucc", "University of Cape Coast", "Cape Coast", "UC"),
		gh("ashesi", "Ashesi University", "Berekuso", "AS"),
		ng("unilag", "University of Lagos", "Lagos", "UL"),
		ng("ui", "University of Ibadan", "Ibadan", "UI"),
		ng("oau", "Obafemi Awolowo University", "Ile-Ife", "OA"),
		ng("uniben", "University of Benin", "Benin City", "UB"),
		ng("unn", "University of Nigeria, Nsukka", "Nsukka", "UN"),
		ng("lasu", "Lagos State University", "Ojo, Lagos", "LS"),
		ng("covenant", "Covenant University", "Ota", "CU"),
	}
}
