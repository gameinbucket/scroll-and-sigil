NAME = scroll-and-sigil-vk

SOURCE = $(wildcard *.c)
HEADERS = $(wildcard *.h)
OBJECTS = $(patsubst %.c,objects/%.o,$(SOURCE))
DEPENDENCY = $(patsubst %.o,%.d,$(OBJECTS))
INCLUDE = -I$(VULKAN_SDK)/include

CC = gcc
COMPILER_FLAGS = -Wall -Wextra -Werror -pedantic -std=c11 $(INCLUDE)
LINKER_FLAGS =  -L$(VULKAN_SDK)/lib -lvulkan -lSDL2
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

objects/%.o: %.c
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
