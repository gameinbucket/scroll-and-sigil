NAME = scroll-and-sigil
SOURCE = $(wildcard src/*.c) $(wildcard src/**/*.c)  
INCLUDE = src/
CC = gcc
COMPILER_FLAGS = -Wall -Wextra -Werror -pedantic -std=c11 -I$(INCLUDE) -fmax-errors=10
LINKER_FLAGS = -lSDL2 -lSDL2_image -lGL -lGLEW 
LIBS = -lm

main : $(SOURCE)
	$(CC) $(SOURCE) $(COMPILER_FLAGS) $(LINKER_FLAGS) -o $(NAME) $(LIBS)

analysis : $(SOURCE)
	scan-build $(CC) $(SOURCE) $(COMPILER_FLAGS) $(LINKER_FLAGS) -o $(NAME) $(LIBS)

sanitize : $(SOURCE)
	$(CC) $(SOURCE) $(COMPILER_FLAGS) -fsanitize=address $(LINKER_FLAGS) -o $(NAME) $(LIBS)

valgrind : $(SOURCE)
	$(CC) $(SOURCE) $(COMPILER_FLAGS) -g $(STACK_TRACE) $(LINKER_FLAGS) -o $(NAME) $(LIBS)
