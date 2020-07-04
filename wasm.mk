NAME = scroll-and-sigil.js

SOURCE = $(wildcard source/shared/**/*.c) $(wildcard source/electron/**/*.c)
HEADERS = $(wildcard source/shared/**/*.h) $(wildcard source/electron/**/*.h)
OBJECTS = $(patsubst source/%.c,compile/wasm/%.o,$(SOURCE))
DEPENDENCY = $(patsubst %.o,%.d,$(OBJECTS))
INCLUDE = -Isource/shared -Isource/electron 

CC = emcc
COMPILER_FLAGS = -Wall -Wextra -Werror -pedantic -std=c11 $(INCLUDE) -Wno-unused -Wno-unused-parameter -Wno-fastcomp
EMCC_FLAGS = -s WASM=1

.PHONY: all clean

all: $(NAME)

-include $(DEPENDENCY)

$(NAME): $(HEADERS) $(OBJECTS)
	$(CC) $(OBJECTS) $(COMPILER_FLAGS) $(EMCC_FLAGS) -o $(NAME)

compile/wasm/%.o: source/%.c
	@mkdir -p $(dir $@)
	$(CC) -c $< $(COMPILER_FLAGS) -MMD -o $@

clean:
	rm -f ./$(NAME)
	rm -rf ./compile/wasm
