# Lesson 2 — GitHub Actions basics

## The idea

A **workflow** is a YAML file in `.github/workflows/`. GitHub reads every file there automatically.
When an **event** happens (a push, a PR, a button click), GitHub starts a fresh Linux VM (a **runner**),
downloads your code, and runs your commands. If a command fails, the run goes red.

## Anatomy of a workflow

```yaml
name: CI                         # name shown in the Actions tab

on:                              # WHEN: the triggers
  pull_request:                  #   PR opened, or a new commit pushed to it
  push:
    branches: [main]             #   push or merge to main

jobs:                            # WHAT: one or more jobs
  test:                          # job id (your choice)
    runs-on: ubuntu-latest       # the VM type
    steps:                       # run in order; if one fails, the job stops
      - uses: actions/checkout@v4      # "uses" = a ready-made action from the Marketplace
      - uses: actions/setup-dotnet@v4
        with:                          # inputs for that action
          dotnet-version: '8.0.x'
      - run: dotnet test               # "run" = a shell command

  deploy:
    needs: test                  # wait for "test" and only run if it passed
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: echo "deploying..."
```

| Concept | Meaning |
|---|---|
| **Event / trigger** (`on:`) | What starts the workflow |
| **Job** | A group of steps on **one** VM. Jobs run **in parallel** by default |
| **`needs:`** | Makes a job wait for others, and skip if they failed |
| **Step** | One command (`run:`) or one action (`uses:`) |
| **Action** | Reusable step someone published, like `actions/checkout`. Find more at github.com/marketplace |
| **Runner** | The VM. Free and unlimited for public repos; 2,000 min/month for private ones |
| **`if:`** | Run a job or step only when a condition is true |
| **`matrix:`** | Run the same job several times with different values |
| **Secrets** | `${{ secrets.NAME }}`: hidden values like passwords and keys. Masked as `***` in logs |
| **Variables** | `${{ vars.NAME }}`: visible settings like region or bucket name |
| **`GITHUB_TOKEN`** | A temporary token GitHub creates for each run. No setup needed |

## Our two workflows

| File | Trigger | Jobs |
|---|---|---|
| [`ci.yml`](../.github/workflows/ci.yml) | every PR, and every commit pushed to a PR | `test-api`, `build-web`, `docker-build` (×2) in parallel |
| [`release.yml`](../.github/workflows/release.yml) | push/merge to `main` | `ci` (reuses ci.yml) → `publish-images` + `deploy-aws` |

`release.yml` doesn't copy the CI steps. It **calls** `ci.yml` with `uses: ./.github/workflows/ci.yml`.
This is a **reusable workflow**: the checks are defined once and used twice.

```
PR / commit ─▶ ci.yml:   [test-api] [build-web] [docker api] [docker web]

merge main ─▶ release.yml:
                [ ci.yml (same 4 jobs) ]
                     │ all green?
           ┌─────────┴──────────┐
   [publish-images ×2]     [deploy-aws]  (skipped until AWS vars exist)
```

## Reading a run

**Actions** tab → click a run → click a job → expand a step to see its log.
A red ❌ step shows exactly which command failed and why. Reading logs is 80% of CI/CD work.

## Exercise

1. Open `ci.yml` and read every comment.
2. In your PR branch, add a new step to the `test-api` job, after the test step:
   ```yaml
      - run: echo "Tests passed on commit ${{ github.sha }}"
   ```
   Commit and push. Find your message in the log.
3. Click **Actions → CI → Run workflow** to trigger it by hand (that's `workflow_dispatch`).

→ [Lesson 3: make checks required before merge](03-ci-checks-and-branch-protection.md)
