package middleware

import (
	"net/http"

	"github.com/GavinLonDigital/MagicStream/Server/MagicStreamServer/utils"
	"github.com/gin-gonic/gin"
)

// AuthMiddleWare 是需要登录后才能访问接口时使用的认证中间件。
// 它会做三件事：
// 1. 从 Cookie 读取 access_token
// 2. 校验 token 是否合法、是否过期
// 3. 把 userId 和 role 写入 gin.Context，供后续控制器使用
func AuthMiddleWare() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := utils.GetAccessToken(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No token provided"})
			c.Abort()
			return
		}

		claims, err := utils.ValidateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// 中间件完成认证后，把关键信息放进上下文。
		// 这样业务处理函数就不需要重复解析 JWT 了。
		c.Set("userId", claims.UserId)
		c.Set("role", claims.Role)

		c.Next()
	}
}
