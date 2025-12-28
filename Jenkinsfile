pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Frontend') {
      steps {
        sh 'cd frontend && npm install && npm run build'
      }
    }

    stage('Deploy') {
      steps {
        sh 'docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d'
        sh 'docker-compose -f docker-compose.jenkins.yml up -d'
      }
    }
  }
}
