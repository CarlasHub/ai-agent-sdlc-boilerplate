# Tool Access Policy

## Principle

Every tool must be explicitly listed before use.

## Required fields

- tool name
- owner
- purpose
- read/write/execute permission
- data accessed
- risk level
- approval requirement
- logging requirement
- fallback plan

## Blocked by default

- shell access to production
- secrets managers
- payment systems
- HR systems
- customer databases
- deployment tools
- destructive file operations
