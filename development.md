# Notes

## Install

At root directory, run:

```bash
yarn
```

Then, run:

```bash
yarn workspace webgeoda dev
```

## Errors

### `gyp ERR! ValueError: invalid mode: 'rU' while trying to load binding.gyp`

This is beause `U` mode has been deprecated in python 3.11, so you need to downgrade your python version to 3.10.
If you already have python 3.10 installed, you can config your `npm` to use it by running, e.g.:

```bash
npm config set python /opt/homebrew/opt/python@3.10/bin/python3.10
```

or

```
brew unlink python@3.11
brew link python@3.10
```

### `error - Error [ERR_REQUIRE_ESM]: require() of ES Module`

```
{
    "resolutions": {
        "react": "16.14.0",
        "react-dom": "16.14.0",
        "@deck.gl/core": "8.8.9",
        "@deck.gl/extensions": "8.8.9",
        "@deck.gl/layers": "8.8.9",
        "@deck.gl/mesh-layers": "8.8.9",
        "@deck.gl/react": "8.8.9",
        "@deck.gl/geo-layers": "8.8.9",
    }
}
```

### `Error: You gave us a visitor for the node type ClassAccessorProperty but it's not a valid type

    at Array.forEach (<anonymous>)`

https://github.com/babel/babel/issues/15765

```
{
    "resolutions": {
        "@babel/traverse": "7.22.6"
    }
}
```
