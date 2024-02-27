NextJs kepler framework

# Development

## Setup environment

Install volta
  
  ```bash
  curl https://get.volta.sh | bash
  ```

Install yarn and node-gyp
  
```bash
npm install -g yarn
npm install -g node-gyp
```

The structure of the project is as follows:

```bash
├── csds_kepler/
├── geoda-lib/
├── reactgeoda/
  ├── geoda-ai/
    ├── package.json
    ├── ...
```

## 1. Get source code

Clone `csds_kepler`, `geoda-lib`, and `reactgeoda` into the same directory.

```bash
git clone https://github.com/GeoDaCenter/kepler.gl.git --branch=xli/reactgeoda csds_kepler 

git clone https://github.com/GeoDaCenter/geoda-lib.git geoda-lib

git clone https://github.com/visgl/loaders.gl.git --branch=xli/geoarrow-fix-in-mem-table loaders.gl

git clone https://github.com/GeoDaCenter/reactgeoda.git reactgeoda
```

Build dependencies
  
```bash
cd csds_kepler
yarn
```

```bash
cd loader.gl
yarn
```

For M1 users: puppeteer error when yarn csds_kepler(The chromium binary is not available for arm64):

```bash
brew install --cask chromium --no-quarantine
```
vim ~/.zshrc and add
```bash
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=`which chromium`
```
source ~/.zshrc
```bash
yarn
```

## 2. Work in react-geoda directory

```bash
cd reactgeoda/geoda-ai
yarn
```

You can run the following command to start the development server:

```bash
yarn dev
```

The landing page is at http://localhost:3000/
The geoda.ai app is at http://localhost:3000/mapland

## 3. Pull request

Create a branch and make changes. Push the branch to github and create a pull request.

When creating a PR, try to make the title easily understandable: [Feat] add new feature, [Fix] fix a bug, [Refactor] refactor code, [Doc] update documentation, etc.

You can check the preview of the PR in netlify. First, you will need to build the project:
```
yarn build-local
```
All changes will be built into the `out` folder. Then, commit the changes and push to your branch. Netlify will automatically build the preview if you include `[Preview]` in the commit message. e.g. `[Preview] add new feature`.

In case you forget including `[Preview]` in your previous commit, you can commit an empty commit with `[Preview]` in the message:

```bash
git commit --allow-empty -m "[Preview]"
```

## 4. Merge PR

After the PR is approved, you can squash merge it into the `main` branch.
Make sure the title of the merge is the same as the PR title.

The production build will be automatically deployed to netlify. You can check https://geoda.ai/ to see the latest version.





