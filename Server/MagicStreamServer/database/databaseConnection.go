package database

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// Connect 创建 MongoDB 客户端。
// 注意：这里返回的是 client 实例，不代表数据库一定可用；
// 真正的连通性确认由 main.go 中的 Ping 完成。
func Connect() *mongo.Client {
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Warning: unable to fund .env file")
	}

	// MONGODB_URI 由环境变量提供，例如本地 MongoDB 地址或 Atlas 集群地址。
	mongoDBURI := os.Getenv("MONGODB_URI")
	if mongoDBURI == "" {
		log.Fatal("MONGODB_URI not set!")
	}

	fmt.Println("MongoDB URI: ", mongoDBURI)

	clientOptions := options.Client().ApplyURI(mongoDBURI)
	client, err := mongo.Connect(clientOptions)
	if err != nil {
		return nil
	}

	return client
}

// OpenCollection 根据集合名返回具体的 collection 句柄。
// 这一步相当于告诉 MongoDB：我要操作哪个数据库里的哪张“表”。
func OpenCollection(collectionName string, client *mongo.Client) *mongo.Collection {
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Warning: unable to find .env file")
	}

	databaseName := os.Getenv("DATABASE_NAME")
	fmt.Println("DATABASE_NAME: ", databaseName)

	collection := client.Database(databaseName).Collection(collectionName)
	if collection == nil {
		return nil
	}

	return collection
}
