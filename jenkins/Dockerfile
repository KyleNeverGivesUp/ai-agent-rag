FROM jenkins/jenkins:lts

USER root

# Align docker group ID with host (pass via build arg)
ARG DOCKER_GID=987
RUN groupadd -g ${DOCKER_GID} docker \
  && usermod -aG docker jenkins

# Install Node.js (from Debian repo) and docker-compose
RUN apt-get update \
  && apt-get install -y --no-install-recommends nodejs npm docker.io docker-compose \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

USER jenkins
