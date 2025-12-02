# 🤝 Contributing to QuantumCode-Dynamic-QR-Generator-Web-Utility

As the Apex Technical Authority, we demand contributions that adhere to **Zero-Defect, High-Velocity, Future-Proof** engineering principles. This project is engineered to be a high-performance, modern standard-bearer for web utilities.

## 1. Our Engineering Philosophy

All contributions must respect the following core tenets, as defined in our internal `AGENTS.md`:

*   **SOLID Adherence:** Ensure new code maintains high cohesion and low coupling.
*   **DRY Principle:** Eliminate redundant logic at all costs.
*   **YAGNI:** Only build what is currently required; avoid speculative abstraction.
*   **TypeScript Strictness:** All JavaScript must be compiled with maximum TypeScript strictness (even if the original files are `.js`, they must pass strict analysis).
*   **Performance Budget:** Every change must be scrutinized against its impact on generation speed and bundle size.

## 2. Prerequisites

Before contributing, ensure you have the full Apex Toolchain installed and configured:

1.  **Node.js:** Version 20 LTS or newer (for Vite/TypeScript ecosystem).
2.  **Package Manager:** `npm` or `pnpm`.
3.  **Git:** Configured with your correct user identity.

## 3. The Contribution Workflow

We follow a standard Fork, Branch, Commit, Pull Request workflow. **Do not push directly to `main`**.

### Step 1: Fork and Clone

bash
git clone https://github.com/chirag127/QuantumCode-Dynamic-QR-Generator-Web-Utility.git
cd QuantumCode-Dynamic-QR-Generator-Web-Utility


### Step 2: Create a Feature Branch

Use a descriptive branch name following the convention `feat/short-description` or `fix/issue-number-description`.

bash
git checkout -b feat/implement-error-handling-strategy


### Step 3: Local Development & Verification

Implement your changes. **Crucially, run local verification steps before committing.**

bash
# Install dependencies (using npm as the standard interface)
npm install

# Run linter and formatter (Biome)
npm run lint

# Run unit tests (Vitest)
npm run test:unit

# Run end-to-end tests (Playwright)
npm run test:e2e


If any verification step fails, your contribution will be rejected during CI validation.

### Step 4: Commit Messages

Use **Conventional Commits**. All commits must be atomic and clearly describe *what* changed and *why*.

**Example:** `feat(qr-core): Introduce dynamic error correction level switching via API`

### Step 5: Submit a Pull Request (PR)

1.  Push your branch to your fork: `git push origin feat/my-change`.
2.  Navigate to the main repository on GitHub and open a new Pull Request against the `main` branch.
3.  **Mandatory:** Fill out the **Pull Request Template** (`.github/PULL_REQUEST_TEMPLATE.md`) completely. This ensures all context (Architectural impact, Testing evidence, Agent Alignment check) is provided to reviewers.

## 4. Code Style and Tooling Enforcement

To ensure consistency and maintain the high standard required by the Apex Authority, all code is automatically checked and formatted by the following tools:

*   **Linter/Formatter:** [Biome](https://biomejs.dev/) (Enforces speed and correctness).
*   **Testing:** [Vitest](https://vitest.dev/) (Unit) and [Playwright](https://playwright.dev/) (E2E).
*   **Bundler:** [Vite](https://vitejs.dev/).

If you introduce new dependencies, ensure they are listed in `package.json` and that they comply with modern ECMAScript standards and have low supply chain risk.

## 5. Reporting Issues and Security

*   **Bugs:** Please report all bugs using the official [Bug Report Template](./.github/ISSUE_TEMPLATE/bug_report.md).
*   **Security:** Any suspected vulnerability must be reported privately via the [Security Policy](./.github/SECURITY.md) before public disclosure.

--- 

*Thank you for investing time in ensuring `QuantumCode-Dynamic-QR-Generator-Web-Utility` remains a high-quality, future-proof asset.*