FROM jenkins/jenkins:lts

USER root

# Install Node.js and docker compose plugin
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates gnupg \
  && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y --no-install-recommends nodejs docker.io docker-compose-plugin \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

USER jenkins
