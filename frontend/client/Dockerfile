# Stage 1: Build React/Vite app
FROM node:18 AS build



WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Build the app for the requested environment (e.g. a-dev, a-uat, a-prod, o-Dev, o-UAT, o-Prod, local).
# If ENVIRONMENT is not set at build time, it falls back to the default build.
ARG ENVIRONMENT
ENV ENVIRONMENT=${ENVIRONMENT}
RUN echo "Build ENVIRONMENT=${ENVIRONMENT:-<not set>}" && \
    if [ -z "$ENVIRONMENT" ]; then \
      echo "Running in if: npm run build:a-Dev"; \
      npm run build:a-Dev; \
    else \
      echo "Running in else: npm run build:$ENVIRONMENT"; \
      npm run build:$ENVIRONMENT; \
    fi

ENV NODE_TLS_REJECT_UNAUTHORIZED=0

EXPOSE 80
 
# Define the command to run your app
# ENVIRONMENT controls which npm script runs (a-dev/a-uat/a-prod/o-Dev/o-UAT/o-Prod/local)
CMD ["sh", "-c", "if [ -z \"$ENVIRONMENT\" ]; then echo 'ENVIRONMENT not set; defaulting to a-Dev'; ENVIRONMENT='a-Dev'; fi; echo \"Running: npm run $ENVIRONMENT\"; npm run $ENVIRONMENT"]
