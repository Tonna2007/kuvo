package httpx

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func (s *Server) getMe(c *gin.Context) {
	me, err := s.db.GetMe(c.Request.Context(), userID(c))
	if err != nil {
		Fail(c, http.StatusNotFound, "not_found", "profile missing")
		return
	}
	OK(c, me)
}

func (s *Server) patchMe(c *gin.Context) {
	var body map[string]any
	if err := c.ShouldBindJSON(&body); err != nil {
		Fail(c, http.StatusBadRequest, "invalid_json", "invalid body")
		return
	}
	if err := s.db.UpdateProfile(c.Request.Context(), userID(c), body); err != nil {
		Fail(c, http.StatusBadRequest, "update_failed", err.Error())
		return
	}
	s.getMe(c)
}

type campusBody struct {
	CampusID string `json:"campus_id"`
}

func (s *Server) setCampus(c *gin.Context) {
	var body campusBody
	if err := c.ShouldBindJSON(&body); err != nil || strings.TrimSpace(body.CampusID) == "" {
		Fail(c, http.StatusBadRequest, "invalid_json", "campus_id required")
		return
	}
	if _, err := s.db.GetCampus(c.Request.Context(), body.CampusID); err != nil {
		Fail(c, http.StatusNotFound, "not_found", "campus not found")
		return
	}
	if err := s.db.UpdateProfile(c.Request.Context(), userID(c), map[string]any{"campus_id": body.CampusID}); err != nil {
		Fail(c, http.StatusInternalServerError, "update_failed", err.Error())
		return
	}
	s.getMe(c)
}

func (s *Server) listCampuses(c *gin.Context) {
	list, err := s.db.ListCampuses(c.Request.Context(), c.Query("q"), 50)
	if err != nil {
		Fail(c, http.StatusInternalServerError, "list_failed", err.Error())
		return
	}
	OK(c, gin.H{"campuses": list})
}

type campusReq struct {
	Name    string `json:"name"`
	Country string `json:"country"`
	City    string `json:"city"`
}

func (s *Server) requestCampus(c *gin.Context) {
	var body campusReq
	if err := c.ShouldBindJSON(&body); err != nil {
		Fail(c, http.StatusBadRequest, "invalid_json", "invalid body")
		return
	}
	body.Name = strings.TrimSpace(body.Name)
	body.City = strings.TrimSpace(body.City)
	body.Country = strings.ToUpper(strings.TrimSpace(body.Country))
	if body.Name == "" || body.City == "" || (body.Country != "GH" && body.Country != "NG") {
		Fail(c, http.StatusBadRequest, "invalid_campus", "name, city, and country GH|NG required")
		return
	}
	camp, err := s.db.RequestCampus(c.Request.Context(), userID(c), body.Name, body.Country, body.City)
	if err != nil {
		Fail(c, http.StatusInternalServerError, "create_failed", err.Error())
		return
	}
	_ = s.db.UpdateProfile(c.Request.Context(), userID(c), map[string]any{"campus_id": camp.ID})
	OK(c, camp)
}

func parseUUID(s string) (uuid.UUID, error) { return uuid.Parse(s) }
