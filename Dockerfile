FROM node:20-alpine AS development-dependencies-env
COPY pnpm-workspace.yaml turbo.json tsconfig.base.json pnpm-lock.yaml ./
COPY packages/types ./packages/types
COPY packages/schemas ./packages/schemas
COPY packages/web-admin ./packages/web-admin
WORKDIR /app
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS build-env
COPY --from=development-dependencies-env /app /app
WORKDIR /app/packages/web-admin
RUN pnpm run build

FROM node:20-alpine
COPY --from=development-dependencies-env /app/packages/web-admin/package.json ./
COPY --from=development-dependencies-env /app/packages/web-admin/node_modules ./node_modules
COPY --from=build-env /app/packages/web-admin/build ./build
WORKDIR /app
CMD ["npm", "run", "start"]
