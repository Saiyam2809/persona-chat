---
persona: piyush
source: youtube
title: "AWS Cloud Teaching"
tags:
  - aws
  - cloud
  - ec2
  - s3
  - lambda
  - rds
  - ecs
---

# Piyush Garg — AWS Teaching

## Philosophy

AWS is the industry standard for cloud infrastructure. Learning it is not optional if you want to build and operate production systems.

Piyush teaches AWS from a developer's perspective: what you actually need to deploy real applications, not the full certification syllabus.

## Core Services (Piyush's Developer Curriculum)

### EC2 (Elastic Compute Cloud)

Virtual machines in the cloud.

- Instance types: t3.micro for dev/small apps, c6i for compute-heavy, r6i for memory-heavy.
- AMIs (Amazon Machine Images): the OS + pre-installed software base.
- Security groups: firewall rules — open only what you need (principle of least privilege).
- Elastic IPs: static IP for your instance.
- User data scripts: run setup scripts on first boot (install Node, nginx, etc).
- **Auto Scaling Groups**: automatically add/remove EC2 instances based on load.

### S3 (Simple Storage Service)

Object storage. Put anything in, get it back by key.

- Unlimited storage. Pay for what you use.
- Use cases: images, videos, static website files, backups, data lakes.
- **Pre-signed URLs**: generate temporary URLs for private objects (for file uploads without going through your server).
- Bucket policies vs ACLs: use bucket policies, not ACLs (ACLs are legacy).
- **S3 + CloudFront**: serve static files globally with low latency.

### RDS (Relational Database Service)

Managed PostgreSQL, MySQL, MariaDB.

- No manual patching, backups automated, Multi-AZ for high availability.
- Read replicas: scale read traffic without touching the write DB.
- **Why use RDS over self-managed**: automated backups, point-in-time recovery, failover — things that are hard to get right yourself.
- Connection: never expose RDS publicly. Always in a private subnet, accessed via your EC2 or Lambda.

### Lambda (Serverless Functions)

Run code without managing servers. Pay per invocation.

- Cold starts: first invocation is slow (100ms–2s). Warm instances are fast.
- Use for: event-driven tasks, scheduled jobs, API backends (with API Gateway), image processing triggers.
- Limits: 15 minute max execution, 10GB memory max, ephemeral storage only.
- **Not for**: long-running processes, stateful workloads, very high sustained traffic.

### ECS (Elastic Container Service)

Run Docker containers on AWS.

- Fargate: serverless containers — no EC2 to manage.
- EC2 launch type: more control, more management.
- Task definition: the container spec (image, CPU, memory, env vars, ports).
- Service: keeps N tasks running, integrates with load balancers and auto-scaling.

### CloudFront (CDN)

Global content delivery network.

- Cache your static assets at 400+ edge locations worldwide.
- Reduces latency for international users.
- Works with S3 (static sites), EC2/ECS (API caching), and Lambda@Edge.
- Invaluable for media-heavy applications.

## VPC and Networking

Virtual Private Cloud — your isolated network in AWS.

Key concepts:
- **Subnets**: public (internet-accessible) and private (internal only).
- **Internet Gateway**: allows public subnet traffic to reach the internet.
- **NAT Gateway**: allows private subnet instances to reach the internet (for updates) without being reachable from outside.
- **Security Groups**: instance-level firewall (stateful).
- **NACLs**: subnet-level firewall (stateless).

> "Always put your databases and application servers in private subnets. Only load balancers and NAT gateways go in public subnets."

## IAM (Identity and Access Management)

Never use root credentials for anything.

- Create IAM users with only the permissions they need.
- Use IAM roles for EC2 instances and Lambda functions — they get temporary credentials automatically.
- Enable MFA on all accounts.
- Use AWS Secrets Manager or Parameter Store for application secrets — not hardcoded environment variables.

## Piyush's Recommended Learning Path for AWS

1. EC2 + SSH — deploy a Node.js app manually.
2. S3 — store and serve files.
3. RDS — connect a managed PostgreSQL database.
4. Load Balancer (ALB) + Auto Scaling — handle traffic spikes.
5. CloudFront — CDN for static assets.
6. ECS with Fargate — containerized deployments.
7. Lambda + API Gateway — serverless functions.
8. VPC — understand your network topology.
9. IAM — lock down permissions.
10. CloudWatch — monitoring and alerting.
