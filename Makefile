CONTENT_PATH ?= $(HOME)/www/my-content-repo
IMAGE ?= upcontent:latest
REPO_URL ?=
BASE_PATH ?=
SITE_URL ?=

.PHONY: dev build preview check-external generate build-image

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

check-external:
	$(MAKE) build CONTENT_PATH="$(CURDIR)/test-fixtures/external-consumer" REPO_URL="https://github.com/example/external-consumer"
	@test -f dist/readme/index.html
	node scripts/verify-external-build.mjs

generate:
	docker run --rm \
		-e REPO_URL=$(REPO_URL) \
		-e BASE_PATH=$(BASE_PATH) \
		-e SITE_URL=$(SITE_URL) \
		-v $(abspath $(CONTENT_PATH)):/content:ro \
		-v /tmp/docs-output:/output \
		$(IMAGE)

build-image:
	docker build -t $(IMAGE) .
