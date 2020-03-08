test: rollup
	yarn -s run eslint --color --quiet *.js
	yarn -s run jest --color

rollup:
	yarn -s run rollup --silent --compact -c rollup.config.js

publish:
	git push -u --tags origin master
	npm publish

update:
	yarn -s run updates -u
	rm -rf node_modules
	yarn

patch: test
	node versions.js -C patch
	$(MAKE) publish

minor: test
	node versions.js -C minor
	$(MAKE) publish

major: test
	node versions.js -C major
	$(MAKE) publish


.PHONY: test rollup publish update patch minor major
