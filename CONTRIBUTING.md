# Contributing to Fullstack Starter Kit

Thank you for your interest in contributing!

## Development Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/fullstack-starter-kit.git
    cd fullstack-starter-kit
    ```

2.  **Install dependencies**:
    We use `pnpm` for workspace management.
    ```bash
    pnpm install
    ```

3.  **Setup Environment Variables**:
    Copy `.env.example` to `.env` in both `backend/` and `frontend/` folders and fill in the required values.

4.  **Run in Development Mode**:
    ```bash
    pnpm dev
    ```

## Quality Standards

- **Testing**: Ensure all new features have unit and integration tests. Run `pnpm test` to verify.
- **Linting**: We enforce strict ESLint and Prettier rules. Run `pnpm lint` before committing.
- **TypeScript**: All new code should be type-safe.
- **Documentation**: Update README and API documentation (OpenAPI) if you change any public interfaces.

## Pull Request Process

1.  Create a new branch for your feature or bugfix.
2.  Commit your changes following [Semantic Commits](https://www.conventionalcommits.org/).
3.  Ensure the CI/CD pipeline passes.
4.  Submit a PR and wait for review.
