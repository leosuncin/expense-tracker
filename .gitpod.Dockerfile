FROM gitpod/workspace-mongodb

# Install custom tools, runtimes, etc.
# For example "bastet", a command-line tetris clone:
# RUN brew install bastet
#
# More information: https://www.gitpod.io/docs/config-docker/

USER root

# Install Cypress-base dependencies
RUN apt-get update &&\
    apt-get install -yq --no-install-recommends \
    libgtk2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libnotify-dev \
    libgconf-2-4 \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    xauth \
    xvfb &&\
    apt-get clean &&\
	  rm -rf /var/lib/apt/lists/*

RUN pip install httpie

USER gitpod

ENV MONGO_URL=mongodb://localhost/admin
