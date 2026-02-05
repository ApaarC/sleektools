# Deployment Guide

This guide covers deploying SleekTools to production environments.

## 📋 Pre-Deployment Checklist

- [ ] Update environment variables for production
- [ ] Run tests and linting
- [ ] Build and test locally
- [ ] Review security configurations
- [ ] Set up monitoring/logging

---

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `frontend` folder as root directory

2. **Configure Build Settings**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.com/api
   VITE_WS_URL=wss://your-backend-url.com/ws/chat
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically deploy on every push to main

### Option 2: Netlify

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - New site from Git
   - Select repository

2. **Build Settings**
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```

3. **Environment Variables**
   - Add in Site settings > Build & deploy > Environment

4. **Create `netlify.toml`**
   ```toml
   [build]
     base = "frontend"
     publish = "dist"
     command = "npm run build"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### Option 3: Static Hosting (S3/CloudFront)

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Configure CloudFront**
   - Create distribution pointing to S3
   - Set up SSL certificate
   - Configure error pages to return index.html for SPA routing

---

## ⚙️ Backend Deployment

### Option 1: Docker + Any Cloud Provider

1. **Create Dockerfile** (already included)
   ```dockerfile
   FROM eclipse-temurin:17-jdk-alpine
   WORKDIR /app
   COPY target/*.jar app.jar
   EXPOSE 8080
   ENTRYPOINT ["java", "-jar", "app.jar"]
   ```

2. **Build Docker Image**
   ```bash
   cd backend
   mvn clean package -DskipTests
   docker build -t sleektools-backend .
   ```

3. **Push to Registry**
   ```bash
   # Docker Hub
   docker tag sleektools-backend your-username/sleektools-backend
   docker push your-username/sleektools-backend

   # Or AWS ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
   docker tag sleektools-backend your-account.dkr.ecr.us-east-1.amazonaws.com/sleektools-backend
   docker push your-account.dkr.ecr.us-east-1.amazonaws.com/sleektools-backend
   ```

4. **Deploy to Cloud**
   - AWS ECS/Fargate
   - Google Cloud Run
   - Azure Container Instances
   - DigitalOcean App Platform

### Option 2: Railway

1. **Connect GitHub Repository**
   - Go to [railway.app](https://railway.app)
   - New Project > Deploy from GitHub
   - Select repository

2. **Configure Settings**
   ```
   Root Directory: backend
   Build Command: mvn clean install -DskipTests
   Start Command: java -jar target/sleektools-backend-1.0.0.jar
   ```

3. **Environment Variables**
   ```
   CORS_ALLOWED_ORIGINS=https://your-frontend-url.com
   JAVA_OPTS=-Xmx512m
   ```

### Option 3: Render

1. **Create Web Service**
   - Go to [render.com](https://render.com)
   - New > Web Service
   - Connect repository

2. **Configure**
   ```
   Root Directory: backend
   Environment: Java
   Build Command: mvn clean install -DskipTests
   Start Command: java -jar target/sleektools-backend-1.0.0.jar
   ```

3. **Environment Variables**
   ```
   CORS_ALLOWED_ORIGINS=https://your-frontend-url.com
   ```

### Option 4: AWS Elastic Beanstalk

1. **Package Application**
   ```bash
   cd backend
   mvn clean package -DskipTests
   ```

2. **Create Application**
   ```bash
   eb init sleektools-backend --platform java-17
   eb create production
   ```

3. **Configure Environment**
   ```bash
   eb setenv CORS_ALLOWED_ORIGINS=https://your-frontend-url.com
   ```

---

## 🔧 Production Configuration

### Backend `application-prod.properties`

```properties
# Server
server.port=${PORT:8080}

# CORS - Update with your frontend URL
cors.allowed-origins=${CORS_ALLOWED_ORIGINS:https://sleektools.app}

# Chat Settings
chat.room.max-duration-hours=6
chat.room.max-participants=50
chat.room.id-length=6
chat.message.max-length=2000

# Logging
logging.level.root=WARN
logging.level.com.sleektools=INFO

# Actuator
management.endpoints.web.exposure.include=health
```

### Frontend Environment

```env
# Production
VITE_API_URL=https://api.sleektools.app/api
VITE_WS_URL=wss://api.sleektools.app/ws/chat
```

---

## 🔒 SSL/HTTPS Setup

### Frontend (Automatic with Vercel/Netlify)
- SSL is automatically configured

### Backend
1. **Use a reverse proxy** (nginx, Caddy)
2. **Or use cloud provider's load balancer** with SSL termination
3. **For Railway/Render** - SSL is automatic

### WebSocket over HTTPS
- Use `wss://` instead of `ws://`
- Ensure your proxy/load balancer supports WebSocket upgrade

---

## 📊 Monitoring

### Health Check Endpoint
```
GET /api/health
```

### Recommended Tools
- **Uptime**: UptimeRobot, Pingdom
- **Logging**: Datadog, Logtail, AWS CloudWatch
- **APM**: New Relic, Datadog APM

---

## 🚀 CI/CD Pipeline Example (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: frontend

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: 17
          distribution: temurin
      - run: cd backend && mvn clean package -DskipTests
      - uses: akhileshns/heroku-deploy@v3.12.14
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: sleektools-backend
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
          appdir: backend
```

---

## 📝 Post-Deployment

1. **Verify Health Endpoints**
   ```bash
   curl https://api.sleektools.app/api/health
   ```

2. **Test WebSocket Connection**
   ```javascript
   const ws = new WebSocket('wss://api.sleektools.app/ws/chat/TEST123')
   ```

3. **Monitor Logs**
   - Check for startup errors
   - Monitor memory usage
   - Watch for rate limiting issues

4. **Set Up Alerts**
   - Downtime alerts
   - Error rate alerts
   - Response time alerts

---

## 🆘 Troubleshooting

### Frontend Issues
- **Blank Page**: Check browser console, verify build output
- **API Errors**: Verify CORS settings, check API URL
- **WebSocket Fails**: Ensure wss:// for HTTPS, check proxy config

### Backend Issues
- **Port Conflicts**: Use `PORT` environment variable
- **Memory Issues**: Increase heap size with `JAVA_OPTS=-Xmx512m`
- **CORS Errors**: Verify allowed origins match frontend URL exactly

### WebSocket Issues
- **Connection Refused**: Check firewall rules, WebSocket upgrade headers
- **Timeout**: Increase timeout settings on load balancer
- **SSL Issues**: Ensure proper certificate chain

---

Happy Deploying! 🚀
