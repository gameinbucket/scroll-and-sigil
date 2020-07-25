NAME = scroll-and-sigil

SOURCE = $(wildcard source/shared/**/*.c) $(wildcard source/desktop/**/*.c)
HEADERS = $(wildcard source/shared/**/*.h) $(wildcard source/desktop/**/*.h)
OBJECTS = $(patsubst source/%.c,compile/objects/%.o,$(SOURCE))
DEPENDENCY = $(patsubst %.o,%.d,$(OBJECTS))
INCLUDE = -Isource/shared -Isource/desktop -I$(VULKAN_SDK)/include

COMPILER_FLAGS = -Wall -Wextra -Werror -pedantic -std=c11 $(INCLUDE) -Wno-unused -Wno-unused-parameter
LINKER_LIBS = -L$(VULKAN_SDK)/lib
LINKER_FLAGS = -lSDL2 -lSDL2_mixer -lpng -lzip -lvulkan -lm
PREFIX =
CC = gcc

ifneq ($(shell uname), Linux)
	CC = clang
	COMPILER_FLAGS += -Wno-nullability-extension
endif

.PHONY: all analysis address valgrind clean list-source list-objects test help

all: COMPILER_FLAGS += -g
all: $(NAME)

release: COMPILER_FLAGS += -O3
release: $(NAME)

-include $(DEPENDENCY)

analysis: PREFIX = scan-build
analysis: all

address: COMPILER_FLAGS += -fsanitize=address
address: all

gdb: all
	@ ./gdb.sh ./scroll-and-sigil

valgrind: all
	@ ./valgrind.sh ./scroll-and-sigil

$(NAME): $(HEADERS) $(OBJECTS)
	$(PREFIX) $(CC) $(OBJECTS) $(COMPILER_FLAGS) -o $(NAME) $(LINKER_LIBS) $(LINKER_FLAGS)

compile/objects/%.o: source/%.c
	@mkdir -p $(dir $@)
	$(CC) -c $< $(COMPILER_FLAGS) -MMD -o $@

clean:
	rm -f ./$(NAME)
	rm -rf ./compile/objects

list-source:
	@echo $(SOURCE)

list-headers:
	@echo $(HEADERS)

list-objects:
	@echo $(OBJECTS)

list-dependency:
	@echo $(DEPENDENCY)

TEST_SOURCE = $(wildcard tests/*.c) $(wildcard source/common/*.c) $(wildcard source/data/*.c)

test: $(TEST_SOURCE)
	$(CC) $(TEST_SOURCE) $(COMPILER_FLAGS) -o testing $(LIBS)
	@ ./testing

help:
	@echo Scroll & Sigil
	@echo > all
	@echo > scroll-and-sigil
	@echo > list-source
	@echo > list-headers
	@echo > list-objects
	@echo > list-dependency
	@echo > test

