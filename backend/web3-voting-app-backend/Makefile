watchsrc:
	@echo "Watching for changes in src/..."
	cargo watch -q -c -w src/ -x run

watchtest:
	@echo "Watching for changes in tests/..."
	cargo watch -q -c -w tests/ -x "test -q quick_dev -- --nocapture"