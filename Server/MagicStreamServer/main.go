package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/GavinLonDigital/MagicStream/Server/MagicStreamServer/database"
	"github.com/GavinLonDigital/MagicStream/Server/MagicStreamServer/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func main() {
	router := gin.Default()

	router.GET("/hello", func(c *gin.Context) {
		c.String(200, "Hello, MagicStreamMovies!")
	})
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"service": "MagicStream API",
			"status":  "ok",
			"time":    time.Now().UTC(),
		})
	})

	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Warning: unable to find .env file")
	}

	origins := resolveAllowedOrigins(os.Getenv("ALLOWED_ORIGINS"))
	for _, origin := range origins {
		log.Println("Allowed Origin:", origin)
	}

	config := cors.Config{}
	config.AllowOrigins = origins
	config.AllowMethods = []string{"GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"}
	//config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	config.ExposeHeaders = []string{"Content-Length"}
	config.AllowCredentials = true
	config.MaxAge = 12 * time.Hour

	router.Use(cors.New(config))
	router.Use(gin.Logger())

	var client *mongo.Client = database.Connect()

	if err := client.Ping(context.Background(), nil); err != nil {
		log.Fatalf("Failed to reach server: %v", err)
	}
	defer func() {
		err := client.Disconnect(context.Background())
		if err != nil {
			log.Fatalf("Failed to disconnect from MongoDB: %v", err)
		}

	}()

	routes.SetupUnProtectedRoutes(router, client)
	routes.SetupProtectedRoutes(router, client)

	if err := router.Run(":8080"); err != nil {
		fmt.Println("Failed to start server", err)
	}
}

func resolveAllowedOrigins(raw string) []string {
	origins := []string{
		"http://localhost:5173",
		"http://127.0.0.1:5173",
	}
	seen := map[string]struct{}{}
	resolved := make([]string, 0, len(origins)+2)

	addOrigin := func(origin string) {
		origin = strings.TrimSpace(origin)
		if origin == "" {
			return
		}
		if _, exists := seen[origin]; exists {
			return
		}
		seen[origin] = struct{}{}
		resolved = append(resolved, origin)
	}

	for _, origin := range origins {
		addOrigin(origin)
	}

	if raw == "" {
		return resolved
	}

	for _, origin := range strings.Split(raw, ",") {
		addOrigin(origin)
	}

	return resolved
}
