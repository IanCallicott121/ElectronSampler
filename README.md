# Electron Sampler

## Run The App

### First time

Install dependencies, then start the Electron app:

```bash
npm install
npm start
```

### Subsequent runs

If dependencies are already installed, just start the app:

```bash
npm start
```

## Project Overview

This is a small Electron UI playground with:

- A single main-process window in `main.js`
- A minimal preload bridge in `preload.js`
- A static renderer in `index.html`, `renderer.js`, and `styles.css`
