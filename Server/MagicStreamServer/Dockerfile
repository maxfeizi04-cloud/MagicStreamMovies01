FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /magicstream-api ./main.go

FROM alpine:3.21

RUN apk add --no-cache ca-certificates && \
    addgroup -S app && \
    adduser -S app -G app

WORKDIR /app

COPY --from=builder /magicstream-api /usr/local/bin/magicstream-api

EXPOSE 8080

USER app

CMD ["magicstream-api"]
