# Lesson 3 — Checks on every commit, and blocking bad merges

## The idea

CI by itself only **tells** you something is broken. **Branch protection** makes GitHub **refuse**
to merge until the checks are green. Together they mean `main` can't break by accident.

## How "check on every commit" works here

`ci.yml` has `on: pull_request`. That event fires when:
- a PR is opened,
- **any new commit is pushed** to the PR's branch,
- a closed PR is reopened.

Each commit gets a ✅ or ❌ next to it on the PR's **Commits** tab.

> Tip: open a **Draft PR** as soon as you push your first commit. Then every commit gets checked,
> even before the work is finished.

## Turn on branch protection (one-time per repo)

> First let CI run at least once (open any PR). GitHub only lets you pick checks it has seen.

**Settings → Rules → Rulesets → New ruleset → New branch ruleset**

1. Ruleset name: `protect main`. Enforcement status: **Active**.
2. Target branches → **Add target → Include default branch**.
3. Tick:
   - ✅ **Restrict deletions**
   - ✅ **Require a pull request before merging** (set approvals to `0` while you're learning alone;
     teams use `1` or more)
   - ✅ **Require status checks to pass** → **Add checks**, then add all four:
     - `Test .NET API`
     - `Lint + build React app`
     - `Docker image builds (api)`
     - `Docker image builds (web)`
   - ✅ **Block force pushes**
4. **Create**.

(Free for public repos. Private repos need GitHub Pro or Team.)

Now try `git push` directly to `main`: GitHub rejects it. The only way in is a PR with green checks.

## Other automatic checks in this repo

| File | What it does |
|---|---|
| [`dependabot.yml`](../.github/dependabot.yml) | Every week it opens PRs to update npm, NuGet and Actions versions. CI tests those PRs too, so you merge only updates that pass. |
| [`pull_request_template.md`](../.github/pull_request_template.md) | Pre-fills every PR description with a checklist. |

## Exercise: watch protection save you

1. New branch `fix/break-it`. In `api.Tests/ApiTests.cs`, change `"ok"` to `"okk"`.
2. Commit, push, and open a PR. → `Test .NET API` goes ❌, and the **Merge** button is blocked.
3. Click **Details** next to the failed check and find the failing assertion in the log.
4. Fix it back, commit, and push. → The checks rerun automatically and go ✅. Now you can merge.

That's the core of CI: **the robot tests every commit, and humans only merge green ones.**

→ [Lesson 4: Docker images](04-docker-images.md)
