package middleware

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
)

func TestAcquirePermitTimesOutWhenLimiterIsFull(t *testing.T) {
	t.Parallel()

	permits := make(chan struct{}, 1)
	permits <- struct{}{}

	err := acquirePermit(context.Background(), permits, 20*time.Millisecond)
	if !errors.Is(err, errAcquireTimeout) {
		t.Fatalf("expected errAcquireTimeout, got %v", err)
	}
}

func TestConcurrencyLimiterRejectsBusyRequests(t *testing.T) {
	t.Parallel()

	gin.SetMode(gin.TestMode)

	engine := gin.New()
	engine.Use(NewConcurrencyLimiter("test_limit", 1, 20*time.Millisecond))

	started := make(chan struct{})
	release := make(chan struct{})
	firstDone := make(chan struct{})

	engine.GET("/slow", func(c *gin.Context) {
		close(started)
		<-release
		c.Status(http.StatusOK)
	})

	server := httptest.NewServer(engine)
	defer server.Close()

	go func() {
		defer close(firstDone)
		resp, err := http.Get(server.URL + "/slow")
		if err != nil {
			t.Errorf("first request failed: %v", err)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Errorf("expected first request status 200, got %d", resp.StatusCode)
		}
	}()

	<-started

	resp, err := http.Get(server.URL + "/slow")
	if err != nil {
		t.Fatalf("second request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusServiceUnavailable {
		t.Fatalf("expected busy request status 503, got %d", resp.StatusCode)
	}

	close(release)
	<-firstDone
}
