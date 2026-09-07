package auth

import (
	"fmt"
	"strings"
	"unicode"
)

func NormalizeE164(countryCode, local string) (string, error) {
	cc := strings.TrimSpace(countryCode)
	if !strings.HasPrefix(cc, "+") {
		cc = "+" + cc
	}
	digits := onlyDigits(local)
	if strings.HasPrefix(digits, "0") {
		digits = digits[1:]
	}
	switch cc {
	case "+234":
		if len(digits) != 10 {
			return "", fmt.Errorf("nigerian numbers need 10 digits")
		}
	case "+233":
		if len(digits) == 10 {
			digits = digits[1:]
		}
		if len(digits) != 9 {
			return "", fmt.Errorf("ghanaian numbers need 9 digits")
		}
	default:
		return "", fmt.Errorf("unsupported country code")
	}
	return cc + digits, nil
}

func onlyDigits(s string) string {
	var b strings.Builder
	for _, r := range s {
		if unicode.IsDigit(r) {
			b.WriteRune(r)
		}
	}
	return b.String()
}
