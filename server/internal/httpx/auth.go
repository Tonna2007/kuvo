package httpx

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"kuvo/server/internal/auth"
)

type otpRequest struct {
	CountryCode string `json:"country_code"`
	Phone       string `json:"phone"`
	SMS         bool   `json:"sms"`
}

type otpVerify struct {
	CountryCode string `json:"country_code"`
	Phone       string `json:"phone"`
	Code        string `json:"code"`
}

func (s *Server) requestOTP(c *gin.Context) {
	var req otpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Fail(c, http.StatusBadRequest, "invalid_json", "invalid body")
		return
	}
	e164, err := auth.NormalizeE164(req.CountryCode, req.Phone)
	if err != nil {
		Fail(c, http.StatusBadRequest, "invalid_phone", err.Error())
		return
	}
	if err := s.cache.AllowOTPRequest(c.Request.Context(), e164, c.ClientIP()); err != nil {
		Fail(c, http.StatusTooManyRequests, "rate_limited", "too many OTP requests")
		return
	}
	code := s.cfg.DevOTP
	if code == "" {
		code = "1234"
	}
	if req.SMS && s.cfg.TermiiKey != "" {
		n, err := auth.RandomOTP()
		if err != nil {
			Fail(c, http.StatusInternalServerError, "otp_failed", "could not issue code")
			return
		}
		code = n
		if err := sendTermii(s.cfg.TermiiKey, s.cfg.TermiiFrom, e164, "Your Kuvo code is "+code); err != nil {
			Fail(c, http.StatusBadGateway, "sms_failed", err.Error())
			return
		}
	}
	hash := auth.HashOTP(code, s.cfg.OTPPepper)
	if err := s.cache.SetOTP(c.Request.Context(), e164, hash, 5*time.Minute); err != nil {
		Fail(c, http.StatusInternalServerError, "otp_failed", "could not store code")
		return
	}
	out := gin.H{"ok": true, "expires_in": 300, "sms": req.SMS && s.cfg.TermiiKey != ""}
	if !s.cfg.StrictOTP {
		out["dev_otp"] = code
	}
	c.JSON(http.StatusOK, out)
}

func (s *Server) verifyOTP(c *gin.Context) {
	var req otpVerify
	if err := c.ShouldBindJSON(&req); err != nil {
		Fail(c, http.StatusBadRequest, "invalid_json", "invalid body")
		return
	}
	e164, err := auth.NormalizeE164(req.CountryCode, req.Phone)
	if err != nil {
		Fail(c, http.StatusBadRequest, "invalid_phone", err.Error())
		return
	}
	stored, _ := s.cache.GetOTP(c.Request.Context(), e164)
	tries, err := s.cache.IncrTries(c.Request.Context(), e164)
	if err != nil {
		Fail(c, http.StatusInternalServerError, "otp_failed", "could not verify")
		return
	}
	if tries > 5 {
		s.cache.DeleteOTP(c.Request.Context(), e164)
		Fail(c, http.StatusUnauthorized, "invalid_otp", "too many attempts")
		return
	}
	got := auth.HashOTP(req.Code, s.cfg.OTPPepper)
	ok := stored != "" && auth.OTPEqual(stored, got)
	if !s.cfg.StrictOTP && (req.Code == "1234" || (s.cfg.DevOTP != "" && req.Code == s.cfg.DevOTP)) {
		ok = true
	}
	if !ok {
		Fail(c, http.StatusUnauthorized, "invalid_otp", "wrong code")
		return
	}
	s.cache.DeleteOTP(c.Request.Context(), e164)

	user, err := s.db.FindOrCreateUser(c.Request.Context(), e164)
	if err != nil {
		Fail(c, http.StatusInternalServerError, "user_failed", "could not create session")
		return
	}
	s.issueSession(c, user.ID.String())
}

type refreshReq struct {
	RefreshToken string `json:"refresh_token"`
}

func (s *Server) refresh(c *gin.Context) {
	var req refreshReq
	if err := c.ShouldBindJSON(&req); err != nil || req.RefreshToken == "" {
		Fail(c, http.StatusBadRequest, "invalid_json", "refresh_token required")
		return
	}
	userID, err := s.db.ConsumeRefresh(c.Request.Context(), auth.HashRefresh(req.RefreshToken))
	if err != nil {
		Fail(c, http.StatusUnauthorized, "unauthorized", "invalid refresh token")
		return
	}
	s.issueSession(c, userID.String())
}

func (s *Server) issueSession(c *gin.Context, userID string) {
	access, err := auth.SignAccess(s.cfg.JWTSecret, userID)
	if err != nil {
		Fail(c, http.StatusInternalServerError, "token_failed", "could not sign token")
		return
	}
	raw, hash, err := auth.NewRefreshToken()
	if err != nil {
		Fail(c, http.StatusInternalServerError, "token_failed", "could not issue refresh")
		return
	}
	uid, err := parseUUID(userID)
	if err != nil {
		Fail(c, http.StatusInternalServerError, "token_failed", "bad user id")
		return
	}
	if err := s.db.SaveRefresh(c.Request.Context(), uid, hash, time.Now().Add(auth.RefreshTTL)); err != nil {
		Fail(c, http.StatusInternalServerError, "token_failed", "could not persist refresh")
		return
	}
	me, err := s.db.GetMe(c.Request.Context(), uid)
	if err != nil {
		Fail(c, http.StatusInternalServerError, "user_failed", "could not load profile")
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"access_token":  access,
		"refresh_token": raw,
		"token_type":    "Bearer",
		"expires_in":    int(auth.AccessTTL.Seconds()),
		"user":          me,
	})
}
