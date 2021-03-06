NAME = scroll-and-sigil

SOURCE = $(wildcard source/*.c) $(wildcard source/**/*.c)
HEADERS = $(wildcard source/*.h) $(wildcard source/**/*.h)
OBJECTS = $(patsubst source/%.c,objects/%.o,$(SOURCE))
DEPENDENCY = $(patsubst %.o,%.d,$(OBJECTS))
INCLUDE = -Isource -I$(VULKAN_SDK)/include

COMPILER_FLAGS = -Wall -Wextra -Werror -pedantic -std=c11 $(INCLUDE)
LINKER_LIBS = -L$(VULKAN_SDK)/lib
LINKER_FLAGS = -lSDL2 -lSDL2_mixer -lpng -lzip -lvulkan -lm
PREFIX =
CC = gcc

ifneq ($(shell uname), Linux)
	CC = clang
	COMPILER_FLAGS += -Wno-nullability-extension
endif

.PHONY: all analysis address valgrind clean list-source list-objects test help

all: $(NAME)

-include $(DEPENDENCY)

analysis: PREFIX = scan-build
analysis: all

address: COMPILER_FLAGS += -fsanitize=address
address: all

gdb: COMPILER_FLAGS += -g
gdb: all
	@ gdb ./scroll-and-sigil

valgrind: COMPILER_FLAGS += -g
valgrind: all
	@ ./valgrind.sh ./scroll-and-sigil

$(NAME): $(HEADERS) $(OBJECTS)
	$(PREFIX) $(CC) $(OBJECTS) $(COMPILER_FLAGS) -o $(NAME) $(LINKER_LIBS) $(LINKER_FLAGS)

objects/%.o: source/%.c
	@mkdir -p $(dir $@)
	$(CC) -c $< $(COMPILER_FLAGS) -MMD -o $@

clean:
	rm -f ./$(NAME)
	rm -rf ./objects

list-source:
	@echo $(SOURCE)

list-headers:
	@echo $(HEADERS)

list-objects:
	@echo $(OBJECTS)

list-dependency:
	@echo $(DEPENDENCY)

TEST_SOURCE = $(wildcard tests/*.c) $(wildcard source/core/*.c) $(wildcard source/data/*.c)

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

