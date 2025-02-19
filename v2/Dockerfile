# Stage 1: FFmpeg base
FROM node:20-slim AS ffmpeg-base
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Stage 2: Final image
FROM ffmpeg-base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set environment variables
ENV PATH="/app/bin:${PATH}"

# Default command
# TODO: add media-auto as well
ENTRYPOINT ["media"]
CMD ["--help"]
