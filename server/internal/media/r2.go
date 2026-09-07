package media

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type R2 struct {
	Account string
	Access  string
	Secret  string
	Bucket  string
	Public  string
}

func (r *R2) Enabled() bool {
	return r != nil && r.Account != "" && r.Access != "" && r.Secret != "" && r.Bucket != ""
}

func (r *R2) Put(_ context.Context, key, contentType string, body []byte) (string, error) {
	host := r.Account + ".r2.cloudflarestorage.com"
	path := "/" + r.Bucket + "/" + strings.TrimPrefix(key, "/")
	url := "https://" + host + path
	now := time.Now().UTC()
	amzDate := now.Format("20060102T150405Z")
	dateStamp := now.Format("20060102")
	payloadHash := sha256Hex(body)
	canonicalHeaders := "content-type:" + contentType + "\nhost:" + host + "\nx-amz-content-sha256:" + payloadHash + "\nx-amz-date:" + amzDate + "\n"
	signedHeaders := "content-type;host;x-amz-content-sha256;x-amz-date"
	canonical := strings.Join([]string{"PUT", path, "", canonicalHeaders, signedHeaders, payloadHash}, "\n")
	scope := dateStamp + "/auto/s3/aws4_request"
	stringToSign := strings.Join([]string{"AWS4-HMAC-SHA256", amzDate, scope, sha256Hex([]byte(canonical))}, "\n")
	signing := hmacSHA256([]byte("AWS4"+r.Secret), []byte(dateStamp))
	signing = hmacSHA256(signing, []byte("auto"))
	signing = hmacSHA256(signing, []byte("s3"))
	signing = hmacSHA256(signing, []byte("aws4_request"))
	sig := hex.EncodeToString(hmacSHA256(signing, []byte(stringToSign)))
	auth := fmt.Sprintf("AWS4-HMAC-SHA256 Credential=%s/%s, SignedHeaders=%s, Signature=%s", r.Access, scope, signedHeaders, sig)

	req, err := http.NewRequest(http.MethodPut, url, bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("x-amz-content-sha256", payloadHash)
	req.Header.Set("x-amz-date", amzDate)
	req.Header.Set("Authorization", auth)
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		b, _ := io.ReadAll(res.Body)
		return "", fmt.Errorf("r2 HTTP %d: %s", res.StatusCode, strings.TrimSpace(string(b)))
	}
	if r.Public != "" {
		return strings.TrimRight(r.Public, "/") + "/" + key, nil
	}
	return url, nil
}

func sha256Hex(b []byte) string {
	h := sha256.Sum256(b)
	return hex.EncodeToString(h[:])
}

func hmacSHA256(key, data []byte) []byte {
	m := hmac.New(sha256.New, key)
	_, _ = m.Write(data)
	return m.Sum(nil)
}
