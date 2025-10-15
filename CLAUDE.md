<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

# CI Error Guidelines

If the user wants help with fixing an error in their CI pipeline, use the following flow:

- Retrieve the list of current CI Pipeline Executions (CIPEs) using the `nx_cloud_cipe_details` tool
- If there are any errors, use the `nx_cloud_fix_cipe_failure` tool to retrieve the logs for a specific task
- Use the task logs to see what's wrong and help the user fix their problem. Use the appropriate tools if necessary
- Make sure that the problem is fixed by running the task that you passed into the `nx_cloud_fix_cipe_failure` tool

<!-- nx configuration end-->

# Commit Message Conventions

When creating git commits, follow these conventional commit patterns:

## General Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

## Dependency Management

### Adding Dependencies

```
chore(deps): add [package-name]
build(deps): add [package-name]  # if it affects build configuration
```

**Examples:**

- Basic: `chore(deps): add @nx/react package`
- Descriptive: `chore(deps): add @nx/react for React workspace support`
- With body:

  ```
  chore(deps): add @nx/react plugin

  Added @nx/react to enable React application and library
  generation within the Nx monorepo. This provides generators,
  executors, and tooling for React projects.
  ```

### Updating Dependencies

```
chore(deps): update [package-name] to v2.0.0
chore(deps): bump [package-name] from 1.x to 2.x
```

### Removing Dependencies

```
chore(deps): remove unused [package-name]
```

## Common Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semi-colons, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates
- **build**: Build system or external dependency changes
- **ci**: CI/CD configuration changes
- **perf**: Performance improvements

## Scopes

Use meaningful scopes to indicate the area of change:

- `deps`: Dependencies
- `config`: Configuration files
- Project names: `api`, `web`, `shared`, etc.
- Feature areas: `auth`, `ui`, `db`, etc.
