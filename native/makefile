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

# analysis: $(SOURCE)
# 	scan-build $(CC) $(SOURCE) $(COMPILER_FLAGS) $(LINKER_FLAGS) -o $(NAME) $(LIBS)

# sanitize: $(SOURCE)
# 	$(CC) $(SOURCE) $(COMPILER_FLAGS) -fsanitize=address $(LINKER_FLAGS) -o $(NAME) $(LIBS)

# valgrind: $(SOURCE)
# 	$(CC) $(SOURCE) $(COMPILER_FLAGS) -g $(STACK_TRACE) $(LINKER_FLAGS) -o $(NAME) $(LIBS)

all: $(NAME)

analysis: PREFIX = scan-build
analysis: all

addresses: COMPILER_FLAGS += -fsanitize=address
addresses: all

valgrind: COMPILER_FLAGS += -g
valgrind: all

$(NAME): $(HEADERS) $(OBJECTS)
	$(PREFIX) $(CC) $(OBJECTS) $(COMPILER_FLAGS) $(LINKER_FLAGS) -o $(NAME) $(LIBS)

objects/%.o: source/%.c
	mkdir -p $(dir $@)
	$(CC) -c $< $(COMPILER_FLAGS) $(LINKER_FLAGS) -o $@ $(LIBS)

.PHONY: list-source list-objects help clean

clean:
	rm -rf ./objects
	rm ./$(NAME)

list-source:
	@echo $(SOURCE)

list-objects:
	@echo $(OBJECTS)

help:
	@echo "Scroll & Sigil"
	@echo "> all"
	@echo "> scroll-and-sigil"
	@echo "> list-source"
	@echo "> list-objects"
