FROM ubuntu:20.04
# pin 20.04 because the gyp-node doesn't work with gnu++17

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    && apt-get install -y build-essential libgl1-mesa-dev curl pkg-config \
    && apt-get install -y libxi-dev \
    && apt-get install -y python-is-python3 git

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs
RUN node -v
RUN npm install -g npm@latest
RUN npm install --global yarn

WORKDIR /usr/local/reactgeoda
ADD . ./