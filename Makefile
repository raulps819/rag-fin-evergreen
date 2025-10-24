.PHONY: help build up down restart logs clean ps exec-api exec-app backup

# Colores para output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Mostrar esta ayuda
	@echo "$(BLUE)RAG Fin Evergreen - Docker Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

build: ## Construir todas las imágenes
	@echo "$(BLUE)🔨 Construyendo imágenes...$(NC)"
	docker-compose build

up: ## Iniciar todos los servicios
	@echo "$(BLUE)🚀 Iniciando servicios...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✅ Servicios iniciados$(NC)"
	@echo "Frontend: http://localhost:3000"
	@echo "API Docs: http://localhost:8000/docs"
	@echo "ChromaDB: http://localhost:8001"

down: ## Detener todos los servicios
	@echo "$(YELLOW)🛑 Deteniendo servicios...$(NC)"
	docker-compose down
	@echo "$(GREEN)✅ Servicios detenidos$(NC)"

restart: ## Reiniciar todos los servicios
	@echo "$(YELLOW)🔄 Reiniciando servicios...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✅ Servicios reiniciados$(NC)"

logs: ## Ver logs de todos los servicios
	docker-compose logs -f

logs-api: ## Ver logs solo del API
	docker-compose logs -f api

logs-app: ## Ver logs solo del frontend
	docker-compose logs -f app

logs-chromadb: ## Ver logs solo de ChromaDB
	docker-compose logs -f chromadb

ps: ## Ver estado de los servicios
	@docker-compose ps

clean: ## Limpiar contenedores, imágenes y volúmenes (⚠️  BORRA DATOS)
	@echo "$(RED)⚠️  ADVERTENCIA: Esto eliminará todos los datos$(NC)"
	@echo "$(RED)Presiona Ctrl+C para cancelar...$(NC)"
	@sleep 5
	docker-compose down -v --rmi all
	@echo "$(GREEN)✅ Limpieza completa$(NC)"

clean-volumes: ## Eliminar solo los volúmenes (⚠️  BORRA DATOS)
	@echo "$(RED)⚠️  ADVERTENCIA: Esto eliminará todos los datos persistentes$(NC)"
	@echo "$(RED)Presiona Ctrl+C para cancelar...$(NC)"
	@sleep 5
	docker-compose down -v
	@echo "$(GREEN)✅ Volúmenes eliminados$(NC)"

exec-api: ## Abrir shell en contenedor de API
	docker-compose exec api bash

exec-app: ## Abrir shell en contenedor de app
	docker-compose exec app sh

exec-postgres: ## Abrir psql en contenedor de PostgreSQL
	docker-compose exec postgres psql -U rag_user -d rag_financial

health: ## Verificar salud de servicios
	@echo "$(BLUE)🏥 Verificando salud de servicios...$(NC)"
	@echo ""
	@echo "API Health:"
	@if curl -sf http://localhost:8000/health; then \
		echo ""; \
	else \
		echo "$(RED)❌ API no responde$(NC)"; \
	fi
	@echo ""
	@echo "ChromaDB Heartbeat:"
	@if curl -sf http://localhost:8001/api/v2/heartbeat; then \
		echo ""; \
	else \
		echo "$(RED)❌ ChromaDB no responde$(NC)"; \
	fi
	@echo ""

backup-db: ## Backup de PostgreSQL database
	@echo "$(BLUE)💾 Creando backup de base de datos...$(NC)"
	@mkdir -p backups
	docker-compose exec -T postgres pg_dump -U rag_user rag_financial > ./backups/postgres_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✅ Backup creado en ./backups/$(NC)"

restore-db: ## Restaurar backup de PostgreSQL (usar BACKUP_FILE=path/to/backup.sql)
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "$(RED)❌ Error: Especifica BACKUP_FILE=path/to/backup.sql$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)📥 Restaurando backup...$(NC)"
	docker-compose exec -T postgres psql -U rag_user -d rag_financial < $(BACKUP_FILE)
	@echo "$(GREEN)✅ Backup restaurado$(NC)"

dev-setup: ## Configuración inicial para desarrollo
	@echo "$(BLUE)🔧 Configuración inicial...$(NC)"
	@if [ ! -f api/.env ]; then \
		cp api/.env.example api/.env; \
		echo "$(GREEN)✅ Creado api/.env$(NC)"; \
		echo "$(YELLOW)⚠️  Edita api/.env y agrega tu OPENAI_API_KEY$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  api/.env ya existe$(NC)"; \
	fi
	@if [ ! -f app/.env.local ]; then \
		cp app/.env.example app/.env.local; \
		echo "$(GREEN)✅ Creado app/.env.local$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  app/.env.local ya existe$(NC)"; \
	fi

dev: dev-setup build up ## Setup completo + build + up (para comenzar)
	@echo "$(GREEN)✅ Entorno de desarrollo listo!$(NC)"
	@echo ""
	@make health

rebuild: ## Reconstruir y reiniciar todo
	@echo "$(BLUE)🔨 Reconstruyendo todo...$(NC)"
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d
	@echo "$(GREEN)✅ Reconstrucción completa$(NC)"

dev-mode: ## Iniciar en modo desarrollo con hot-reload
	@echo "$(BLUE)🔥 Iniciando modo desarrollo con hot-reload...$(NC)"
	docker-compose -f docker-compose.dev.yml up --build
	@echo "$(GREEN)✅ Modo desarrollo activo$(NC)"

dev-mode-bg: ## Iniciar en modo desarrollo (background)
	@echo "$(BLUE)🔥 Iniciando modo desarrollo (background)...$(NC)"
	docker-compose -f docker-compose.dev.yml up -d --build
	@echo "$(GREEN)✅ Modo desarrollo activo en background$(NC)"

dev-mode-down: ## Detener modo desarrollo
	@echo "$(YELLOW)🛑 Deteniendo modo desarrollo...$(NC)"
	docker-compose -f docker-compose.dev.yml down
	@echo "$(GREEN)✅ Modo desarrollo detenido$(NC)"
