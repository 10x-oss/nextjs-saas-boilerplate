# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Do not** open a public GitHub issue for security vulnerabilities
2. Email security concerns to the maintainers privately
3. Include as much detail as possible:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- Acknowledgment of your report within 48 hours
- Regular updates on our progress
- Credit in the release notes (if desired)

### Scope

This security policy applies to:
- The boilerplate source code
- Official dependencies and their configurations
- Documentation and setup guides

### Out of Scope

- Third-party services (Stripe, PostHog, etc.) - report to those providers
- Your own modifications to the boilerplate
- Hosting environment issues

## Security Best Practices

When using this boilerplate:

1. **Never commit secrets** - Use environment variables
2. **Keep dependencies updated** - Run `npm audit` regularly
3. **Use HTTPS** in production
4. **Configure CORS properly** for your domain
5. **Review Stripe webhook signatures** before processing
6. **Enable rate limiting** for API routes

Thank you for helping keep this project secure!
