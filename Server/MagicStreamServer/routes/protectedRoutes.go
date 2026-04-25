package routes

import (
	controller "github.com/GavinLonDigital/MagicStream/Server/MagicStreamServer/controllers"
	"github.com/GavinLonDigital/MagicStream/Server/MagicStreamServer/middleware"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// SetupProtectedRoutes 注册需要认证后才能访问的路由。
func SetupProtectedRoutes(router *gin.Engine, client *mongo.Client, reviewLimiter gin.HandlerFunc) {
	protected := router.Group("/")
	protected.Use(middleware.AuthMiddleWare())

	protected.GET("/movie/:imdb_id", controller.GetMovie(client))
	protected.POST("/addmovie", controller.AddMovie(client))
	protected.GET("/recommendedmovies", controller.GetRecommendedMovies(client))

	if reviewLimiter != nil {
		protected.PATCH("/updatereview/:imdb_id", reviewLimiter, controller.AdminReviewUpdate(client))
		return
	}

	protected.PATCH("/updatereview/:imdb_id", controller.AdminReviewUpdate(client))
}
