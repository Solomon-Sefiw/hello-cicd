# Hello CI/CD — React + .NET on AWS with GitHub Actions

A tiny Todo app made for learning. You will push code to GitHub, watch GitHub Actions test it,
and see it deploy itself to AWS.

```
 you: git push
        │
        ▼
 ┌──────────── GitHub Actions (.github/workflows/ci-cd.yml) ────────────┐
 │  CI  : test-api (dotnet test)    build-web (npm lint + build)        │
 │            └──────────┬───────────────┘                              │
 │  CD  :           deploy (only if both passed, only on main)          │
 └───────────────────────┼──────────────────────────────────────────────┘
          ┌──────────────┴──────────────┐
          ▼                             ▼
  AWS Lambda + Function URL       AWS S3 static website
  (.NET 8 API: /api/todos)        (React app: index.html, JS, CSS)
          ▲                             │
          └──── browser calls API ──────┘
```

| Folder | What it is |
|---|---|
| `api/` | .NET 8 minimal API. Runs normally on your PC, and inside Lambda on AWS. |
| `api.Tests/` | xUnit tests. If any fail, nothing gets deployed. |
| `web/` | React app (Vite). |
| `.github/workflows/ci-cd.yml` | The CI/CD pipeline. **Read this file: every step has a comment.** |
| `aws/` | JSON policies you paste into the AWS console. |

## Words you need to know

- **CI (Continuous Integration)**: every push gets built and tested automatically on a clean machine.
- **CD (Continuous Deployment)**: if CI passes, the new version goes live automatically.
- **Workflow / job / step**: a workflow file has jobs; jobs run on separate VMs (in parallel unless
  you use `needs:`); each job is a list of steps.
- **Runner**: the free Ubuntu VM GitHub starts for each job.
- **Secret / variable**: settings stored in GitHub, not in the code. Secrets are hidden (passwords, keys);
  variables are visible (bucket name, region).
- **Lambda**: AWS runs your code only when a request arrives. No server to manage.
- **Function URL**: a free public HTTPS address for a Lambda.
- **S3**: file storage. It can also serve files as a website.
- **IAM**: AWS's users and permissions.

---

## Step 0 — Run it on your PC

Open two terminals:

```bash
# terminal 1: API on http://localhost:5080
dotnet run --project api

# terminal 2: React on http://localhost:5173
cd web
npm install
npm run dev
```

Run the tests: `dotnet test api.Tests`

## Step 1 — Put it on GitHub

1. On github.com, click **New repository**, name it `hello-cicd`, make it **Public** (Actions are
   unlimited and free for public repos), and **don't** add a README.
2. Then run:
   ```bash
   git remote add origin https://github.com/<your-username>/hello-cicd.git
   git push -u origin main
   ```
3. Open the **Actions** tab. You'll see the workflow running. `test-api` and `build-web` should
   go green ✅. `deploy` will **fail** for now, because AWS isn't set up yet. That's expected.

## Step 2 — AWS account (free)

1. Sign up at https://aws.amazon.com/free (you need a card, but this project costs $0).
2. **Do this first:** go to **Billing → Budgets → Create budget → "Zero spend budget"**, and add your
   email. AWS will email you if anything ever costs money.
3. Choose one region and use it everywhere, e.g. `us-east-1` (top-right corner of the console).

> Free tier: Lambda gives 1 million requests/month free, forever. S3 is free or costs a few cents
> at this size. New accounts also get free credits.

## Step 3 — Create the Lambda (the API)

1. Console → **Lambda → Create function**
   - Author from scratch
   - Name: `hello-cicd-api`
   - Runtime: **.NET 8 (C#/F#/PowerShell)**
   - Architecture: **x86_64**
   - Create.
2. **Code** tab → **Runtime settings → Edit** → Handler: `Api` → Save.
   (For ASP.NET Core apps, the handler is just the assembly name.)
3. **Configuration → General configuration → Edit**: Memory `512` MB, Timeout `15` sec → Save.
4. **Configuration → Function URL → Create function URL**
   - Auth type: **NONE** (public API)
   - **Leave CORS unticked.** The .NET app already handles CORS, and ticking it here sends the
     header twice, which breaks the browser.
   - Save. Copy the URL (looks like `https://abc123.lambda-url.us-east-1.on.aws/`).

## Step 4 — Create the S3 bucket (the website)

1. Console → **S3 → Create bucket**
   - Name: something globally unique, e.g. `hello-cicd-web-<yourname>`
   - **Untick "Block all public access"** and tick the warning box.
   - Create.
2. Open the bucket → **Properties → Static website hosting → Edit → Enable**
   - Index document: `index.html`, Error document: `index.html` → Save.
   - Scroll down and copy the **Bucket website endpoint**
     (e.g. `http://hello-cicd-web-yourname.s3-website-us-east-1.amazonaws.com`).
3. **Permissions → Bucket policy → Edit** → paste `aws/s3-public-read-policy.json`,
   replace `BUCKET_NAME` with your bucket name → Save.

## Step 5 — Give GitHub a key to AWS

GitHub needs its own AWS user, allowed to do **only** the deploy and nothing else.

1. Console → **IAM → Policies → Create policy → JSON** → paste `aws/github-deploy-policy.json`.
   Replace `REGION`, `ACCOUNT_ID` (the 12 digits in the top-right menu) and `BUCKET_NAME`.
   Name it `hello-cicd-deploy`.
2. **IAM → Users → Create user** → name `github-actions-hello-cicd` (no console access)
   → **Attach policies directly** → choose `hello-cicd-deploy` → Create.
3. Open the user → **Security credentials → Create access key** → "Third-party service"
   → copy the **Access key ID** and **Secret access key**. You'll only see the secret once.

> Never put these keys in your code. They go in GitHub Secrets only.

## Step 6 — Save settings in GitHub

In your repo: **Settings → Secrets and variables → Actions**

**Secrets** tab → New repository secret:

| Name | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | from step 5 |
| `AWS_SECRET_ACCESS_KEY` | from step 5 |

**Variables** tab → New repository variable:

| Name | Value |
|---|---|
| `AWS_REGION` | `us-east-1` (your region) |
| `LAMBDA_FUNCTION_NAME` | `hello-cicd-api` |
| `S3_BUCKET` | your bucket name |
| `WEB_URL` | the bucket website endpoint, **without** a trailing `/` |

## Step 7 — Deploy 🚀

**Actions** tab → open the failed run → **Re-run all jobs** (or just push any change).

When it's green, open the **Summary** of the run. It shows your API and web links.
Open `WEB_URL` in the browser: the page should show `API: ok (version abc1234)`.
That version is your commit id, so you can see exactly which commit is live.

## Step 8 — Feel the CI/CD loop

1. **Change something and push**: edit the `<h1>` in `web/src/App.jsx`, commit, push. About 2 minutes
   later the live site changes.
2. **Break a test on purpose**: in `api.Tests/ApiTests.cs` change `"ok"` to `"okk"` and push.
   `test-api` goes red ❌ and **deploy is skipped**. The live site stays on the old working version.
   That's CI protecting you. Revert it after.
3. **Use a pull request**: `git checkout -b feature/x`, change something, push, open a PR on GitHub.
   Only CI runs (no deploy). Merge the PR, and the deploy runs.
4. Optional: **Settings → Branches → Add rule** for `main` → "Require status checks to pass"
   → choose `Test .NET API` and `Lint + build React app`. Now GitHub won't let anyone merge broken code.

## Troubleshooting

| Problem | Fix |
|---|---|
| Deploy: `AccessDenied` | Check the region, account id and names in the IAM policy match exactly. |
| Deploy: `ResourceNotFoundException` | `LAMBDA_FUNCTION_NAME` or `AWS_REGION` variable is wrong. |
| Page says "API is not reachable" | Open the browser console (F12). A CORS error means `WEB_URL` doesn't match the address in your browser exactly (http vs https, trailing `/`), or CORS is ticked on the Function URL. |
| API returns `Internal Server Error` | Lambda → **Monitor → View CloudWatch logs**. Usually the handler isn't set to `Api`. |
| S3 page shows `403 Forbidden` | The bucket policy is missing, or Block Public Access is still on. |

## Clean up (when you're done learning)

Delete: the Lambda function, the S3 bucket (empty it first), the IAM user and policy,
and the CloudWatch log group `/aws/lambda/hello-cicd-api`.

## Next things to learn

1. **OIDC instead of access keys**: GitHub gets short-lived AWS credentials, so there's no stored secret.
   Search "aws-actions/configure-aws-credentials OIDC".
2. **CloudFront** in front of S3, for HTTPS and a CDN.
3. **Infrastructure as Code**: create the Lambda, bucket and IAM from code (AWS SAM, CDK, or Terraform)
   instead of clicking in the console.
4. **A database**: DynamoDB has a free tier. Right now todos live in memory and reset whenever Lambda restarts.
5. **Docker**: package the API as a container and deploy it to ECS or App Runner.
