# Lesson 4 — Docker images in CI/CD

## The idea

A **Docker image** is your app plus everything it needs (the .NET runtime, nginx, etc.) packed into one
file. It runs the same on your laptop, a teammate's PC, and any cloud. CI builds the image once,
tags it with the commit id, and pushes it to a **registry**. Deploying is then "run image X".

```
Dockerfile ──docker build──▶ image ──docker push──▶ registry (ghcr.io) ──docker pull──▶ any server
 (recipe)                  (packed app)            (image storage)
```

## The files

| File | Purpose |
|---|---|
| [`api/Dockerfile`](../api/Dockerfile) | Builds the .NET API image (multi-stage: the SDK compiles, a small runtime image runs it) |
| [`web/Dockerfile`](../web/Dockerfile) | Builds React with Node, then serves it with nginx |
| `.dockerignore` | Files not to send to Docker (bin, obj, node_modules) |
| [`docker-compose.yml`](../docker-compose.yml) | Runs both containers together with one command |

**Multi-stage build**: stage 1 has big build tools; stage 2 copies only the output. The final image is
small and contains no source code.

**Layer caching**: the Dockerfiles copy `Api.csproj` / `package.json` *before* the rest of the code.
Packages are restored in their own layer, which is reused until the dependencies change. That makes
rebuilds fast.

## Run it locally

Start Docker Desktop, then:
```bash
docker compose up --build
```
- Web: http://localhost:3000
- API: http://localhost:8080/api/health

Press `Ctrl+C` to stop. `docker compose down` removes the containers.

## What CI/CD does with images

| When | Workflow | What happens |
|---|---|---|
| Every PR commit | `ci.yml` → `docker-build` | Builds both images, **doesn't push**. Catches a broken Dockerfile before merge. |
| Merge to main | `release.yml` → `publish-images` | Builds and **pushes** to GitHub Container Registry |

Each published image gets two tags:

| Tag | Meaning | Use it for |
|---|---|---|
| `sha-1a2b3c4` | Exactly this commit. Never changes. | Deploying, and rolling back ("run the image from yesterday's commit") |
| `latest` | Whatever is on main now | Quick local testing |

## See and use your images

After a merge to main: your repo page → right sidebar **Packages** → `hello-cicd-api` and `hello-cicd-web`.

```bash
docker pull ghcr.io/<your-username-lowercase>/hello-cicd-api:latest
docker run -p 8080:8080 ghcr.io/<your-username-lowercase>/hello-cicd-api:latest
```

> New packages are **private** by default. To pull without logging in: open the package →
> **Package settings → Change visibility → Public**.

No secrets were needed: the workflow logs in with the automatic `GITHUB_TOKEN`, plus
`permissions: packages: write`.

## Exercise

1. Run `docker compose up --build` and add a todo at http://localhost:3000.
2. Merge a PR, then find the new `sha-...` tag on the package page. It matches the commit id on `main`.
3. Pull the image for an **older** sha and run it. That's how a rollback works.

→ [Lesson 5: deploy to AWS](05-deploy-to-aws.md)
