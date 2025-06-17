# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm start` or `npm run dev` - Start Vite development server
- `npm run preview` - Preview the production build locally

### Production Build & Deploy
- `npm run build` - Build static site using custom Node.js build system
- `npm run deploy` - Build and upload to S3
- `npm run upload` - Upload built files to S3

### Development Server Setup
For HTTPS development, first create SSL certificates:
```bash
# Generate localhost certificate (see README.md for full instructions)
# Add to system keychain and trust
npm start
```

## Architecture Overview

The site was originally built using a custom made static site generator:
- **Custom build system** (`build.js`) - Processes markdown posts, generates static HTML
- **Legacy client-side assets** (`client/`) - Existing JavaScript and styles

It is in the process of conversion to use vite instead:

- **Modern Vite/React frontend** (`src/`) - Interactive components and client-side routing
- ssg not implemented yet

### Key Architecture Components

**Legacy Static Site Generation (`build.js`)**
- Reads posts from `posts.json` metadata and `posts/*.md` files
- Uses Mustache templates (`templates/`) for HTML generation
- Generates individual post pages and RSS feed
- Handles asset bundling via Rollup for client-side JavaScript

**Modern React App (`src/`)**
- Vite-powered TypeScript/React application
- Hash-based routing using `useHash` hook
- Renders post list and individual posts
- Imports styles from both `src/` and legacy `client/` directories
 
### Post System
- Post metadata: `posts.json` (id, slug, title, author, created, published)
- Post content: `posts/*.md` markdown files
- React components can be embedded in markdown (processed by build system)
- Generated JavaScript bundles per post for interactive content

### Asset Pipeline
- legacy: 
    - **Rollup** (`rollup.config.js`) handles legacy client-side assets and post-specific bundles
    - Styles: Mix of CSS, LESS, and CSS modules across both systems
    - Static files: Stored in `html/` directory and synced to `build/`
- modern:
    - **Vite** handles modern React app bundling (`src/`)
    - ssg not implemented yet

### TypeScript Configuration
- Uses TypeScript project references (`tsconfig.json`)
- Strict mode enabled with comprehensive linting rules
- Separate configs for app (`tsconfig.app.json`) and Node.js build scripts

## Development Notes

### Working with Posts
- Add post metadata to `posts.json`
- Create corresponding `.md` file in `posts/`
- Set `"published": false` for drafts
- React components in posts are processed during build

### Deployment
- legacy deployment:
    - Site is deployed to S3 via `upload.js`
    - Build process syncs static files from `html/` to `build/`
    - Generated assets go to `build/assets/generated/`

### Legacy vs Modern Code
- `client/` directory contains legacy client JavaScript and styles
- `src/` directory contains modern TypeScript/React code


### coding choices
- generally prefer a functional style over object-oriented style, though keep it simple and not overly clever
- prefer an immutable approach where it makes sense
- more generally, look up documentation for library functions rather than trying to remember their APIs, similarily look up the latest recommended examples for configuration files
- colocate tests with the code they test using `__tests__` subdirectories
- lean towards less dependencies where possible, using dependencies for high leverage cases only. install dependencies as they are actually needed in code, rather than eagerly. don't forget to save dependencies to package.json. make sure you use the latest stable versions of libraries, by installing them via command rather than guessing the version
- generally, don't overengineer; you should think ahead to the features we will need but don't just add unnecessary typical features because of checklist-oriented software development. add features as needed. keep it simple and always in a working, testable state, but as complexity grows be sure to reevaluate and if it gets too messy, refactor into sensible pieces.
- after each new feature is complete, test changes and then once accepted, commit them, so we have reasonably sized checkpoints if we need to roll back