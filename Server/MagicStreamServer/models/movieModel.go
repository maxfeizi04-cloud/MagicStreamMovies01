package models

import (
	"go.mongodb.org/mongo-driver/v2/bson"
)

// Genre 表示电影所属类型。
// 一个电影可以同时属于多个类型，因此 Movie 中的 Genre 是切片。
type Genre struct {
	GenreID   int    `bson:"genre_id" json:"genre_id" validate:"required"`
	GenreName string `bson:"genre_name" json:"genre_name" validate:"required,min=2,max=100"`
}

// Ranking 表示影片评级。
// RankingValue 适合排序和比较，RankingName 更适合展示给用户阅读。
type Ranking struct {
	RankingValue int    `bson:"ranking_value" json:"ranking_value" validate:"required"`
	RankingName  string `bson:"ranking_name" json:"ranking_name" validate:"required"`
}

// Movie 是 movies 集合中的核心文档结构。
// 这个结构同时承担了三类职责：
// 1. 映射 MongoDB 文档
// 2. 作为接口入参/出参模型
// 3. 通过 validate 标签约束字段合法性
type Movie struct {
	ID          bson.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	ImdbID      string        `bson:"imdb_id" json:"imdb_id" validate:"required"`
	Title       string        `bson:"title" json:"title" validate:"required,min=2,max=500"`
	PosterPath  string        `bson:"poster_path" json:"poster_path" validate:"required,url"`
	YouTubeID   string        `bson:"youtube_id" json:"youtube_id" validate:"required"`
	Genre       []Genre       `bson:"genre" json:"genre" validate:"required,dive"`
	AdminReview string        `bson:"admin_review" json:"admin_review"`
	Ranking     Ranking       `bson:"ranking" json:"ranking" validate:"required"`
}
