package middleware

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

var errAcquireTimeout = errors.New("concurrency permit acquire timeout")

// NewConcurrencyLimiter 使用带缓冲 channel 控制同时处理中的请求数量。
func NewConcurrencyLimiter(name string, maxConcurrent int, acquireTimeout time.Duration) gin.HandlerFunc {
	if name == "" {
		name = "requests"
	}
	if maxConcurrent < 1 {
		maxConcurrent = 1
	}

	permits := make(chan struct{}, maxConcurrent)

	return func(c *gin.Context) {
		if err := acquirePermit(c.Request.Context(), permits, acquireTimeout); err != nil {
			if errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
				c.Abort()
				return
			}

			c.Header("Retry-After", "1")
			c.AbortWithStatusJSON(http.StatusServiceUnavailable, gin.H{
				"error": "server is busy, please retry later",
				"limit": name,
			})
			return
		}

		defer releasePermit(permits)
		c.Next()
	}
}

func acquirePermit(ctx context.Context, permits chan struct{}, acquireTimeout time.Duration) error {
	if acquireTimeout <= 0 {
		select {
		case permits <- struct{}{}:
			return nil
		case <-ctx.Done():
			return ctx.Err()
		default:
			return errAcquireTimeout
		}
	}

	timer := time.NewTimer(acquireTimeout)
	defer timer.Stop()

	select {
	case permits <- struct{}{}:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	case <-timer.C:
		return errAcquireTimeout
	}
}

func releasePermit(permits chan struct{}) {
	<-permits
}
