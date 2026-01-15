# Contributing to Next.js SaaS Boilerplate

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/nextjs-saas-boilerplate.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Copy environment variables: `cp .env.example .env`
6. Set up the database: `npx prisma db push`

## Development Workflow

1. Make your changes
2. Run linting: `npm run lint`
3. Run type checking: `npm run type-check`
4. Test the build: `npm run build`
5. Commit your changes with a descriptive message
6. Push to your fork
7. Open a pull request

## Code Style

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused

## Commit Messages

Use clear, descriptive commit messages:
- `feat: add user profile page`
- `fix: resolve authentication redirect issue`
- `docs: update README with new setup instructions`
- `refactor: simplify billing logic`

## Pull Request Guidelines

- Fill out the PR template completely
- Link any related issues
- Include screenshots for UI changes
- Ensure all checks pass
- Request review from maintainers

## Reporting Bugs

Use the bug report template when creating issues. Include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment details

## Suggesting Features

Use the feature request template. Include:
- Problem you're trying to solve
- Proposed solution
- Alternative approaches considered

## Questions?

Open a discussion or reach out to the maintainers.

Thank you for contributing!
