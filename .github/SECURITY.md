# Security Policy for QuantumCode-Dynamic-QR-Generator-Web-Utility

As the Apex Technical Authority, this repository adheres to a **Zero-Defect, Future-Proof** security posture, reflecting the highest standards expected in the late 2025 software ecosystem.

## 1. Supported Versions

This project utilizes modern, actively maintained dependencies. We only provide security support for the **latest stable release** of the core stack (TypeScript, Vite, modern browser APIs).

We strongly recommend users upgrade to the latest version immediately if they are running on older, unsupported versions.

## 2. Vulnerability Reporting

We encourage responsible disclosure of security vulnerabilities. Please follow the established Apex Reporting Protocol outlined below.

### Reporting Procedure

If you discover a security issue, please **DO NOT** report it publicly via Issues or Pull Requests. Follow these steps for private, secure disclosure:

1.  **Create a Private Security Issue:** Navigate to the repository's Issues tab and select the **Security Vulnerability** template (if available), or create a new issue marked as private (if you have appropriate permissions).
2.  **Detail the Vulnerability:** Provide a clear, step-by-step description of how to reproduce the issue. Include affected versions and the potential impact.
3.  **Confidentiality:** Keep the issue private until a patch has been accepted and deployed, or until we agree on a public disclosure timeline.

**Repository Link:** `https://github.com/chirag127/QuantumCode-Dynamic-QR-Generator-Web-Utility`

## 3. Mitigation and Response Timeline

Our goal is rapid response and remediation:

| Severity | Target Response Time | Target Remediation Time |
| :--- | :--- | :--- |
| Critical | 24 Hours | 72 Hours |
| High | 48 Hours | 7 Days |
| Medium/Low | 5 Business Days | 14 Days |

*Note: These timelines begin upon receipt of a fully detailed, actionable report.*

## 4. Dependencies and Supply Chain Security

As a modern utility built on Vite and TypeScript, dependency integrity is paramount. We enforce:

*   **Automated Scanning:** The CI workflow (`.github/workflows/ci.yml`) is configured to run automated dependency scanning checks on every push and PR to detect known vulnerabilities.
*   **Dependency Updates:** We use automated tools to monitor and propose timely updates for all Node packages, ensuring we stay ahead of known CVEs.
*   **Library Trust:** Only packages from verified, well-maintained sources are utilized. Custom scanning of package integrity is performed during major version upgrades.

## 5. Static Analysis and Code Quality

Security is integrated into the development lifecycle via the **Apex Toolchain**:

*   **Linter/Formatter:** **Biome** is configured aggressively to enforce stylistic consistency, which indirectly prevents certain classes of logical errors.
*   **Strict Typing:** TypeScript is used in `strict` mode to eliminate entire categories of runtime errors associated with type coercion and nullability.

**For more on our development mandates, please review the `AGENTS.md` file.**