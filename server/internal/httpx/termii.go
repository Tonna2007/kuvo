package httpx

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

func sendTermii(apiKey, from, toE164, body string) error {
	payload, err := json.Marshal(map[string]any{
		"api_key": apiKey,
		"to":      strings.TrimPrefix(toE164, "+"),
		"from":    from,
		"sms":     body,
		"type":    "plain",
		"channel": "generic",
	})
	if err != nil {
		return err
	}
	req, err := http.NewRequest(http.MethodPost, "https://api.ng.termii.com/api/sms/send", bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{Timeout: 15 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		return fmt.Errorf("termii HTTP %d", res.StatusCode)
	}
	return nil
}
