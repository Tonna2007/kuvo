FROM golang:1.22-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/kuvo-api ./cmd/api

FROM alpine:3.21
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=build /out/kuvo-api /app/kuvo-api
COPY migrations /app/migrations
ENV HTTP_ADDR=:8080
EXPOSE 8080
CMD ["/app/kuvo-api"]
