.PHONY: help build up down logs restart clean dev prod

help:
	@echo "MicroSaas Docker Commands"
	@echo ""
	@echo "make build        - Build Docker images"
	@echo "make up           - Start all services"
	@echo "make down         - Stop all services"
	@echo "make restart      - Restart all services"
	@echo "make logs         - View all logs"
	@echo "make logs-backend - View backend logs"
	@echo "make logs-frontend- View frontend logs"
	@echo "make clean        - Remove containers and volumes"
	@echo "make dev          - Start in development mode"
	@echo "make prod         - Show production setup info"
	@echo "make shell-db     - Access PostgreSQL shell"

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

clean:
	docker-compose down -v

dev: build up
	@echo "✓ Services started"
	@echo "  Frontend:  http://localhost:3000"
	@echo "  Backend:   http://localhost:8080"
	@echo "  Database:  localhost:5432"

shell-db:
	docker exec -it microsaas-postgres psql -U microsaas_user -d microsaas_db

prod:
	@echo "Production Deployment Steps:"
	@echo "1. Build multi-arch images: docker buildx build --platform linux/amd64,linux/arm64 -t registry/microsaas/backend:latest ./backend"
	@echo "2. Push to registry: docker push registry/microsaas/backend:latest"
	@echo "3. Update docker-compose.yml with registry images"
	@echo "4. Set JWT_SECRET and strong database passwords"
	@echo "5. Deploy with: docker stack deploy -c docker-compose.yml microsaas"
