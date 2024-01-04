FROM ubuntu:20.04
# pin 20.04 because the gyp-node doesn't work with gnu++17

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    && apt-get install -y build-essential libgl1-mesa-dev curl pkg-config \
    && apt-get install -y libxi-dev \
    && apt-get install -y python-is-python3 git \
    && apt-get install -y xvfb \
    && apt-get install -y chromium-browser

RUN curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y nodejs
RUN node -v
RUN npm install --global yarn

WORKDIR /usr/local/kepler.gl
ADD ./webapp/kepler.gl ./

RUN export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
RUN yarn global add "puppeteer@19.11.1" && yarn
