SOURCE = $(wildcard src/*.c) $(wildcard src/**/*.c)  
INCLUDE = src/
CC = gcc
STACK_TRACE = -fsanitize=address
COMPILER_FLAGS = -Wall -Wextra -Werror -pedantic -std=c11 -I$(INCLUDE) -fmax-errors=10
LINKER_FLAGS = -lSDL2 -lGL -lGLEW 
NAME = scroll-and-sigil
main : $(SOURCE)
	$(CC) $(SOURCE) $(COMPILER_FLAGS) $(LINKER_FLAGS) -o $(NAME)

