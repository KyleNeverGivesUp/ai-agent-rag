pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        sh 'cd /home/kyle/Projects/ai-agent-rag && git pull origin main'
      }
    }

    stage('Build Frontend') {
      steps {
        sh 'cd /home/kyle/Projects/ai-agent-rag/frontend && npm install && npm run build'
      }
    }

    stage('Deploy') {
      steps {
        sh 'cd /home/kyle/Projects/ai-agent-rag && docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d'
        sh 'cd /home/kyle/Projects/ai-agent-rag && docker-compose -f docker-compose.jenkins.yml up -d'
      }
    }
  }
}
