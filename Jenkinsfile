pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps {
        sh 'cd /work/ai-agent-rag && git pull origin main'
      }
    }

    stage('Build Frontend') {
      steps {
        sh 'cd /work/ai-agent-rag/frontend && npm install && npm run build'
      }
    }

    stage('Deploy') {
      steps {
        sh 'cd /work/ai-agent-rag && docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d'
        sh 'cd /work/ai-agent-rag && docker-compose -f docker-compose.jenkins.yml up -d'
      }
    }
  }
}
