# AMO reviewer build instructions

This archive contains the complete human-readable source for the submitted Firefox extension. The production `background.js` is generated from TypeScript with Bun's open-source bundler, so this source archive is attached to every AMO submission.

## Build environment

- Bun 1.3.14
- Node.js 22 or later (required by `web-ext`)
- The submitted build was produced on Windows. The build itself uses no platform-specific inputs and can also be reproduced on Mozilla's default Ubuntu reviewer environment.

Bun installation instructions: <https://bun.sh/docs/installation>

## Reproduce the extension

From the root of this extracted archive, run:

```sh
bun install --frozen-lockfile
bun run build
```

The complete extension is written to `dist/`. Compare that directory with the submitted extension package. The build does not minify the output and does not generate source maps. No environment variables, API credentials, network services, or private dependencies are needed to build it after installing the locked dependencies.

To run the same static validation used before submission:

```sh
bun run lint
```
