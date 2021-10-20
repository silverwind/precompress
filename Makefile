node_modules: package-lock.json
	npm install --no-save
	@touch node_modules

deps: node_modules

lint:
	npx eslint --color --quiet *.js

test: lint build node_modules
	NODE_OPTIONS="--experimental-vm-modules --no-warnings" npx jest --color

build: node_modules
	npx ncc build precompress.js -q -m -o bin
	mv bin/index.js bin/precompress.js
	chmod +x bin/precompress.js

publish:
	git push -u --tags origin master
	npm publish

update: node_modules
	npx updates -cu
	rm -f package-lock.json
	npm install
	@touch node_modules

patch: test node_modules
	npx versions -Cc 'make build' patch
	@$(MAKE) --no-print-directory publish

minor: test node_modules
	npx versions -Cc 'make build' minor
	@$(MAKE) --no-print-directory publish

major: test node_modules
	npx versions -Cc 'make build' major
	@$(MAKE) --no-print-directory publish

.PHONY: lint test build publish deps update patch minor major
