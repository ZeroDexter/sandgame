#define GLEW_STATIC
#include <GL/glew.h>
#ifdef __APPLE__
#include <OpenGL/glu.h>
#include <OpenGL/gl.h>
#else
#include <GL/glu.h>
#include <GL/gl.h>
#endif

#include <time.h>
#include <sys/time.h>
#include <stdlib.h>
#include <unistd.h>

// SDL headers
#include <SDL_main.h>
#include <SDL.h>
#include <SDL_opengl.h>

void update(void);

void processGravity(void);

void makeItRain(void);

void processInput(void);

void resetPixels(int);

void endFrame(void);

void setPixelBuffer(void);

void setPixelAt(int, int, unsigned int);

void printPixels(int);

void copyState(void);

void handleEvents(int *);

int init(void);

void close(void);

void timerStart(void);

void timerStop(void);
