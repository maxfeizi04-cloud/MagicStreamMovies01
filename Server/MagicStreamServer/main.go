package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/GavinLonDigital/MagicStream/Server/MagicStreamServer/database"
	"github.com/GavinLonDigital/MagicStream/Server/MagicStreamServer/middleware"
	"github.com/GavinLonDigital/MagicStream/Server/MagicStreamServer/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func collectAllowedOrigins(configValue string) []string {
	defaultOrigins := []string{"http://localhost:5173", "http://127.0.0.1:5173"}
	uniqueOrigins := make(map[string]struct{}, len(defaultOrigins))
	origins := make([]string, 0, len(defaultOrigins)+2)

	for _, origin := range defaultOrigins {
		if _, exists := uniqueOrigins[origin]; exists {
			continue
		}
		uniqueOrigins[origin] = struct{}{}
		origins = append(origins, origin)
	}

	if configValue == "" {
		return origins
	}

	for _, origin := range strings.Split(configValue, ",") {
		trimmed := strings.TrimSpace(origin)
		if trimmed == "" {
			continue
		}

		if _, exists := uniqueOrigins[trimmed]; exists {
			continue
		}

		uniqueOrigins[trimmed] = struct{}{}
		origins = append(origins, trimmed)
	}

	return origins
}

func main() {
	router := gin.Default()

	if err := godotenv.Load(".env"); err != nil {
		log.Println("Warning: unable to find .env file")
	}

	router.GET("/hello", func(c *gin.Context) {
		c.String(http.StatusOK, "Hello, MagicStreamMovies!")
	})

	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	origins := collectAllowedOrigins(allowedOrigins)
	for _, origin := range origins {
		log.Println("Allowed Origin:", origin)
	}

	config := cors.Config{
		AllowOrigins:     origins,
		AllowMethods:     []string{"GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	router.Use(cors.New(config))
	router.Use(gin.Logger())

	api := router.Group("/api")
	api.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message":   "MagicStream API is running",
			"service":   "magicstream-api",
			"status":    "ok",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
	})

	var client *mongo.Client = database.Connect()
	if err := client.Ping(context.Background(), nil); err != nil {
		log.Fatalf("Failed to reach server: %v", err)
	}
	defer func() {
		if err := client.Disconnect(context.Background()); err != nil {
			log.Fatalf("Failed to disconnect from MongoDB: %v", err)
		}
	}()

	routes.SetupUnProtectedRoutes(api, client)

	protected := api.Group("")
	protected.Use(middleware.AuthMiddleWare())
	routes.SetupProtectedRoutes(protected, client)

	if err := router.Run(":8080"); err != nil {
		fmt.Println("Failed to start server", err)
	}
}
