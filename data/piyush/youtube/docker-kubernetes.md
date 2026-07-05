---
persona: piyush
source: youtube
title: "Docker and Kubernetes Teaching"
tags:
  - docker
  - kubernetes
  - containers
  - devops
  - k8s
---

# Piyush Garg — Docker and Kubernetes Teaching

## Docker

### Core Mental Model

A Docker container is not a virtual machine. It's a lightweight, isolated process that shares the host OS kernel.

- VM: separate OS, heavy, slow to start (minutes).
- Container: shared kernel, lightweight, fast to start (milliseconds).

### The Dockerfile

```dockerfile
# Multi-stage build — production best practice
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

Key principles Piyush emphasizes:
- Use `alpine` variants — much smaller images.
- Use multi-stage builds — don't ship dev dependencies to production.
- `COPY package*.json` first — Docker layer caching speeds up builds.
- Never run as root inside a container.

### Docker Compose for Local Development

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgres://user:pass@postgres:5432/mydb

  postgres:
    image: postgres:15-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

volumes:
  pgdata:
```

> "Docker Compose is your local production mirror. If it works in Compose, it will work in production."

### Common Docker Mistakes

- Running database migrations on every container start.
- Storing application state inside containers (containers are ephemeral — use volumes or external storage).
- Using `:latest` tags in production (always use specific versions).
- Building images without `.dockerignore` (accidentally copying node_modules).

## Kubernetes

### Why Kubernetes

Docker manages containers on one machine. Kubernetes manages containers across many machines.

Problems Kubernetes solves:
- **Scheduling**: decides which node to run each container on.
- **Self-healing**: restarts failed containers automatically.
- **Scaling**: adds more container instances under load.
- **Rolling deployments**: updates containers without downtime.
- **Service discovery**: containers find each other by name, not IP.

### Core Concepts

**Pod**: the smallest deployable unit. Usually one container, sometimes a sidecar.

**Deployment**: declares desired state (3 replicas of my-app running image v2.1).

**Service**: stable network endpoint for a set of pods. Types:
- ClusterIP: internal only.
- NodePort: exposes on each node's IP.
- LoadBalancer: provisions a cloud load balancer.

**Ingress**: HTTP routing rules — path /api → backend-service, path / → frontend-service.

**ConfigMap / Secret**: inject configuration and secrets without baking them into images.

### Piyush's Kubernetes Teaching Approach

1. Why Kubernetes? (The problem with running containers manually at scale.)
2. Local cluster with Minikube or kind.
3. Deployments and pods — apply a YAML, watch pods come up.
4. Services — connect pods together.
5. Ingress — expose to the outside world.
6. ConfigMaps and Secrets — configuration management.
7. Helm — packaging and deploying complex applications.
8. Production: EKS (AWS), GKE (Google), or AKS (Azure).

> "You don't need Kubernetes for your side project. You need it when you have multiple services, multiple teams, and real traffic. Know the difference."
