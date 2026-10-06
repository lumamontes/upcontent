CONTENT_PATH ?= $(HOME)/www/my-content-repo
REPO_URL ?=
BASE_PATH ?=
SITE_URL ?=

.PHONY: dev build preview check-golden check-external

define prepare-content
	@test -d "$(CONTENT_PATH)" || (printf 'Content path does not exist: %s\n' "$(CONTENT_PATH)" >&2; exit 1)
	@rm -f src/content/docs
	@ln -s "$(abspath $(CONTENT_PATH))" src/content/docs
endef

dev:
	$(prepare-content)
	REPO_URL=$(REPO_URL) BASE_PATH=$(BASE_PATH) SITE_URL=$(SITE_URL) pnpm exec astro dev

build:
	$(prepare-content)
	REPO_URL=$(REPO_URL) BASE_PATH=$(BASE_PATH) SITE_URL=$(SITE_URL) pnpm exec astro build

preview:
	$(MAKE) build CONTENT_PATH="$(CONTENT_PATH)" REPO_URL="$(REPO_URL)" BASE_PATH="$(BASE_PATH)" SITE_URL="$(SITE_URL)"
	pnpm exec astro preview

check-golden:
	$(MAKE) build CONTENT_PATH="$(CURDIR)"
	node scripts/verify-golden-build.mjs

check-external:
	$(MAKE) build CONTENT_PATH="$(CURDIR)/test-fixtures/external-consumer" REPO_URL="https://github.com/example/external-consumer"
	@test -f dist/index.html
	node scripts/verify-external-build.mjs
