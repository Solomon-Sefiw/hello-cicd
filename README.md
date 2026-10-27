# Hello CI/CD — React + .NET, GitHub Actions, Docker, AWS

A tiny Todo app built for **learning CI/CD**. The app is simple on purpose: the point is the pipeline
around it, which is the same pattern real companies use.

```
 feature branch ──push──▶ Pull Request ──────────────▶ merge to main
                              │                              │
                         ci.yml (every commit)          release.yml
                         ├ Test .NET API                ├ ci.yml again
                         ├ Lint + build React           ├ publish Docker images → ghcr.io
                         └ Docker builds (api, web)     └ deploy → AWS Lambda + S3
                              │
                     branch protection: no merge unless all green
```

## Lessons (do them in order)

| # | Lesson | You'll learn |
|---|---|---|
| 1 | [Git & GitHub Flow](docs/01-git-and-github-flow.md) | branches, commits, PRs, pushing this repo |
| 2 | [GitHub Actions basics](docs/02-github-actions-basics.md) | workflows, triggers, jobs, steps, secrets, logs |
| 3 | [Checks & branch protection](docs/03-ci-checks-and-branch-protection.md) | checks on every commit, blocking bad merges |
| 4 | [Docker images](docs/04-docker-images.md) | Dockerfiles, compose, publishing images on merge |
| 5 | [Deploy to AWS](docs/05-deploy-to-aws.md) | Lambda, S3, IAM, automatic deploys |
| 6 | [Use it on any project](docs/06-use-it-on-any-project.md) | checklist + templates for your own projects |

## What's in the repo

| Path | What it is |
|---|---|
| `HelloCicd.sln` | Solution: open in Visual Studio / Rider |
| `api/` | .NET 8 minimal API (runs locally, in Docker, and in AWS Lambda) |
| `api.Tests/` | xUnit tests: if they fail, nothing merges or deploys |
| `web/` | React app (Vite) |
| `docker-compose.yml` | Run the whole app in containers |
| `.github/workflows/ci.yml` | Checks for every PR commit |
| `.github/workflows/release.yml` | Images + deploy on merge to main |
| `.github/dependabot.yml` | Weekly dependency-update PRs |
| `aws/` | IAM / S3 policies to paste in the AWS console |

## Run it locally

**Backend**: open `HelloCicd.sln` in Visual Studio and press **F5**, or run:
```bash
dotnet run --project api          # http://localhost:5080/api/health
```

**Frontend** (second terminal):
```bash
cd web
npm install
npm run dev                       # http://localhost:5173
```

**Tests**: `dotnet test HelloCicd.sln`

**Everything in Docker**: `docker compose up --build` → web http://localhost:3000, API http://localhost:8080
