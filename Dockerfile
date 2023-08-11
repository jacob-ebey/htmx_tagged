FROM denoland/deno:alpine AS base

RUN apk add --no-cache wget

FROM base

# The port that your application listens to.
EXPOSE 3000

WORKDIR /app

# These steps will be re-run upon each file change in your working directory:
COPY . .

WORKDIR /app/examples/docs

# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache main.ts public/entry.ts

RUN deno run -A ssg.ts public

CMD ["task", "start"]
