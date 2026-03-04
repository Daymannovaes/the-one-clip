# Use a minimal base image
FROM debian:bullseye-slim

# Install required packages
RUN apt-get update && apt-get install -y alsa-utils mpg123

WORKDIR /home/user

# Copy your favorite song into the container
COPY tones/ /home/user/

# Set the default command to play the audio file with mpg123
ENTRYPOINT ["mpg123"]
