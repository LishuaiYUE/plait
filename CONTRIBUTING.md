# Contributing to Plait

Thank you for contributing. Bug fixes, tests, documentation, performance improvements, and focused features are welcome.

## Community Language

Plait uses English for issues, pull requests, discussions, reviews, commit messages, and contributor documentation. Localized documentation is welcome, but contribution discussions should remain in English.

## Before You Start

- Search existing issues and discussions first.
- Reproduce bugs on the latest `develop` branch.
- Keep each issue or pull request focused on one problem.
- Discuss large features, architecture changes, public API changes, or data-model changes before implementation.
- Verify AI-assisted findings. Do not publish raw AI audit output or batches of unverified issues.

## Local Development

Install dependencies using the same command as CI:

```bash
npm install --force
```

Run `npm run start` for the demo application or `npm run start:docs` for the documentation site.

Before opening a pull request, run the checks that apply to your change:

```bash
npm run build
npm run ci:test
```

For TypeScript changes, also run `npm run lint` and review the automatic fixes it applies.

## Changesets

For changes that affect released `@plait/*` packages, add a changeset:

```bash
npx changeset
```

Choose the appropriate version level and describe the user-facing change. Documentation, tests, and internal-only changes usually do not require a changeset.

## Pull Requests

- Target the `develop` branch.
- Use an English title, description, and clear commit messages.
- Explain what changed and why; identify the affected packages and link the related issue when available.
- Add or update tests for behavior changes.
- Update affected documentation and examples.
- Consider compatibility when changing public APIs, package behavior, or serialized data.
- Avoid unrelated formatting, refactoring, or dependency changes.

## AI-Assisted Contributions

AI tools are welcome, but contributors remain responsible for their work. If AI generated or substantially modified code, tests, or documentation, disclose:

- The tool and model, if known
- What the AI helped with
- Your human review and testing

You must understand, explain, and maintain the submitted changes. Raw or unverified AI output is not acceptable. Trivial autocomplete, spelling, and formatting assistance do not require disclosure.

Do not provide secrets, private vulnerability details, personal data, or unauthorized content to external AI services.

## License

By contributing, you agree that your contribution will be licensed under the repository's MIT License.
