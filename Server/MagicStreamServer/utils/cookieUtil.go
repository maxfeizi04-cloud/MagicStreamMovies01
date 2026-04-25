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

// AccessTokenCookieName 返回访问令牌使用的 Cookie 名称。
func AccessTokenCookieName() string {
	return accessTokenCookieName
}

// RefreshTokenCookieName 返回刷新令牌使用的 Cookie 名称。
func RefreshTokenCookieName() string {
	return refreshTokenCookieName
}

// SetSessionCookies 将访问令牌和刷新令牌写入 HttpOnly Cookie。
func SetSessionCookies(c *gin.Context, accessToken, refreshToken string) {
	setCookie(c, accessTokenCookieName, accessToken, 86400)
	setCookie(c, refreshTokenCookieName, refreshToken, 604800)
}

// ClearSessionCookies 让客户端当前会话 Cookie 立即失效。
func ClearSessionCookies(c *gin.Context) {
	setCookie(c, accessTokenCookieName, "", -1)
	setCookie(c, refreshTokenCookieName, "", -1)
}

// setCookie 根据当前请求环境写入 Cookie。
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

// shouldUseSecureCookies 判断当前请求是否应该启用 Secure Cookie。
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
