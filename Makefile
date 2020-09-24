test: build
	yarn -s run eslint --color --quiet *.js
	yarn -s run jest --color

build:
	yarn -s run ncc build precompress.js -q -m -o .
	@mv index.js precompress

publish:
	git push -u --tags origin master
	npm publish

deps:
	rm -rf node_modules
	yarn

update:
	yarn -s run updates -u
	$(MAKE) deps

patch: test
	yarn -s run versions -Cc 'make build' patch
	$(MAKE) publish

minor: test
	yarn -s run versions -Cc 'make build' minor
	$(MAKE) publish

major: test
	yarn -s run versions -Cc 'make build' major
	$(MAKE) publish

.PHONY: test build publish deps update patch minor major
