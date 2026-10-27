# Lesson 1 — Git & the GitHub Flow

## The idea

`main` is always working code that could go live at any moment. You never work on `main` directly.
Every change follows this loop:

```
main ──●─────────────────────●──────── (always deployable)
        \                   /
         ●───●───●  PR  ──●  merge
       feature/add-delete
         ↑ every push here triggers CI checks on the PR
```

1. **Branch**: make a branch for one change.
2. **Commit**: save small steps with clear messages.
3. **Push**: upload the branch to GitHub.
4. **Pull Request (PR)**: ask to merge the branch into `main`. CI runs automatically.
5. **Review + checks green**: then merge.
6. **Merge**: `main` changes, so the release pipeline runs.

This is called **GitHub Flow**. Most companies use it, or something very close to it.

## First time: put this project on GitHub

1. github.com → **New repository** → name `hello-cicd` → **Public** → don't add any files → Create.
2. In this folder:
   ```bash
   git remote add origin https://github.com/<your-username>/hello-cicd.git
   git push -u origin main
   ```
3. Open the **Actions** tab. You'll see the **Release** workflow running.

## The daily commands (you'll use these forever)

```bash
git checkout main
git pull                              # get the latest main
git checkout -b feature/my-change     # new branch

# ...edit files...
git status                            # what changed?
git diff                              # see the exact changes
git add .
git commit -m "Add delete button to todos"
git push -u origin feature/my-change  # first push of this branch (later just: git push)
```

Then GitHub shows a yellow banner, **"Compare & pull request"**. Click it.

After merging on GitHub:
```bash
git checkout main
git pull
git branch -d feature/my-change       # delete the local branch
```

## Good commit messages

- ✅ `Add delete endpoint for todos`
- ✅ `Fix empty title being accepted`
- ❌ `update`, `fix`, `asdf`

The rule: finish the sentence **"This commit will…"**

## Branch names

`feature/...` for new things, `fix/...` for bugs, `chore/...` for upgrades and cleanup.

## Exercise

1. Create a branch `feature/change-title`.
2. Change the `<h1>` in `web/src/pages/TodosPage.jsx`.
3. Commit, push, and open a PR.
4. Watch the **Checks** section at the bottom of the PR. → continue with [Lesson 2](02-github-actions-basics.md).
