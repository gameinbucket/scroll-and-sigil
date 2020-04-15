NAME = scroll-and-sigil

SOURCE = $(wildcard source/*.c) $(wildcard source/**/*.c)
HEADERS = $(wildcard source/*.h) $(wildcard source/**/*.h)
OBJECTS = $(patsubst source/%.c,objects/%.o,$(SOURCE))
INCLUDE = source/

CC = gcc
COMPILER_FLAGS = -Wall -Wextra -Werror -pedantic -std=c11 -I$(INCLUDE) -fmax-errors=10
LINKER_FLAGS = -lSDL2 -lSDL2_image -lGL -lGLEW 
LIBS = -lm
PREFIX =

.PHONY: all analysis address valgrind clean list-source list-objects help

all: $(NAME)

analysis: PREFIX = scan-build
analysis: clean all

address: COMPILER_FLAGS += -fsanitize=address
address: clean all

valgrind: COMPILER_FLAGS += -g
valgrind: clean all

$(NAME): $(HEADERS) $(OBJECTS)
	$(PREFIX) $(CC) $(OBJECTS) $(COMPILER_FLAGS) $(LINKER_FLAGS) -o $(NAME) $(LIBS)

objects/%.o: source/%.c
	@mkdir -p $(dir $@)
	$(CC) -c $< $(COMPILER_FLAGS) $(LINKER_FLAGS) -o $@ $(LIBS)

clean:
	rm -f ./$(NAME)
	rm -rf ./objects

list-source:
	@echo $(SOURCE)

list-objects:
	@echo $(OBJECTS)

TEST_SOURCE = $(wildcard tests/*.c) $(wildcard source/core/*.c) $(wildcard source/data/*.c)

test: $(TEST_SOURCE)
	$(CC) $(TEST_SOURCE) $(COMPILER_FLAGS) -o testing $(LIBS)
	@ ./testing

help:
	@echo Scroll & Sigil
	@echo > all
	@echo > scroll-and-sigil
	@echo > list-source
	@echo > list-objects
	@echo > test
