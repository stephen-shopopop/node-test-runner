#!make

## Set 'bash' as default shell
SHELL := $(shell which bash)

default: help

.PHONY: help
help: ## Show this help
	@echo 'Usage: make [target] ...'
	@echo ''
	@echo 'targets:'
	@egrep -h '^[a-zA-Z0-9_\/-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort -d | awk 'BEGIN {FS = ":.*?## "; printf "Usage: make \033[0;34mTARGET\033[0m \033[0;35m[ARGUMENTS]\033[0m\n\n"; printf "Targets:\n"}; {printf "  \033[33m%-25s\033[0m \033[0;32m%s\033[0m\n", $$1, $$2}'


.PHONY: release
release:
	git tag $(VERSION)
	git push --tags
