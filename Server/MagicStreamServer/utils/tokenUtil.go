package utils

import (
	"context"
	"errors"
	"os"
	"time"

	"github.com/GavinLonDigital/MagicStream/Server/MagicStreamServer/database"
	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// SignedDetails 定义 MagicStream 会话使用的 JWT 声明内容。
type SignedDetails struct {
	Email     string
	FirstName string
	LastName  string
	Role      string
	UserId    string
	jwt.RegisteredClaims
}

// GenerateAllTokens 为用户生成新的访问令牌和刷新令牌。
func GenerateAllTokens(email, firstName, lastName, role, userId string) (string, string, error) {
	secretKey, err := loadEnvValue("SECRET_KEY")
	if err != nil {
		return "", "", err
	}
	refreshSecretKey, err := loadEnvValue("SECRET_REFRESH_KEY")
	if err != nil {
		return "", "", err
	}

	claims := &SignedDetails{
		Email:     email,
		FirstName: firstName,
		LastName:  lastName,
		Role:      role,
		UserId:    userId,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "MagicStream",
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", "", err
	}

	refreshClaims := &SignedDetails{
		Email:     email,
		FirstName: firstName,
		LastName:  lastName,
		Role:      role,
		UserId:    userId,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "MagicStream",
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * 7 * time.Hour)),
		},
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	signedRefreshToken, err := refreshToken.SignedString([]byte(refreshSecretKey))
	if err != nil {
		return "", "", err
	}

	return signedToken, signedRefreshToken, nil
}

// UpdateAllTokens 持久化保存用户最新的访问令牌和刷新令牌。
func UpdateAllTokens(userId, token, refreshToken string, client *mongo.Client) error {
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	updateAt, _ := time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))

	updateData := bson.M{
		"$set": bson.M{
			"token":         token,
			"refresh_token": refreshToken,
			"update_at":     updateAt,
		},
	}

	userCollection := database.OpenCollection("users", client)
	_, err := userCollection.UpdateOne(ctx, bson.M{"user_id": userId}, updateData)
	return err
}

// GetAccessToken 从请求 Cookie 中读取访问令牌。
func GetAccessToken(c *gin.Context) (string, error) {
	tokenString, err := c.Cookie(AccessTokenCookieName())
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ValidateToken 校验访问令牌的签名和过期时间。
func ValidateToken(tokenString string) (*SignedDetails, error) {
	secretKey, err := loadEnvValue("SECRET_KEY")
	if err != nil {
		return nil, err
	}

	claims := &SignedDetails{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})
	if err != nil {
		return nil, err
	}

	if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
		return nil, errors.New("unexpected signing method")
	}

	if claims.ExpiresAt.Time.Before(time.Now()) {
		return nil, errors.New("token has expired")
	}

	return claims, nil
}

// GetUserIdFromContext 从 Gin 上下文中提取已认证用户 ID。
func GetUserIdFromContext(c *gin.Context) (string, error) {
	userId, exists := c.Get("userId")
	if !exists {
		return "", errors.New("userId does not exists in this context")
	}

	id, ok := userId.(string)
	if !ok {
		return "", errors.New("unable to retrieve userId")
	}

	return id, nil
}

// GetRoleFromContext 从 Gin 上下文中提取已认证用户角色。
func GetRoleFromContext(c *gin.Context) (string, error) {
	role, exists := c.Get("role")
	if !exists {
		return "", errors.New("role does not exists in this context")
	}

	memberRole, ok := role.(string)
	if !ok {
		return "", errors.New("unable to retrieve userId")
	}

	return memberRole, nil
}

// ValidateRefreshToken 校验刷新令牌的签名和过期时间。
func ValidateRefreshToken(tokenString string) (*SignedDetails, error) {
	refreshSecretKey, err := loadEnvValue("SECRET_REFRESH_KEY")
	if err != nil {
		return nil, err
	}

	claims := &SignedDetails{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(refreshSecretKey), nil
	})
	if err != nil {
		return nil, err
	}

	if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
		return nil, errors.New("unexpected signing method")
	}

	if claims.ExpiresAt.Time.Before(time.Now()) {
		return nil, errors.New("refresh token has expired")
	}

	return claims, nil
}

// loadEnvValue 读取指定环境变量，不存在时返回错误。
func loadEnvValue(key string) (string, error) {
	_ = godotenv.Load(".env")

	value := os.Getenv(key)
	if value == "" {
		return "", errors.New(key + " is not set")
	}

	return value, nil
}
