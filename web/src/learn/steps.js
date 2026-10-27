// All the content for the Learn page. Each phase has steps; each step can have:
//   what     - what you do
//   why      - why it matters (the concept)
//   commands - copyable terminal commands
//   expect   - what you should see if it worked
//   link     - a lesson file in the repo with more detail

const GITHUB_USER = 'Solomon-Sefiw'
const REPO = `https://github.com/${GITHUB_USER}/hello-cicd`

export const phases = [
  {
    id: 'big-picture',
    title: 'Understand the big picture',
    goal: 'Know what CI/CD is before touching anything.',
    steps: [
      {
        id: 'what-is-cicd',
        title: 'What is CI/CD?',
        what: [
          'CI = Continuous Integration. Every time you push code, a robot (GitHub Actions) builds it and runs the tests on a clean computer.',
          'CD = Continuous Deployment. If all the checks pass, the robot puts the new version live automatically.',
          'Without CI/CD you test by hand and copy files to the server yourself. With it, you push code and the robot does the rest, the same way every time.',
        ],
        why: 'Bugs are caught minutes after you write them, nobody can "forget a step" when deploying, and main is always working.',
      },
      {
        id: 'our-flow',
        title: 'How code flows in this project',
        what: [
          '1. You create a branch and make changes.',
          '2. You push and open a Pull Request (PR).',
          '3. ci.yml runs on every commit: .NET tests, React lint + build, Docker builds.',
          '4. If everything is green ✅, you merge the PR into main.',
          '5. release.yml runs: it repeats the checks, publishes Docker images, and deploys to AWS.',
        ],
        why: 'This is called "GitHub Flow". Most companies work exactly like this.',
        link: 'docs/02-github-actions-basics.md',
      },
      {
        id: 'files',
        title: 'Know the important files',
        what: [
          '.github/workflows/ci.yml - the checks (runs on every PR commit)',
          '.github/workflows/release.yml - publish and deploy (runs on merge to main)',
          'api/ - the .NET backend, api.Tests/ - its tests',
          'web/ - this React app',
          'api/Dockerfile, web/Dockerfile, docker-compose.yml - Docker',
          'docs/ - the written lessons',
        ],
        why: 'GitHub automatically runs any .yml file inside .github/workflows/. That folder name is special.',
      },
    ],
  },
  {
    id: 'local',
    title: 'Run it on your PC',
    goal: 'Make sure everything works locally first. CI can only run what already works on your machine.',
    steps: [
      {
        id: 'tools',
        title: 'Check your tools are installed',
        commands: ['dotnet --version', 'node --version', 'git --version', 'docker --version'],
        expect: 'Each command prints a version number. If one says "not recognized", install that tool first.',
      },
      {
        id: 'run-api',
        title: 'Start the backend API',
        what: ['Visual Studio: open HelloCicd.sln and press F5. Or use a terminal in the project folder:'],
        commands: ['cd D:\\Projects\\Learning\\hello-cicd', 'dotnet run --project api'],
        expect: 'Open http://localhost:5080/api/health and you should see {"status":"ok","version":"local"}. Leave this terminal running.',
      },
      {
        id: 'run-web',
        title: 'Start the React app',
        what: ['In a second terminal:'],
        commands: ['cd D:\\Projects\\Learning\\hello-cicd\\web', 'npm install', 'npm run dev'],
        expect: 'Open http://localhost:5173. The Todos page shows "API: ok". Try adding a todo.',
      },
      {
        id: 'run-tests',
        title: 'Run the tests yourself',
        commands: ['dotnet test HelloCicd.sln'],
        expect: '"Passed! Failed: 0, Passed: 4". This is exactly what CI runs on GitHub.',
        why: 'If the tests fail on your PC, they will fail on GitHub too. Always run them before pushing.',
      },
      {
        id: 'run-docker',
        title: 'Run everything in Docker (optional)',
        what: ['Start Docker Desktop first, stop the two terminals above, then:'],
        commands: ['docker compose up --build'],
        expect: 'Web on http://localhost:3000, API on http://localhost:8080/api/health. Ctrl+C stops it.',
        why: 'A Docker image runs the same everywhere: your PC, GitHub, AWS. CI builds these same images.',
        link: 'docs/04-docker-images.md',
      },
    ],
  },
  {
    id: 'github',
    title: 'Put the project on GitHub',
    goal: 'Push the code and watch your first automatic pipeline run.',
    steps: [
      {
        id: 'create-repo',
        title: 'Create an empty repository on GitHub',
        what: [
          'Go to github.com → "+" (top right) → New repository.',
          'Name: hello-cicd. Choose Public (GitHub Actions is free and unlimited for public repos).',
          'Do NOT tick "Add a README", .gitignore or license. The repo must be empty.',
          'Click Create repository.',
        ],
      },
      {
        id: 'push',
        title: 'Connect your folder and push',
        commands: [
          'cd D:\\Projects\\Learning\\hello-cicd',
          `git remote add origin ${REPO}.git`,
          'git push -u origin main',
        ],
        expect: 'The first time, a browser window asks you to sign in to GitHub. Afterwards, refresh the repo page and your files are there.',
        why: '"origin" is the nickname for your GitHub repo. "-u" remembers it, so next time you only type "git push".',
      },
      {
        id: 'first-run',
        title: 'Watch your first pipeline run',
        what: [
          `Open ${REPO}/actions`,
          'Click the "Release" run. You will see the jobs: CI checks first, then publish-images.',
          'Click a job, then a step, to read its log.',
        ],
        expect: 'All green ✅. "Deploy to AWS" shows as skipped (grey). That is correct, because AWS is not set up yet.',
        why: 'You pushed to main, so release.yml ran. Reading logs is 80% of CI/CD work, so get used to clicking into them.',
      },
    ],
  },
  {
    id: 'pr',
    title: 'Your first Pull Request',
    goal: 'Learn the daily loop: branch → commit → push → PR → checks → merge.',
    link: 'docs/01-git-and-github-flow.md',
    steps: [
      {
        id: 'branch',
        title: 'Create a branch and change something',
        commands: ['git checkout main', 'git pull', 'git checkout -b feature/change-title'],
        what: ['Now open web/src/pages/TodosPage.jsx and change the <h1> text to anything you like.'],
        why: 'You never work directly on main. A branch is your own safe copy for one change.',
      },
      {
        id: 'commit-push',
        title: 'Commit and push the branch',
        commands: ['git status', 'git add .', 'git commit -m "Change todos page title"', 'git push -u origin feature/change-title'],
        expect: 'git status lists your changed file in red before "git add", and green after.',
      },
      {
        id: 'open-pr',
        title: 'Open the Pull Request',
        what: [
          'On GitHub a yellow banner says "Compare & pull request". Click it, then Create pull request.',
          'Scroll down to the Checks box at the bottom of the PR.',
        ],
        expect: '4 checks run: Test .NET API, Lint + build React app, Docker image builds (api), Docker image builds (web). After ~2 min, all ✅.',
        why: 'This is CI. Every new commit you push to this branch re-runs all 4 checks automatically.',
      },
      {
        id: 'merge',
        title: 'Merge, then update your PC',
        what: ['Click "Merge pull request" → Confirm. Then on your PC:'],
        commands: ['git checkout main', 'git pull', 'git branch -d feature/change-title'],
        expect: 'In the Actions tab, a new Release run starts: this is CD.',
      },
    ],
  },
  {
    id: 'protect',
    title: 'Protect main (block bad merges)',
    goal: 'Make GitHub refuse to merge anything that fails the checks.',
    link: 'docs/03-ci-checks-and-branch-protection.md',
    steps: [
      {
        id: 'ruleset',
        title: 'Create a branch ruleset',
        what: [
          'Repo → Settings → Rules → Rulesets → New ruleset → New branch ruleset.',
          'Name: protect main. Enforcement status: Active.',
          'Target branches → Add target → Include default branch.',
          'Tick: Restrict deletions, Require a pull request before merging (approvals: 0 while learning alone), Block force pushes.',
          'Tick "Require status checks to pass" → Add checks → add all 4 check names from your PR.',
          'Click Create.',
        ],
        expect: 'Now "git push" directly to main is rejected. The only way in is a PR with green checks.',
        why: 'CI only TELLS you something is broken. Branch protection STOPS it from reaching main.',
      },
      {
        id: 'break-it',
        title: 'Break a test on purpose (important!)',
        commands: ['git checkout -b fix/break-it'],
        what: [
          'In api.Tests/ApiTests.cs change Assert.Equal("ok", ...) to Assert.Equal("okk", ...).',
          'Commit, push, and open a PR.',
        ],
        expect: '"Test .NET API" goes ❌ red and the Merge button is blocked. Click "Details" to find the failing line in the log.',
      },
      {
        id: 'fix-it',
        title: 'Fix it and watch it go green',
        what: ['Change "okk" back to "ok", then:'],
        commands: ['git add .', 'git commit -m "Fix health test"', 'git push'],
        expect: 'The checks re-run on their own and turn ✅. Now you can merge (or close the PR).',
        why: 'This is the heart of CI: the robot tests every commit, and humans only merge green ones.',
      },
    ],
  },
  {
    id: 'images',
    title: 'Docker images on every merge',
    goal: 'See the images the pipeline publishes, and know how rollback works.',
    link: 'docs/04-docker-images.md',
    steps: [
      {
        id: 'find-images',
        title: 'Find your published images',
        what: [
          'Your repo page → right sidebar → Packages → hello-cicd-api and hello-cicd-web.',
          'Each one has two tags: "latest" and "sha-xxxxxxx" (the commit id).',
          'They are private at first: open the package → Package settings → Change visibility → Public.',
        ],
        why: 'The sha tag never changes, so you always know exactly which code is inside an image.',
      },
      {
        id: 'pull-image',
        title: 'Run the published image on your PC',
        commands: [
          'docker pull ghcr.io/solomon-sefiw/hello-cicd-api:latest',
          'docker run --rm -p 8080:8080 ghcr.io/solomon-sefiw/hello-cicd-api:latest',
        ],
        expect: 'http://localhost:8080/api/health works. The image name is lowercase even though your username has capitals.',
        why: 'Rollback = run an older sha-xxxxxxx tag. No rebuilding needed.',
      },
    ],
  },
  {
    id: 'aws',
    title: 'Deploy to AWS (free)',
    goal: 'Make every merge go live on the internet automatically.',
    link: 'docs/05-deploy-to-aws.md',
    steps: [
      {
        id: 'aws-account',
        title: 'Create the AWS account and a $0 budget alert',
        what: [
          'Sign up at aws.amazon.com/free (it asks for a card, but this project costs $0).',
          'FIRST THING: Billing → Budgets → Create budget → "Zero spend budget", with your email.',
          'Pick one region (top right), e.g. us-east-1, and always use it.',
        ],
        why: 'The budget emails you if anything ever starts costing money. Always do this on a new account.',
      },
      {
        id: 'lambda',
        title: 'Create the Lambda function (the API)',
        what: [
          'Lambda → Create function → name hello-cicd-api, runtime .NET 8, architecture x86_64.',
          'Code → Runtime settings → Edit → Handler: Api.',
          'Configuration → General → Memory 512 MB, Timeout 15 sec.',
          'Configuration → Function URL → Create → Auth type NONE → leave CORS unticked → Save.',
        ],
      },
      {
        id: 's3',
        title: 'Create the S3 bucket (the website)',
        what: [
          'S3 → Create bucket → unique name, e.g. hello-cicd-web-solomon → untick "Block all public access".',
          'Properties → Static website hosting → Enable → index document and error document both index.html.',
          'Permissions → Bucket policy → paste aws/s3-public-read-policy.json (replace BUCKET_NAME).',
          'Copy the "Bucket website endpoint" URL.',
        ],
      },
      {
        id: 'iam',
        title: 'Create an AWS key just for GitHub',
        what: [
          'IAM → Policies → Create policy → JSON → paste aws/github-deploy-policy.json (replace REGION, ACCOUNT_ID, BUCKET_NAME).',
          'IAM → Users → Create user github-actions-hello-cicd → attach that policy.',
          'User → Security credentials → Create access key → copy both values.',
        ],
        why: 'Least privilege: this key can only update this one Lambda and this one bucket. Never put keys in code.',
      },
      {
        id: 'gh-settings',
        title: 'Save the settings in GitHub',
        what: [
          'Repo → Settings → Secrets and variables → Actions.',
          'Secrets tab: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY.',
          'Variables tab: AWS_REGION, LAMBDA_FUNCTION_NAME (hello-cicd-api), S3_BUCKET, WEB_URL (website endpoint, no trailing /).',
        ],
        why: 'Secrets are hidden (shown as *** in logs). Variables are normal settings. The workflow reads them with ${{ secrets.X }} and ${{ vars.X }}.',
      },
      {
        id: 'deploy',
        title: 'Deploy!',
        what: ['Actions → Release → Run workflow. Or merge any PR.'],
        expect: '"Deploy to AWS" now runs instead of skipping. Open WEB_URL: this app is live, and it shows "API: ok (version abc1234)", the commit id that\'s live.',
      },
    ],
  },
  {
    id: 'any-project',
    title: 'Do it on any project',
    goal: 'Same pattern everywhere. Only the commands change.',
    link: 'docs/06-use-it-on-any-project.md',
    steps: [
      {
        id: 'checklist',
        title: 'The checklist for your next project',
        what: [
          '1. It builds and its tests pass from the command line.',
          '2. .gitignore excludes bin/, obj/, node_modules/, dist/, .env.',
          '3. No passwords or connection strings in the code.',
          '4. Copy ci.yml and change the commands for that project.',
          '5. Add a Dockerfile for each app.',
          '6. Push, open a PR, and get it green.',
          '7. Turn on branch protection.',
          '8. Add release.yml: reuse CI → publish images → deploy.',
        ],
        why: 'Do it on this practice project first, then on your real projects.',
      },
    ],
  },
]

export const glossary = [
  ['Repository (repo)', 'A project folder tracked by Git, stored on GitHub.'],
  ['Commit', 'A saved snapshot of your changes, with a message.'],
  ['Branch', 'A separate line of work. main is the real one; feature branches are for changes.'],
  ['Push / Pull', 'Push uploads your commits to GitHub. Pull downloads new commits from GitHub.'],
  ['Pull Request (PR)', 'A request to merge your branch into main. CI runs here.'],
  ['Merge', 'Bringing a branch\'s changes into main.'],
  ['Workflow', 'A .yml file in .github/workflows/ that tells GitHub Actions what to do.'],
  ['Trigger (on:)', 'The event that starts a workflow: pull_request, push, button click...'],
  ['Job', 'A group of steps on one fresh virtual machine. Jobs run in parallel unless "needs:" is used.'],
  ['Step', 'One command (run:) or one ready-made action (uses:) inside a job.'],
  ['Runner', 'The free Linux VM GitHub starts to run a job. Deleted afterwards.'],
  ['Check / status check', 'The ✅ or ❌ result of a CI job, shown on the PR and on each commit.'],
  ['Branch protection / ruleset', 'Rules that block merging into main unless the checks pass.'],
  ['Secret', 'A hidden value (password, key) stored in GitHub, masked as *** in logs.'],
  ['Docker image', 'Your app plus everything it needs to run, packed into one file.'],
  ['Container', 'A running copy of an image.'],
  ['Registry (ghcr.io)', 'Storage for Docker images. ghcr.io is GitHub\'s free one.'],
  ['Lambda', 'AWS runs your code only when a request arrives. No server to manage.'],
  ['S3', 'AWS file storage that can also host a static website.'],
  ['IAM', 'AWS users and permissions.'],
]

// One command per line on purpose: '&&' doesn't work in Windows PowerShell 5.1.
export const cheatSheet = [
  ['Start new work', ['git checkout main', 'git pull', 'git checkout -b feature/name']],
  ['See what changed', ['git status', 'git diff']],
  ['Save a step', ['git add .', 'git commit -m "Describe the change"']],
  ['Upload the branch', ['git push -u origin feature/name']],
  ['After merging on GitHub', ['git checkout main', 'git pull']],
  ['Run the tests', ['dotnet test HelloCicd.sln']],
  ['Run with Docker', ['docker compose up --build']],
]
