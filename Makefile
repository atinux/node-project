MOCHA	=	./node_modules/.bin/mocha

GLOBALS	=	_DEBUG_,_INFO_
TIMEOUT	=	5000
TYPE	=	tdd

test:
		@$(MOCHA) -u tdd -t $(TIMEOUT) -R spec --globals $(GLOBALS)

.PHONY: test
