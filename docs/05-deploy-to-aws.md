# Lesson 5 — Continuous Deployment to AWS (free)

## The idea

CD means: when `main` changes and CI passes, the new version goes live with no manual steps.
The `deploy-aws` job in [`release.yml`](../.github/workflows/release.yml) does this. It stays
**skipped** until you set the GitHub variables below, so your pipeline is green before AWS exists.

```
release.yml ─▶ deploy-aws
                 ├─ dotnet publish → zip → AWS Lambda (API, with a free public HTTPS Function URL)
                 └─ npm run build (pointing at the Lambda URL) → S3 static website (React)
```

Why Lambda + S3? It's serverless, so there's no server to patch. Lambda gives 1 million requests a month
free, forever, and S3 costs cents at this size. The same ASP.NET Core app runs on your PC and in Lambda
thanks to `AddAWSLambdaHosting` in [`Program.cs`](../api/Program.cs).

## 1. AWS account

1. Sign up at https://aws.amazon.com/free (you need a card, but this project costs $0).
2. **Do this first:** **Billing → Budgets → Create budget → "Zero spend budget"**, and add your email.
   AWS emails you if anything ever costs money.
3. Pick one region and use it everywhere, e.g. `us-east-1` (top-right corner of the console).

## 2. Create the Lambda (the API)

1. **Lambda → Create function** → Author from scratch
   - Name `hello-cicd-api`, Runtime **.NET 8**, Architecture **x86_64** → Create.
2. **Code → Runtime settings → Edit** → Handler: `Api` → Save.
   (For ASP.NET Core, the handler is just the assembly name.)
3. **Configuration → General configuration → Edit**: Memory `512` MB, Timeout `15` sec.
4. **Configuration → Function URL → Create**
   - Auth type **NONE** (public API).
   - **Leave CORS unticked.** The app already sends CORS headers, and ticking it here sends them twice,
     which breaks the browser.
   - Save, and copy the URL.

## 3. Create the S3 bucket (the website)

1. **S3 → Create bucket** → a globally unique name, e.g. `hello-cicd-web-<yourname>`
   → **untick "Block all public access"** and tick the warning → Create.
2. Bucket → **Properties → Static website hosting → Enable**
   → Index `index.html`, Error `index.html` → Save. Copy the **Bucket website endpoint**.
3. **Permissions → Bucket policy** → paste [`aws/s3-public-read-policy.json`](../aws/s3-public-read-policy.json),
   replace `BUCKET_NAME` → Save.

## 4. Give GitHub a limited AWS key

GitHub gets its own AWS user, allowed to do **only** this deploy. This is called **least privilege**.

1. **IAM → Policies → Create policy → JSON** → paste [`aws/github-deploy-policy.json`](../aws/github-deploy-policy.json).
   Replace `REGION`, `ACCOUNT_ID` (the 12 digits in the top-right menu) and `BUCKET_NAME`.
   Name it `hello-cicd-deploy`.
2. **IAM → Users → Create user** `github-actions-hello-cicd` → **Attach policies directly** → `hello-cicd-deploy`.
3. User → **Security credentials → Create access key** → "Third-party service" → copy both values.

> Never commit keys to code. They go in GitHub Secrets only.

## 5. Save settings in GitHub

Repo → **Settings → Secrets and variables → Actions**

| Kind | Name | Value |
|---|---|---|
| Secret | `AWS_ACCESS_KEY_ID` | from step 4 |
| Secret | `AWS_SECRET_ACCESS_KEY` | from step 4 |
| Variable | `AWS_REGION` | e.g. `us-east-1` |
| Variable | `LAMBDA_FUNCTION_NAME` | `hello-cicd-api` |
| Variable | `S3_BUCKET` | your bucket name |
| Variable | `WEB_URL` | the bucket website endpoint, **no** trailing `/` |

## 6. Deploy

**Actions → Release → Run workflow** (or merge any PR). `deploy-aws` now runs instead of being skipped.
Open the run's **Summary** for the links. The page shows `API: ok (version abc1234)`: that's the commit
that's live.

## Optional: add a manual approval

**Settings → Environments → production → Required reviewers** → add yourself.
Now each deploy waits for you to click **Approve**. That's **Continuous Delivery** (a human presses go)
instead of **Continuous Deployment** (fully automatic).

## Troubleshooting

| Problem | Fix |
|---|---|
| `AccessDenied` | Region, account id or names in the IAM policy don't match exactly |
| `ResourceNotFoundException` | `LAMBDA_FUNCTION_NAME` or `AWS_REGION` variable is wrong |
| Page says "API is not reachable" | F12 → Console. A CORS error means `WEB_URL` doesn't exactly match the browser address, or CORS is ticked on the Function URL |
| API returns `Internal Server Error` | Lambda → **Monitor → View CloudWatch logs**. Usually the handler isn't `Api` |
| S3 shows `403 Forbidden` | Bucket policy missing, or Block Public Access is still on |

## Clean up when done

Delete the Lambda, the S3 bucket (empty it first), the IAM user and policy, and the log group
`/aws/lambda/hello-cicd-api`.

→ [Lesson 6: use all this on any project](06-use-it-on-any-project.md)
