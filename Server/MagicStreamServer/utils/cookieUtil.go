package utils

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	accessTokenCookieName  = "access_token"
	refreshTokenCookieName = "refresh_token"
)

func AccessTokenCookieName() string {
	return accessTokenCookieName
}

func RefreshTokenCookieName() string {
	return refreshTokenCookieName
}

func SetSessionCookies(c *gin.Context, accessToken, refreshToken string) {
	setCookie(c, accessTokenCookieName, accessToken, 86400)
	setCookie(c, refreshTokenCookieName, refreshToken, 604800)
}

func ClearSessionCookies(c *gin.Context) {
	setCookie(c, accessTokenCookieName, "", -1)
	setCookie(c, refreshTokenCookieName, "", -1)
}

func setCookie(c *gin.Context, name, value string, maxAge int) {
	secure := shouldUseSecureCookies(c)
	sameSite := http.SameSiteLaxMode
	if secure {
		sameSite = http.SameSiteNoneMode
	}

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     name,
		Value:    value,
		Path:     "/",
		MaxAge:   maxAge,
		Secure:   secure,
		HttpOnly: true,
		SameSite: sameSite,
	})
}

func shouldUseSecureCookies(c *gin.Context) bool {
	override := strings.TrimSpace(os.Getenv("COOKIE_SECURE"))
	if override != "" {
		return strings.EqualFold(override, "true") || override == "1"
	}

	if c.Request.TLS != nil {
		return true
	}

	return strings.EqualFold(c.GetHeader("X-Forwarded-Proto"), "https")
}
