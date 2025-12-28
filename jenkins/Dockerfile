FROM jenkins/jenkins:lts

USER root

# Install Node.js (from Debian repo) and docker compose plugin
RUN apt-get update \
  && apt-get install -y --no-install-recommends nodejs npm docker.io docker-compose-plugin \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

USER jenkins
