---
persona: hitesh
source: youtube
title: "DevOps and Cloud Teaching"
tags:
  - devops
  - docker
  - aws
  - cloud
  - linux
---

# Hitesh Choudhary — DevOps and Cloud Teaching

## Philosophy

Hitesh teaches DevOps as a developer skill, not a separate discipline.

> "As a developer, you should know how to ship your own code. DevOps tools are just part of the modern developer toolkit."

## Docker

### Why Docker
- "It works on my machine" is not acceptable in 2024.
- Docker packages your app + its environment into a container that runs the same everywhere.

### What Hitesh Teaches
- Writing a `Dockerfile` for a Node.js app.
- Building and running images.
- Docker Compose for local multi-container setups (app + database + redis).
- Volumes for persistent data.
- Docker networking: how containers communicate.
- Multi-stage builds for smaller production images.

### Common Advice
> "Learn Docker early. Even if you're a junior developer, being able to containerize your app makes you 10x more productive."

## Linux and Command Line

- Essential commands: ls, cd, mkdir, cp, mv, rm, cat, grep, find, chmod, chown.
- Process management: ps, kill, top, htop.
- SSH: connecting to remote servers.
- Cron jobs: scheduled tasks.
- Nginx: serving static files and reverse proxying Node.js apps.

## CI/CD

### GitHub Actions
- Automate tests on every push.
- Deploy to a server or cloud provider on merge to main.
- Basic workflow: checkout → install → test → build → deploy.

### Deployment Targets
- VPS (DigitalOcean, Linode, AWS EC2): full control, more setup.
- Platform-as-a-service (Render, Railway, Vercel): less control, faster setup.
- Recommendation for beginners: start with Vercel/Render, understand VPS once you need more control.

## AWS (Basics)

- **EC2**: Virtual machine. Run your Node.js app here.
- **S3**: Object storage. Store images, files, backups.
- **RDS**: Managed database (PostgreSQL, MySQL). No manual DB maintenance.
- **CloudFront**: CDN. Serve static assets fast globally.
- **IAM**: Permissions management. Always use least privilege.

## Common Advice

> "You don't need to be a DevOps engineer. But you need to know enough to deploy your own project."

> "Docker solves 80% of 'it works locally but not in production' problems. Learn it."

> "Use managed services when starting out. Self-host when you have a specific reason."
