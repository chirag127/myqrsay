# 🤝 Contributing to QuantumCode-Dynamic-QR-Generator-Web-App

Welcome, Architect. Your contributions are vital to maintaining the **Zero-Defect, High-Velocity, Future-Proof** standard of the QuantumCode Generator.

This project adheres strictly to the **Apex Technical Authority** standards, prioritizing TypeScript, Vite, and Feature-Sliced Design (FSD) for unparalleled frontend performance and maintainability.

## 1. The Apex Philosophy: Principles First

Before submitting any Pull Request (PR), internalize and adhere to these core software engineering principles, as mandated by the Apex Architecture Charter:

*   **SOLID:** Ensure new features or fixes strictly comply with Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion principles.
*   **DRY (Don't Repeat Yourself):** Generic utilities must be extracted into shared layers (e.g., `shared/lib`).
*   **YAGNI (You Ain't Gonna Need It):** Avoid speculative complexity. Implement only what is currently required.

## 2. Development Environment Setup (The Fast Path)

We leverage the performance benefits of the modern toolchain. Ensure your local environment mirrors the CI pipeline.

1.  **Prerequisites:** Node.js (LTS), Git, `npm` or `pnpm`.
2.  **Clone:**
    bash
    git clone https://github.com/chirag127/QuantumCode-Dynamic-QR-Generator-Web-App.git
    cd QuantumCode-Dynamic-QR-Generator-Web-App
    
3.  **Install Dependencies (Using pnpm recommended for speed):
    bash
    pnpm install
    
4.  **Verification (Linter/Formatter Check):** Before committing, ensure zero linting errors using the official formatter, **Biome**.
    bash
    pnpm lint
    pnpm format:check
    

## 3. Contribution Workflow

We use a strict **Feature-Sliced Design (FSD)** structure. All new features must be introduced as new `features/` modules or layered correctly within existing ones.

### A. Branching Strategy

Use the `develop` branch as the integration point. Never push directly to `main`.

bash
# Always start from the latest develop branch
git checkout develop
git pull origin develop

# Create a descriptive feature or fix branch
git checkout -b feat/qr-style-persistence
# OR
git checkout -b fix/wifi-config-encoding


### B. Committing Standards

All commits **MUST** follow the Conventional Commits specification (`<type>(<scope>): <description>`).

**Valid Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`.

**Example:** `feat(ui): Implement dynamic color picker for QR foreground`

### C. Verification & Testing (Vitest/Playwright)

Every new functional change or bug fix requires associated automated testing.

*   **Unit/Integration Tests:** Add/update tests in the corresponding `__tests__` directory using **Vitest**.
    bash
    pnpm test:unit
    
*   **E2E Tests:** For significant user flows, add or update E2E validation using **Playwright**.
    bash
    pnpm test:e2e
    

## 4. Pull Request (PR) Requirements

All PRs must pass automated checks before a human reviewer will look at them.

1.  **PR Template:** Fill out the provided `.github/PULL_REQUEST_TEMPLATE.md` completely.
2.  **Self-Review:** Verify your code against the **AGENTS.md** directives.
3.  **Build & Test Locally:** Ensure all local tests pass (`pnpm test`).
4.  **CI Green:** Ensure the GitHub Actions CI pipeline (`.github/workflows/ci.yml`) runs completely green *before* requesting a review.
5.  **Scope Management:** Keep PRs atomic. A single PR should address one concern (one feature or one fix).

## 5. Reporting Issues and Security Vulnerabilities

### A. Bug Reports
Use the provided template at `.github/ISSUE_TEMPLATE/bug_report.md`. Be specific, provide steps to reproduce, and include environment details.

### B. Security Vulnerabilities

If you discover a security vulnerability, **DO NOT** report it publicly. Follow the strict protocol outlined in **SECURITY.md** to report privately to `security@chirag127.io`.

*   *Refer to the **SECURITY.md** file for the detailed disclosure policy.*