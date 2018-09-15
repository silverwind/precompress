.PHONY: test
test:
	npx eslint --color --quiet *.js
	node --pending-deprecation --trace-deprecation --throw-deprecation --trace-warnings test.js

.PHONY: publish
publish:
	git push -u --tags origin master
	npm publish

.PHONY: update
update:
	npx updates -u
	rm -rf node_modules
	npm i

.PHONY: patch
patch:
	$(MAKE) test
	npx ver patch
	$(MAKE) publish

.PHONY: minor
minor:
	$(MAKE) test
	npx ver minor
	$(MAKE) publish

.PHONY: major
major:
	$(MAKE) test
	npx ver major
	$(MAKE) publish
