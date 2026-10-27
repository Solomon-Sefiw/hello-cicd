# Lesson 6 — Apply it to any project

Everything you learned is the same pattern, whatever the language or cloud. Only the commands change.

## The pattern

```
1. Every PR commit  → CI:      restore → build → lint → test → docker build (no push)
2. Protect main     →          merge only with green checks
3. Merge to main    → Release: run CI again → push versioned image → deploy
4. Secrets          →          in GitHub Secrets / Environments, never in code
```

## Checklist for a new or existing project

- [ ] Project builds and tests pass **from the command line** (CI can only run commands, not click buttons)
- [ ] `.gitignore` excludes `bin/`, `obj/`, `node_modules/`, `dist/`, `.env`
- [ ] No passwords or connection strings committed. Move them to environment variables or config
- [ ] Add `.github/workflows/ci.yml` (`on: pull_request` + `workflow_call`)
- [ ] Add a `Dockerfile` per deployable app, plus `.dockerignore`
- [ ] Push, open a PR, and watch CI go green
- [ ] Turn on branch protection with the check names ([Lesson 3](03-ci-checks-and-branch-protection.md))
- [ ] Add `.github/workflows/release.yml` (`on: push: main`): `uses: ./.github/workflows/ci.yml` → publish → deploy
- [ ] Add `dependabot.yml`

## Swap the commands for your stack

| Stack | Setup action | Build / test commands |
|---|---|---|
| .NET | `actions/setup-dotnet@v4` | `dotnet restore`, `dotnet build`, `dotnet test` |
| Node / React / Angular | `actions/setup-node@v4` | `npm ci`, `npm run lint`, `npm test`, `npm run build` |
| Python | `actions/setup-python@v5` | `pip install -r requirements.txt`, `pytest` |
| Java | `actions/setup-java@v4` | `mvn verify` or `./gradlew build` |
| Go | `actions/setup-go@v5` | `go test ./...` |

## Starter `ci.yml` to copy

```yaml
name: CI
on:
  pull_request:
  workflow_call:
permissions:
  contents: read
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with: { dotnet-version: '8.0.x' }
      - run: dotnet test YourSolution.sln -c Release

  frontend:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: your-frontend-folder } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: npm, cache-dependency-path: your-frontend-folder/package-lock.json }
      - run: npm ci
      - run: npm run build
```

## Tests that need a database

Add a **service container**. GitHub starts a database next to your job:

```yaml
  backend:
    runs-on: ubuntu-latest
    services:
      sqlserver:
        image: mcr.microsoft.com/mssql/server:2022-latest
        env: { ACCEPT_EULA: 'Y', MSSQL_SA_PASSWORD: 'Your_strong_pass123' }
        ports: ['1433:1433']
    env:
      ConnectionStrings__Default: "Server=localhost,1433;User Id=sa;Password=Your_strong_pass123;TrustServerCertificate=True"
    steps: ...
```

(Use `postgres:16` with `POSTGRES_PASSWORD` for PostgreSQL. A test-only password like this is fine to
commit, because it's a throwaway container. Real passwords never are.)

## Deploy targets: same idea, different last step

| Where | Last step of the release job |
|---|---|
| AWS Lambda + S3 | `aws lambda update-function-code`, `aws s3 sync` (this repo) |
| Any server with Docker (VPS, EC2) | push the image, then SSH in: `docker pull … && docker compose up -d` |
| AWS ECS / App Runner | push the image to ECR → `aws ecs update-service` / App Runner auto-deploys |
| Azure App Service | `azure/webapps-deploy@v3` |

## Level up, in this order

1. **OIDC instead of access keys**: GitHub gets short-lived cloud credentials, so no stored secret.
   Search "aws-actions/configure-aws-credentials OIDC".
2. **Version tags**: push a git tag `v1.2.0` → publish image `:1.2.0` and a GitHub Release.
3. **Staging + production environments**: deploy to staging automatically, and production after approval.
4. **Infrastructure as Code**: create cloud resources from code (Terraform, AWS CDK or SAM) instead of clicking.
5. **Code coverage and security scanning**: CodeQL (free for public repos), `dotnet test --collect:"XPlat Code Coverage"`.
