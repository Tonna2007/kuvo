package store

import (
	"context"
	"strings"

	"github.com/google/uuid"
)

type Campus struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Country     string  `json:"country"`
	City        string  `json:"city"`
	Initials    string  `json:"initials"`
	EmailDomain *string `json:"email_domain,omitempty"`
	Status      string  `json:"status"`
}

func (db *DB) ListCampuses(ctx context.Context, q string, limit int) ([]Campus, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	q = strings.TrimSpace(q)
	rows, err := db.Pool.Query(ctx, `
		SELECT id, name, country, city, initials, email_domain, status
		FROM campuses
		WHERE ($1 = '' OR name ILIKE '%' || $1 || '%' OR city ILIKE '%' || $1 || '%')
		ORDER BY name
		LIMIT $2
	`, q, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]Campus, 0)
	for rows.Next() {
		var c Campus
		if err := rows.Scan(&c.ID, &c.Name, &c.Country, &c.City, &c.Initials, &c.EmailDomain, &c.Status); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

func (db *DB) GetCampus(ctx context.Context, id string) (Campus, error) {
	var c Campus
	err := db.Pool.QueryRow(ctx, `
		SELECT id, name, country, city, initials, email_domain, status
		FROM campuses WHERE id = $1
	`, id).Scan(&c.ID, &c.Name, &c.Country, &c.City, &c.Initials, &c.EmailDomain, &c.Status)
	return c, err
}

func (db *DB) RequestCampus(ctx context.Context, userID uuid.UUID, name, country, city string) (Campus, error) {
	id := slug(name) + "-" + uuid.NewString()[:8]
	initials := initials(name)
	var c Campus
	tx, err := db.Pool.Begin(ctx)
	if err != nil {
		return Campus{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	if _, err := tx.Exec(ctx, `
		INSERT INTO campus_requests (user_id, name, country, city) VALUES ($1,$2,$3,$4)
	`, userID, name, country, city); err != nil {
		return Campus{}, err
	}
	if err := tx.QueryRow(ctx, `
		INSERT INTO campuses (id, name, country, city, initials, status)
		VALUES ($1,$2,$3,$4,$5,'user_added')
		RETURNING id, name, country, city, initials, email_domain, status
	`, id, name, country, city, initials).Scan(&c.ID, &c.Name, &c.Country, &c.City, &c.Initials, &c.EmailDomain, &c.Status); err != nil {
		return Campus{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return Campus{}, err
	}
	return c, nil
}

func slug(name string) string {
	var b strings.Builder
	for _, r := range strings.ToLower(name) {
		if r >= 'a' && r <= 'z' || r >= '0' && r <= '9' {
			b.WriteRune(r)
		} else if r == ' ' || r == '-' {
			b.WriteByte('-')
		}
	}
	s := strings.Trim(b.String(), "-")
	if s == "" {
		return "campus"
	}
	if len(s) > 24 {
		s = s[:24]
	}
	return s
}

func initials(name string) string {
	parts := strings.Fields(name)
	if len(parts) == 0 {
		return "UN"
	}
	if len(parts) == 1 {
		s := strings.ToUpper(parts[0])
		if len(s) >= 2 {
			return s[:2]
		}
		return s
	}
	a := []rune(parts[0])
	b := []rune(parts[1])
	return strings.ToUpper(string(a[0]) + string(b[0]))
}
