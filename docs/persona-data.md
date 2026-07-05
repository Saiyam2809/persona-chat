# Persona Data & Knowledge Base Structure

This document details how the educational resources of Hitesh Choudhary and Piyush Garg were collected, organized, and formatted for vector indexing.

## Knowledge Base Organization

The raw datasets are organized under the `data/` directory by persona:

```
data/
 ├── hitesh/
 │    ├── bio.md
 │    ├── website.md
 │    ├── products.md
 │    ├── courses.md
 │    ├── faqs.md
 │    └── youtube/ (react, javascript, nodejs, career, devops, ai-ml)
 └── piyush/
      ├── bio.md
      ├── website.md
      ├── products.md
      ├── courses.md
      ├── youtube/ (nodejs, system-design, docker-kubernetes, databases, aws)
      ├── talks/
      └── tweets/
```

## Document Formatting (YAML Frontmatter)

Every document contains structured frontmatter metadata at the top:

```markdown
---
persona: hitesh
source: youtube
title: React Learning Roadmap
url: https://youtube.com/watch?v=...
tags:
  - react
  - roadmap
---
```

### Metadata Fields

| Field | Purpose |
|---|---|
| `persona` | Used to filter vector query results (`hitesh` or `piyush`) |
| `source` | Demarcates the type of source (`youtube`, `blog`, `tweet`, `talk`, `faq`) |
| `title` | The display title used for UI citations and source badges |
| `url` | The clickable external link rendered on the user interface |
| `tags` | Broad classification labels |
