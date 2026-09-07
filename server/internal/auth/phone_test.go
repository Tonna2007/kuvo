package auth

import "testing"

func TestNormalizeE164(t *testing.T) {
	got, err := NormalizeE164("+234", "8012345678")
	if err != nil || got != "+2348012345678" {
		t.Fatalf("ng: %q %v", got, err)
	}
	got, err = NormalizeE164("+233", "241234567")
	if err != nil || got != "+233241234567" {
		t.Fatalf("gh: %q %v", got, err)
	}
	got, err = NormalizeE164("+233", "0241234567")
	if err != nil || got != "+233241234567" {
		t.Fatalf("gh leading zero: %q %v", got, err)
	}
	if _, err := NormalizeE164("+1", "2025550123"); err == nil {
		t.Fatal("expected unsupported country")
	}
}
