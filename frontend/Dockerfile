# syntax = docker/dockerfile:1

FROM node:22.8.0-slim as base

ARG PORT=80

ENV NODE_ENV=production

WORKDIR /src

# Build
FROM base as build

COPY ./app .
RUN yarn install --production=false
RUN yarn build

# Run
FROM base

ENV PORT=$PORT

COPY --from=build /src/.output /src/.output
# Optional, only needed if you rely on unbundled dependencies
# COPY --from=build /src/node_modules /src/node_modules

CMD [ "node", ".output/server/index.mjs" ]
