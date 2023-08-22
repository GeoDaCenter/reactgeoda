FROM ubuntu:20.04

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    && apt-get install -y build-essential libgl1-mesa-dev curl pkg-config \
    && apt-get install -y libxi-dev \
    && apt-get install -y python-is-python3

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs
RUN node -v
RUN npm install -g npm@latest
RUN npm install --global yarn

WORKDIR /usr/local/reactgeoda
COPY . ./