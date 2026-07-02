# k6 Performance Testing POC

CI/CD integration with Grafana k6 Cloud.

## Prerequisites

- [k6 installed](https://grafana.com/docs/k6/latest/set-up/install-k6/) (v1.3.0+)
- Grafana k6 Cloud account (projectID: 7975862)

## Project Structure

```
k6-poc/
├── tests/
│   └── ci-smoke-test.js    # CI smoke test (runs on every push)
├── .github/
│   └── workflows/
│       └── k6-cloud.yml    # GitHub Actions pipeline
├── .gitignore
└── README.md
```

## Running Tests

### Locally
```bash
k6 run tests/ci-smoke-test.js
```

### On k6 Cloud
```bash
# Authenticate once
k6 cloud login --token <YOUR_K6_CLOUD_TOKEN>

# Run on cloud
k6 cloud run tests/ci-smoke-test.js
```

## CI/CD Setup

The pipeline runs automatically on every push to `main`.

### Required GitHub Secret
| Secret | Where to get it |
|--------|----------------|
| `K6_CLOUD_TOKEN` | Grafana k6 Cloud → Settings → Personal token |

Add it at: **Repo → Settings → Secrets and variables → Actions → New repository secret**

### Pipeline Flow
```
git push → GitHub Actions → k6 cloud run →
Results stream to Grafana k6 Cloud →
Thresholds evaluated →
Exit 0 (pass) or 99 (fail) → Pipeline passes or fails
```
