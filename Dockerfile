# Spydr Docker Image
# Based on official Playwright image with all dependencies pre-installed

FROM mcr.microsoft.com/playwright:v1.53.0-focal

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN groupadd --gid 1000 spydr \
  && useradd --uid 1000 --gid spydr --shell /bin/bash --create-home spydr

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Change ownership to spydr user
RUN chown -R spydr:spydr /app

# Switch to non-root user
USER spydr

# Create output directory
RUN mkdir -p /app/crawl-output

# Set environment variables
ENV NODE_ENV=production
ENV SPYDR_HEADLESS=true

# Default command
CMD ["node", "dist/cli.js", "--help"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('Spydr container is healthy')" || exit 1

# Metadata
LABEL maintainer="Spydr Contributors"
LABEL description="Advanced web crawler with stealth capabilities"
LABEL version="2.0.0"