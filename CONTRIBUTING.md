# Contributing to DevBoard

Thank you for helping improve DevBoard. Small, focused pull requests are easiest to review and maintain.

## Development setup

Requirements: Node.js 18 or newer and Git.

```bash
git clone https://github.com/YOUR_USERNAME/devboard.git
cd devboard
npm start
```

No dependency installation is required.

## Before opening a pull request

Run the checks locally:

```bash
npm run check
npm test
```

For visual changes, check at least these viewport widths:

- 1440px desktop
- 900px tablet
- 390px mobile

Also verify keyboard navigation, visible focus, the dark theme, and reduced-motion behavior.

## Project conventions

- Keep the application dependency-free unless a dependency solves a substantial, documented problem.
- Put pure data behavior in `src/core.js` and browser-specific behavior in `src/app.js`.
- Add tests for new data transformations and regression fixes.
- Use semantic HTML and preserve accessible names for controls.
- Keep UI text concise and avoid instructions inside the main application surface.
- Do not commit personal workspace data, credentials, tokens, or generated logs.

## Commit messages

Use short, imperative commit messages. Examples:

```text
Add JSON workspace export
Fix mobile task board overflow
Improve milestone date formatting
```

## Pull requests

Include:

- the problem being solved
- the approach taken
- how the change was tested
- screenshots for visual changes
- any known tradeoffs or follow-up work

By contributing, you agree that your contribution will be licensed under the MIT License.
