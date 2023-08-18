NextJs kepler framework

# Development

## Setup environment

### Install dependencies

Install node using Volta

```bash
volta pin node@16
```

Note: the node version should be 16.20.x

Install dependencies

```bash
yarn
```

Start development server

```bash
yarn dev
```

You should be able to access the development server at http://localhost:3000

Start building the app

```bash
yarn build-prod
```

You will see the build output in the `out` folder. The build output is a static website. You can serve the static website using any static web server, e.g. Github Pages. The BASE_PATH environment variable should be set to the path where the app is served. For Github Pages, the BASE_PATH has been set to `/reactgeoda` by default.

Start building the app for 3rd party library

```bash
yarn build
```

For example, the map component can be built as a 3rd party library. The build output is a javascript file that can be imported by other apps. See the map.html in the `out` folder for an example.

Run lint

```bash
yarn lint
```
