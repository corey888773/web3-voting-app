watchsrc:
	@echo "Watching for changes in src/..."
	cargo watch -q -c -w src/ -x run

watchtest:
	@echo "Watching for changes in tests/..."
	cargo watch -q -c -w tests/ -x "test -q quick_dev -- --nocapture"

stack-up:
	@echo "Starting the stack..."
	docker compose -f docker-compose.local.yaml up -d

stack-down:
	@echo "Stopping the stack..."
	docker compose -f docker-compose.local.yaml down --remove-orphans --rmi local