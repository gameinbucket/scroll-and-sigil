NAME = scroll-and-sigil

SOURCE = $(wildcard source/*.c) $(wildcard source/**/*.c)
HEADERS = $(wildcard source/*.h) $(wildcard source/**/*.h)
OBJECTS = $(patsubst source/%.c,objects/%.o,$(SOURCE))
DEPENDENCY = $(patsubst %.o,%.d,$(OBJECTS))
INCLUDE = -Isource/

CC = gcc
COMPILER_FLAGS = -Wall -Wextra -Werror -pedantic -std=c11 $(INCLUDE)
LINKER_FLAGS = -lSDL2 -lSDL2_mixer -lpng -lzip -lGL -lGLEW 
LIBS = -lm
PREFIX =

.PHONY: all analysis address valgrind clean list-source list-objects test help

all: $(NAME)

-include $(DEPENDENCY)

analysis: PREFIX = scan-build
analysis: all

address: COMPILER_FLAGS += -fsanitize=address
address: all

valgrind: COMPILER_FLAGS += -g
valgrind: all
	@ ./valgrind.sh

$(NAME): $(HEADERS) $(OBJECTS)
	$(PREFIX) $(CC) $(OBJECTS) $(COMPILER_FLAGS) $(LINKER_FLAGS) -o $(NAME) $(LIBS)

objects/%.o: source/%.c
	@mkdir -p $(dir $@)
	$(CC) -c $< $(COMPILER_FLAGS) -MMD $(LINKER_FLAGS) -o $@ $(LIBS)

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
