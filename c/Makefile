OS         = $(shell uname)

CC         = g++
SDLCFLAGS  := $(shell sdl2-config --cflags)
SDLLDFLAGS := $(shell sdl2-config --libs)

CFLAGS     = -c -Wall -g -O0 $(SDLCFLAGS) -I/usr/local/include -pedantic


ifeq "$(OS)" "Darwin"
# OSX Specific stuff
LDFLAGS    = -framework OpenGL -lGLEW $(SDLLDFLAGS)
else
# everything else but OSX
LDFLAGS    = -lGL -lGLU -lGLEW $(SDLLDFLAGS)
endif


SRCDIR     = src
OBJECTDIR  = obj
OUTPUTDIR  = .

SOURCES    := $(wildcard $(SRCDIR))/*.cpp
OBJECTS    = $(patsubst $(SRCDIR)/%.cpp,$(OBJECTDIR)/%.o,$(SOURCES))
EXECUTABLE = $(OUTPUTDIR)/sand


all: $(SOURCES) $(EXECUTABLE)

run: $(EXECUTABLE)
	$(EXECUTABLE)

clean:
	rm -fv $(OBJECTDIR)/*
	rm -fv $(EXECUTABLE)

brew:
	brew install sdl2 glew

$(EXECUTABLE): $(OBJECTS)
	$(CC) $(LDFLAGS) $(OBJECTS) -o $@

$(OBJECTS): | $(OBJECTDIR)

$(OBJECTDIR):
	@mkdir -p $@

$(OBJECTDIR)/%.o : $(SRCDIR)/%.cpp
	@echo $< 
	$(CC) $(CFLAGS) -c $< -o $@

