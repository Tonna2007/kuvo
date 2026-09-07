package store

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type User struct {
	ID        uuid.UUID
	PhoneE164 string
	CreatedAt time.Time
}

type Profile struct {
	UserID                 uuid.UUID       `json:"-"`
	FullName               string          `json:"full_name"`
	Username               *string         `json:"username"`
	About                  string          `json:"about"`
	AvatarKey              *string         `json:"avatar_key"`
	CampusID               *string         `json:"campus_id"`
	Verified               string          `json:"verified"`
	SchoolEmail            string          `json:"school_email"`
	TwoStepEnabled         bool            `json:"two_step_enabled"`
	LowDataMode            bool            `json:"low_data_mode"`
	AutoDownloadPhotos     bool            `json:"auto_download_photos"`
	AutoDownloadDocuments  bool            `json:"auto_download_documents"`
	ShowLastSeen           bool            `json:"show_last_seen"`
	ReadReceipts           bool            `json:"read_receipts"`
	ShowCampusBadge        bool            `json:"show_campus_badge"`
	Notifications          json.RawMessage `json:"notifications"`
	ThemeMode              string          `json:"theme_mode"`
	ThemeColor             string          `json:"theme_color"`
	Wallpaper              string          `json:"wallpaper"`
	LastSeenAt             *time.Time      `json:"last_seen_at"`
}

type Me struct {
	ID        string   `json:"id"`
	PhoneE164 string   `json:"phone_e164"`
	Profile   Profile  `json:"profile"`
	Campus    *Campus  `json:"campus,omitempty"`
}

func (db *DB) FindOrCreateUser(ctx context.Context, phone string) (User, error) {
	var u User
	err := db.Pool.QueryRow(ctx, `
		INSERT INTO users (phone_e164) VALUES ($1)
		ON CONFLICT (phone_e164) DO UPDATE SET phone_e164 = EXCLUDED.phone_e164
		RETURNING id, phone_e164, created_at
	`, phone).Scan(&u.ID, &u.PhoneE164, &u.CreatedAt)
	if err != nil {
		return User{}, err
	}
	_, _ = db.Pool.Exec(ctx, `INSERT INTO profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, u.ID)
	return u, nil
}

func (db *DB) GetMe(ctx context.Context, userID uuid.UUID) (Me, error) {
	var me Me
	var campusID *string
	err := db.Pool.QueryRow(ctx, `
		SELECT u.id, u.phone_e164,
			p.full_name, p.username, p.about, p.avatar_key, p.campus_id, p.verified,
			p.school_email, p.two_step_enabled, p.low_data_mode, p.auto_download_photos,
			p.auto_download_documents, p.show_last_seen, p.read_receipts, p.show_campus_badge,
			p.notifications, p.theme_mode, p.theme_color, p.wallpaper, p.last_seen_at
		FROM users u
		JOIN profiles p ON p.user_id = u.id
		WHERE u.id = $1
	`, userID).Scan(
		&me.ID, &me.PhoneE164,
		&me.Profile.FullName, &me.Profile.Username, &me.Profile.About, &me.Profile.AvatarKey,
		&campusID, &me.Profile.Verified, &me.Profile.SchoolEmail, &me.Profile.TwoStepEnabled,
		&me.Profile.LowDataMode, &me.Profile.AutoDownloadPhotos, &me.Profile.AutoDownloadDocuments,
		&me.Profile.ShowLastSeen, &me.Profile.ReadReceipts, &me.Profile.ShowCampusBadge,
		&me.Profile.Notifications, &me.Profile.ThemeMode, &me.Profile.ThemeColor, &me.Profile.Wallpaper,
		&me.Profile.LastSeenAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return Me{}, err
	}
	if err != nil {
		return Me{}, err
	}
	me.Profile.CampusID = campusID
	if campusID != nil {
		c, cerr := db.GetCampus(ctx, *campusID)
		if cerr == nil {
			me.Campus = &c
		}
	}
	return me, nil
}

func (db *DB) UpdateProfile(ctx context.Context, userID uuid.UUID, patch map[string]any) error {
	if len(patch) == 0 {
		return nil
	}
	allowed := map[string]string{
		"full_name":                "full_name",
		"username":                 "username",
		"about":                    "about",
		"campus_id":                "campus_id",
		"school_email":             "school_email",
		"two_step_enabled":         "two_step_enabled",
		"low_data_mode":            "low_data_mode",
		"auto_download_photos":     "auto_download_photos",
		"auto_download_documents":  "auto_download_documents",
		"show_last_seen":           "show_last_seen",
		"read_receipts":            "read_receipts",
		"show_campus_badge":        "show_campus_badge",
		"notifications":            "notifications",
		"theme_mode":               "theme_mode",
		"theme_color":              "theme_color",
		"wallpaper":                "wallpaper",
		"verified":                 "verified",
		"avatar_key":               "avatar_key",
	}
	sets := make([]string, 0, len(patch))
	args := make([]any, 0, len(patch)+1)
	i := 1
	for k, v := range patch {
		col, ok := allowed[k]
		if !ok {
			continue
		}
		sets = append(sets, col+"=$"+itoa(i))
		args = append(args, v)
		i++
	}
	if len(sets) == 0 {
		return nil
	}
	sets = append(sets, "updated_at=now()")
	args = append(args, userID)
	q := "UPDATE profiles SET " + join(sets, ", ") + " WHERE user_id=$" + itoa(i)
	_, err := db.Pool.Exec(ctx, q, args...)
	return err
}

func (db *DB) SaveRefresh(ctx context.Context, userID uuid.UUID, tokenHash string, exp time.Time) error {
	_, err := db.Pool.Exec(ctx, `
		INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1,$2,$3)
	`, userID, tokenHash, exp)
	return err
}

func (db *DB) ConsumeRefresh(ctx context.Context, tokenHash string) (uuid.UUID, error) {
	var userID uuid.UUID
	err := db.Pool.QueryRow(ctx, `
		UPDATE refresh_tokens
		SET revoked_at = now()
		WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()
		RETURNING user_id
	`, tokenHash).Scan(&userID)
	return userID, err
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	var b [12]byte
	i := len(b)
	for n > 0 {
		i--
		b[i] = byte('0' + n%10)
		n /= 10
	}
	return string(b[i:])
}

func join(s []string, sep string) string {
	if len(s) == 0 {
		return ""
	}
	out := s[0]
	for i := 1; i < len(s); i++ {
		out += sep + s[i]
	}
	return out
}
