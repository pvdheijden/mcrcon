JSHINT = node_modules/.bin/jshint
MOCHA = node_modules/.bin/mocha --reporter spec
ISTANBUL = node_modules/.bin/istanbul cover _mocha

SOURCES = index.js $(wildcard lib/*.js) $(wildcard test/*.js)
TESTS = $(wildcard test/*.js)

jshint: $(SOURCES) $(TESTS)
	$(JSHINT) $^

mocha:
	$(MOCHA)

istanbul: $(TESTS)
	$(ISTANBUL) $^

test: jshint istanbul

.PHONY: test
