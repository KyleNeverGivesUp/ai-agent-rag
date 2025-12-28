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
        sh '''
          cd /home/kyle/Projects/ai-agent-rag
          if git diff --name-only HEAD~1 HEAD | grep -E "(^ai-backend/requirements.txt|^ai-backend/Dockerfile)"; then
            docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
          else
            docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
          fi
        '''
      }
    }
  }
}
