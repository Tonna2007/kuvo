package store

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Store interface {
	Ping(ctx context.Context) error
	Close()
	Migrate(ctx context.Context, dir string) error
	FindOrCreateUser(ctx context.Context, phone string) (User, error)
	GetMe(ctx context.Context, userID uuid.UUID) (Me, error)
	UpdateProfile(ctx context.Context, userID uuid.UUID, patch map[string]any) error
	SaveRefresh(ctx context.Context, userID uuid.UUID, tokenHash string, exp time.Time) error
	ConsumeRefresh(ctx context.Context, tokenHash string) (uuid.UUID, error)
	ListCampuses(ctx context.Context, q string, limit int) ([]Campus, error)
	GetCampus(ctx context.Context, id string) (Campus, error)
	RequestCampus(ctx context.Context, userID uuid.UUID, name, country, city string) (Campus, error)
	ListConversations(ctx context.Context, userID uuid.UUID) ([]Conversation, error)
	CreateDirect(ctx context.Context, userID uuid.UUID, username string) (Conversation, error)
	CreateGroup(ctx context.Context, userID uuid.UUID, title string, memberNames []string) (Conversation, error)
	LeaveConversation(ctx context.Context, userID, convID uuid.UUID) error
	ListMessages(ctx context.Context, userID, convID uuid.UUID) ([]Message, error)
	AppendMessage(ctx context.Context, userID, convID uuid.UUID, kind, text string) (Message, error)
	MarkRead(ctx context.Context, userID, convID uuid.UUID) error
	ClearChat(ctx context.Context, userID, convID uuid.UUID) error
	ListGist(ctx context.Context) ([]GistPost, error)
	CreateGist(ctx context.Context, userID uuid.UUID, text, imageURL, mediaKind string) (GistPost, error)
	LookupUsername(ctx context.Context, username string) (id uuid.UUID, name string, err error)
	ListStories(ctx context.Context, userID uuid.UUID) ([]StoryPost, error)
	CreateStory(ctx context.Context, userID uuid.UUID, text, mediaURL, mediaKind string) (StoryPost, error)
	RenameGroup(ctx context.Context, userID, convID uuid.UUID, title string) (Conversation, error)
	SetGroupPhoto(ctx context.Context, userID, convID uuid.UUID, avatarURL string) (Conversation, error)
	AddGroupMember(ctx context.Context, userID, convID uuid.UUID, username string) (Conversation, error)
	SetGroupRole(ctx context.Context, userID, convID uuid.UUID, username, role string) (Conversation, error)
}
