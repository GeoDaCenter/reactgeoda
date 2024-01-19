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

git clone https://oauth2:${{ secrets.GEODA_LIB_TOKEN }}@github.com/GeoDaCenter/geoda-lib.git geoda-lib

git clone https://github.com/GeoDaCenter/reactgeoda.git reactgeoda
```

Note: ask Xun Li for GEODA_LIB_TOKEN

## 2. Work in react-geoda directory

```bash
cd reactgeoda/geoda-ai
yarn
```

You can run the following command to start the development server:

```bash
yarn dev
```

Create a branch and make changes. Push the branch to github and create a pull request.

## 3. Pull request

When creating a PR, try to make the title easily understandable: [Feat] add new feature, [Fix] fix a bug, [Refactor] refactor code, [Doc] update documentation, etc.

You can check the preview of the PR in netlify. Just include `[Preview]` in the commit message. e.g. `[Preview] add new feature`.

If you have nothing to commit and just want to see the preview, you can run the following command:

```bash
git commit --allow-empty -m "[Preview]"
```





