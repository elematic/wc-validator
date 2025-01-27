# Official lightweight Node.js image
# https://hub.docker.com/_/node
FROM node:22.10-slim

# Arbitrary but conventional working directory
WORKDIR /usr/src/app

# Note we isolate work across sub-packages below, organized from least to most
# likely to change, to maximize Docker filesystem layer cache hits. For example,
# organized this way a site content only change will usually only need to
# execute the final Eleventy build step.

# npm package configurations
COPY package*.json tsconfig-base.json ./
COPY packages/wc-validator-server/package*.json ./packages/wc-validator-server/

# npm package installation, with no symlinks
WORKDIR /usr/src/app/packages/wc-validator-server
RUN npm i --install-links --workspaces=false

# Package content
WORKDIR /usr/src/app/
COPY packages/wc-validator-server/ ./packages/wc-validator-server/

# Build
WORKDIR /usr/src/app/packages/wc-validator-server
RUN npm run build

# Run the web service on container startup.
#
# IMPORTANT: Keep --max-old-space-size in sync with the memory setting of the
# Cloud Run service. 384MB is 75% of the 512MB memory limit for the service.
#
# (Node isn't aware of Docker memory limits, so if we don't set this flag we're
# at higher risk for termination and restart. This value determines when V8
# decides to perform garbage collection. Node uses sysinfo totalram as the
# default limit [1], which will be higher than our Docker memory limit.)
#
# [0] https://nodejs.org/api/cli.html#cli_max_old_space_size_size_in_megabytes
# [1] https://github.com/nodejs/node/pull/25576
CMD [ "node", "--max-old-space-size=384", "index.js" ]
