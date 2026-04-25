package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
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

func main() {
	router := gin.Default()

	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Warning: unable to find .env file")
	}

	origins := resolveAllowedOrigins(os.Getenv("ALLOWED_ORIGINS"))
	for _, origin := range origins {
		log.Println("Allowed Origin:", origin)
	}

	requestLimit := resolvePositiveIntFromEnv("MAX_CONCURRENT_REQUESTS", 128)
	requestWaitTimeout := resolveDurationFromEnvMS("REQUEST_LIMIT_WAIT_MS", 250*time.Millisecond)
	reviewLimit := resolvePositiveIntFromEnv("ADMIN_REVIEW_MAX_CONCURRENT", 4)
	reviewWaitTimeout := resolveDurationFromEnvMS("ADMIN_REVIEW_WAIT_MS", 500*time.Millisecond)

	log.Printf("Global request concurrency limit=%d wait_timeout=%s", requestLimit, requestWaitTimeout)
	log.Printf("Admin review concurrency limit=%d wait_timeout=%s", reviewLimit, reviewWaitTimeout)

	config := cors.Config{}
	config.AllowOrigins = origins
	config.AllowMethods = []string{"GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	config.ExposeHeaders = []string{"Content-Length"}
	config.AllowCredentials = true
	config.MaxAge = 12 * time.Hour

	router.Use(cors.New(config))
	router.Use(middleware.NewConcurrencyLimiter("global_requests", requestLimit, requestWaitTimeout))

	router.GET("/hello", func(c *gin.Context) {
		c.String(http.StatusOK, "Hello, MagicStreamMovies!")
	})
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"service": "MagicStream API",
			"status":  "ok",
			"time":    time.Now().UTC(),
		})
	})

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
	routes.SetupProtectedRoutes(
		router,
		client,
		middleware.NewConcurrencyLimiter("admin_review", reviewLimit, reviewWaitTimeout),
	)

	server := &http.Server{
		Addr:              ":8080",
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		fmt.Println("Failed to start server", err)
	}
}

// resolveAllowedOrigins 合并默认来源与环境变量来源，并去重后返回。
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

func resolvePositiveIntFromEnv(key string, fallback int) int {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}

	parsed, err := strconv.Atoi(value)
	if err != nil || parsed < 1 {
		log.Printf("Warning: invalid %s=%q, fallback to %d", key, value, fallback)
		return fallback
	}

	return parsed
}

func resolveDurationFromEnvMS(key string, fallback time.Duration) time.Duration {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}

	parsed, err := strconv.Atoi(value)
	if err != nil || parsed < 0 {
		log.Printf("Warning: invalid %s=%q, fallback to %s", key, value, fallback)
		return fallback
	}

	return time.Duration(parsed) * time.Millisecond
}
