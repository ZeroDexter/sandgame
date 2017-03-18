#include "main.h"

const int WINDOW_WIDTH = 1600;
const int WINDOW_HEIGHT = 900;

const int SCREEN_WIDTH = 1600;
const int SCREEN_HEIGHT = 900;
const int SCREEN_SIZE = SCREEN_WIDTH * SCREEN_HEIGHT;
const int ARRAY_SIZE = SCREEN_SIZE * sizeof(unsigned int *);
// const int ARRAY_SIZE = SCREEN_SIZE;

unsigned int pixelsIn[ARRAY_SIZE];
unsigned int pixelsOut[ARRAY_SIZE];

SDL_Window *gWindow = NULL;

SDL_Renderer *gRenderer = NULL;

SDL_Texture *gTexture = NULL;

int leftMouseButtonDown = 0;
int rightMouseButtonDown = 0;
int mouseX = 0;
int mouseY = 0;
int hasClicked = 0;
int click = 0;
int rKey = 0;
int cKey = 0;
int xKey = 0;
int sKey = 0;

static struct timeval tm1;
int seconds = 0;
int renderCount = 0;

int rain = 0;
int step = 0;
int stepUpdate = 0;

const unsigned int typeVoid = 0;
const unsigned int typeSand = (255 << 24) | (255 << 16) | (255 << 8) | 255;
const unsigned int typeWall = (255 << 24) | (128 << 16) | (128 << 8) | 128;

void update(void)
{
  processInput();

 if(rain) makeItRain();

  // timerStart();
  processGravity();
  // timerStop();

  // printf("copy state\n");
  // timerStart();
  copyState();
  // timerStop();

  // SDL_LockTexture(gTexture, NULL, pixelsOut, SCREEN_WIDTH * sizeof(Uint32));
  //Apply the image stretched
  // SDL_Rect stretchRect;
  // stretchRect.x = 0;
  // stretchRect.y = 0;
  // stretchRect.w = SCREEN_WIDTH;
  // stretchRect.h = SCREEN_HEIGHT;
  // SDL_BlitScaled(gStretchedSurface, NULL, gScreenSurface, &stretchRect);
  SDL_UpdateTexture(gTexture, NULL, pixelsOut, SCREEN_WIDTH * sizeof(Uint32));
  // SDL_UnlockTexture(gTexture, NULL, pixelsOut, SCREEN_WIDTH * sizeof(Uint32));

  endFrame();
}

// aka "updateGameOfLife"...
void processGravity(void)
{
  for (int y = 1; y < SCREEN_HEIGHT - 1; y++)
  {
    int thisRow = y * SCREEN_WIDTH;
    // int prevRow = thisRow - SCREEN_WIDTH;
    int nextRow = thisRow + SCREEN_WIDTH;

    for (int x = 1; x < SCREEN_WIDTH - 1; x++){
      int thisIdx = thisRow + x;
      int prevIdx = x - 1;
      int nextIdx = x + 1;
      // int neighborCount = 0;

      if (pixelsIn[thisIdx] == typeVoid)
        continue;

      if (pixelsIn[thisIdx] == typeWall) {
        pixelsOut[thisIdx] = typeWall;
        continue;
      }

      

      if (pixelsOut[nextRow + x] == typeVoid)
      {
        pixelsOut[nextRow + x] = typeSand;
        pixelsOut[thisIdx] = typeVoid;
        continue;
      }

      int left = rand() % 2 == 0 ? 1 : 0;
      int moved = 0;

      if(left){
        if (pixelsOut[thisIdx - 1] == typeVoid && pixelsOut[nextRow + SCREEN_WIDTH + prevIdx] == typeVoid){ //try left
          pixelsOut[thisIdx - 1] = typeSand;
          pixelsOut[thisIdx] = typeVoid;
          moved = 1;
        }
        else if (pixelsOut[thisIdx + 1] == typeVoid && pixelsOut[nextRow + SCREEN_WIDTH + nextIdx] == typeVoid) // try right
        {
          pixelsOut[thisIdx + 1] = typeSand;
          pixelsOut[thisIdx] = typeVoid;
          moved = 1;
        }
      } else {
        if (pixelsOut[thisIdx + 1] == typeVoid && pixelsOut[nextRow + SCREEN_WIDTH + nextIdx] == typeVoid) // try right
        {
          pixelsOut[thisIdx + 1] = typeSand;
          pixelsOut[thisIdx] = typeVoid;
          moved = 1;
        }
        else if (pixelsOut[thisIdx - 1] == typeVoid && pixelsOut[nextRow + SCREEN_WIDTH + prevIdx] == typeVoid) // try left
        {
          pixelsOut[thisIdx - 1] = typeSand;
          pixelsOut[thisIdx] = typeVoid;
          moved = 1;
        }
      }

      if(moved == 0)
        pixelsOut[thisIdx] = typeSand;
    }
  }
}

void makeItRain(void){
  for (int i = 1; i < SCREEN_WIDTH - 1; i++)
  {
    int idx = SCREEN_WIDTH + i; //start at second pixel of first row
    pixelsIn[idx] = rand() % 67 == 0 ? typeSand : typeVoid;
  }
}

void processInput(void)
{
  if (leftMouseButtonDown){
    setPixelAt(mouseY, mouseX, typeSand);
  }

  if (rightMouseButtonDown)
  {
    setPixelAt(mouseY, mouseX, typeWall);
  }

  if(rKey)
    rain = rain ? 0 : 1;

  if(xKey)
    resetPixels(1);

  if(cKey)
    resetPixels(0);
}

void resetPixels(int random)
{
  for (int i = 0; i < ARRAY_SIZE; i++)
  {
    int type = typeVoid;

    if (random) type = rand() % 7 == 0 ? typeWall : typeVoid;

    pixelsIn[i] = type;
    pixelsOut[i] = type;
  }
}

void endFrame(void)
{
  if (click)
    click = 0;

  if(rKey)
    rKey = 0;

  if (cKey)
    cKey = 0;

  if (xKey)
    xKey = 0;

  if (sKey)
    sKey = 0;

  if(stepUpdate)
    stepUpdate = 0;
}

void setPixelAt(int y, int x, unsigned int type)
{
  int radius = 5;

  if(y <= radius || y >= SCREEN_HEIGHT - radius)
    return;

  if (x <= radius || x >= SCREEN_WIDTH - radius)
    return;

  for (int i = -radius; i < radius; i++)
  {
    for (int j = -radius; j < radius; j++)
    {
      int row = y * SCREEN_WIDTH + (i * SCREEN_WIDTH);
      int idx = row + x + j;

      pixelsOut[idx] = type;
    }
  }
}

void printPixels(int in)
{
  unsigned int *pixels;

  pixels = in ? &pixelsIn[0] : &pixelsOut[0];

  for (int y = 0; y < SCREEN_HEIGHT; y++)
  {
    for (int x = 0; x < SCREEN_WIDTH; x++)
    {
      printf("[%d][%d] = %u\n", y, x, *(pixels + (y * SCREEN_WIDTH + x)));
    }
  }

  free(pixels);
}

void copyState(void)
{
  for (int i = 0; i < ARRAY_SIZE; i++){
    pixelsIn[i] = pixelsOut[i];
  }
}

void handleEvents(int *quit){
  SDL_Event e;

  while (SDL_PollEvent(&e) != 0)
  {
    switch (e.type)
    {
    case SDL_QUIT:
      *quit = 1;
      break;
    case SDL_MOUSEBUTTONUP:
      if (e.button.button == SDL_BUTTON_LEFT || e.button.button == SDL_BUTTON_RIGHT)
      {
        leftMouseButtonDown = 0;
        rightMouseButtonDown = 0;
        click = 1;
      }
      break;
    case SDL_MOUSEBUTTONDOWN:
      if (e.button.button == SDL_BUTTON_LEFT) {
        leftMouseButtonDown = 1;
      }

      if (e.button.button == SDL_BUTTON_RIGHT)
      {
        rightMouseButtonDown = 1;
      }
      break;
    case SDL_MOUSEMOTION:
      mouseX = ((double)e.motion.x / WINDOW_WIDTH) * SCREEN_WIDTH;
      mouseY = ((double)e.motion.y / WINDOW_HEIGHT) * SCREEN_HEIGHT;
      break;
    case SDL_KEYDOWN:
      switch (e.key.keysym.sym)
      {
      case SDLK_r:
        rKey = 1;
        break;
      case SDLK_c:
        cKey = 1;
        break;
      case SDLK_x:
        xKey = 1;
        break;
      case SDLK_s:
        sKey = 1;
        break;
      }
      break;
    case SDL_KEYUP:
      switch(e.key.keysym.sym){
        case SDLK_s:
          step = step == 1 ? 0 : 1;
          break;
        case SDLK_u:
          stepUpdate = 1;
          break;
        }
        break;
      }
  }
}

int init(void)
{
  int success = 1;

  if (SDL_Init(SDL_INIT_VIDEO) < 0)
  {
    printf("Failed initizalizing SDL: %s\n", SDL_GetError());
    success = 0;
  }
  else
  {
    SDL_SetHint(SDL_HINT_RENDER_SCALE_QUALITY, 0);

    gWindow = SDL_CreateWindow("SDL Tutorial", SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED, WINDOW_WIDTH, WINDOW_HEIGHT, SDL_WINDOW_SHOWN);

    if (gWindow == NULL)
    {
      printf("Failed initializing window: %s\n", SDL_GetError());
      success = 0;
    }
    else
    {
      gRenderer = SDL_CreateRenderer(gWindow, -1, SDL_RENDERER_ACCELERATED);

      if (gRenderer == NULL)
      {
        printf("Failed initizalizing renderer: %s\n", SDL_GetError());
        success = 0;
      }
      else
      {
        SDL_SetRenderDrawColor(gRenderer, 0xFF, 0xFF, 0xFF, 0xFF);
      }
    }
  }

  srand(time(NULL));

  resetPixels(0);

  return success;
}

int main(int argc, char *args[])
{
  if (!init())
  {
    printf("Failed to initialize!\n");
  }
  else
  {
    gTexture = SDL_CreateTexture(gRenderer, SDL_PIXELFORMAT_ARGB8888, SDL_TEXTUREACCESS_STREAMING, SCREEN_WIDTH, SCREEN_HEIGHT);

    if (gTexture == NULL)
    {
      printf("Failed to load texture image!\n");
    }
    else
    {
      int quit = 0;

      while (!quit)
      {
        unsigned long elapsedSeconds = clock() / CLOCKS_PER_SEC;

        if(elapsedSeconds > seconds){
          seconds = elapsedSeconds;
          printf("Rendered FPS: %d\n", renderCount);
          renderCount = 0;
        }

        handleEvents(&quit);

        SDL_RenderClear(gRenderer);

        // timerStart();
        if(step == 0 || stepUpdate == 1)
          update();
        // timerStop();

        SDL_RenderCopy(gRenderer, gTexture, NULL, NULL);

        SDL_RenderPresent(gRenderer);

        ++renderCount;
      }
    }
  }

  close();

  return 0;
}

void close(void)
{
  SDL_DestroyTexture(gTexture);
  gTexture = NULL;

  SDL_DestroyRenderer(gRenderer);
  SDL_DestroyWindow(gWindow);
  gWindow = NULL;
  gRenderer = NULL;

  SDL_Quit();
}

void timerStart(void)
{
  gettimeofday(&tm1, NULL);
}

void timerStop(void)
{
  struct timeval tm2;
  gettimeofday(&tm2, NULL);

  unsigned long t = 1000 * (tm2.tv_sec - tm1.tv_sec) + (tm2.tv_usec - tm1.tv_usec) / 1000;
  printf("%lu ms\n", t);
}
