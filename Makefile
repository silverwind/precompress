node_modules: package-lock.json
	npm install --no-save
	@touch node_modules

.PHONY: deps
deps: node_modules

.PHONY: lint
lint: node_modules
	npx eslint --color --quiet *.js

.PHONY: test
test: lint build node_modules
	NODE_OPTIONS="--experimental-vm-modules --no-warnings" npx jest --color

.PHONY: build
build: node_modules
# workaround for https://github.com/evanw/esbuild/issues/1921
	npx esbuild --log-level=warning --platform=node --target=node14 --format=esm --bundle --minify --outdir=bin --legal-comments=none --banner:js="import {createRequire} from 'module';const require = createRequire(import.meta.url);" ./precompress.js
	chmod +x bin/precompress.js

.PHONY: publish
publish:
	git push -u --tags origin master
	npm publish

.PHONY: update
update: node_modules
	npx updates -cu
	rm -f package-lock.json
	npm install
	@touch node_modules

.PHONY: patch
patch: test node_modules
	npx versions -Cc 'make build' patch
	@$(MAKE) --no-print-directory publish

.PHONY: minor
minor: test node_modules
	npx versions -Cc 'make build' minor
	@$(MAKE) --no-print-directory publish

.PHONY: major
major: test node_modules
	npx versions -Cc 'make build' major
	@$(MAKE) --no-print-directory publish
