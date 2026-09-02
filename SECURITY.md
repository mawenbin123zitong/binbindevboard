# Security Policy

## Supported versions

Security fixes are applied to the latest version on the `main` branch.

## Reporting a vulnerability

Please do not open a public issue for a potential security vulnerability. Use GitHub's private vulnerability reporting feature for this repository when available.

Include:

- a clear description of the issue
- steps to reproduce it
- the affected browser or environment
- the potential impact
- a suggested mitigation, if known

Do not include real access tokens, passwords, or other credentials in a report.

## Data and privacy model

DevBoard is a static, local-first application. It stores workspace data in browser `localStorage` and does not include analytics, remote APIs, or authentication. Anyone with access to the same browser profile may be able to inspect that local data, so do not store secrets in task titles or project descriptions.
