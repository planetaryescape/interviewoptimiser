# Database Migration Setup

This document describes the automated database migration workflow implemented across all three projects (cvoptimiser, interviewoptimiser, referenceoptimiser).

## Overview

We've implemented a consistent approach to database migrations across all three repositories:

1. **Pre-commit hooks** - Automatically generate migrations when schema files change
2. **GitHub Actions** - Dry-run migrations on PRs, apply migrations on merge to main

## Components

### 1. Pre-commit Hooks (Husky)

Located in each project at `.husky/pre-commit`

#### What it does:
- Detects when schema files (`db/schema/**/*.ts`) are being committed
- Automatically runs the appropriate migration generation command
- Stages generated migration files for commit
- Fails the commit if migration generation fails

#### Project-specific commands:
- **cvoptimiser**: `bun run db:generate`
- **interviewoptimiser**: `bun run db:generate`
- **referenceoptimiser**: `bun run db:generate:dev`

#### Example output:
```bash
📦 Schema files modified, generating migrations...
Changed schema files:
  - db/schema/users.ts
✅ Migrations generated successfully
📝 Adding new migration files to commit...
  - db/migrations/0001_new_migration.sql
✅ Migration files staged for commit
```

### 2. GitHub Actions Workflow

Located in each project at `.github/workflows/database-migrations.yml`

#### Triggers:
- **Pull Request**: Runs dry-run validation
  - Triggered by changes to `db/schema/**`, `drizzle.config.ts`, or the workflow file itself
- **Push to main/master**: Runs actual migration
  - Triggered by changes to `db/schema/**` or `drizzle.config.ts`

#### Pull Request Job (`migrate-dry-run`):

**Steps:**
1. Checks out code
2. Sets up Bun runtime
3. Installs dependencies
4. Installs Doppler CLI
5. Verifies migration files exist
6. Checks schema sync with database
7. Validates migrations can be applied
8. Comments on PR with results

**Environment:**
- Uses `DOPPLER_TOKEN_DEV` secret for development database access

**Outputs:**
- Success: Comments with list of migration files found
- Warning: Comments if schema changed but no migrations exist

#### Production Job (`migrate-production`):

**Steps:**
1. Checks out code
2. Sets up Bun runtime
3. Installs dependencies
4. Installs Doppler CLI
5. Runs database migrations in production
6. Notifies on failure

**Environment:**
- Uses `DOPPLER_TOKEN_PROD` secret for production database access
- Runs in GitHub environment named "production"

**Project-specific migration commands:**
- **cvoptimiser**: Checks for `db:migrate:prd` or falls back to `db:migrate:dev`
- **interviewoptimiser**: Checks for `db:migrate:prd` or falls back to `db:migrate:dev`
- **referenceoptimiser**: Uses `db:migrate:dev` (no separate prod command yet)

## Testing the Setup

### Test Pre-commit Hook

1. Make a change to a schema file:
   ```bash
   cd cvoptimiser
   # Edit db/schema/users.ts
   git add db/schema/users.ts
   git commit -m "test: update user schema"
   ```

2. Expected behavior:
   - Hook detects schema change
   - Runs `bun run db:generate`
   - Stages generated migration files
   - Completes commit with migrations included

3. Verify:
   ```bash
   git log --name-only -1
   # Should show both schema file and migration files
   ```

### Test GitHub Actions (Dry-run)

1. Create a branch and make schema changes:
   ```bash
   cd cvoptimiser
   git checkout -b test/schema-change
   # Edit db/schema/users.ts
   git add .
   git commit -m "test: update user schema"
   git push origin test/schema-change
   ```

2. Create a Pull Request on GitHub

3. Expected behavior:
   - Workflow triggers automatically
   - Checks migration files exist
   - Verifies schema sync
   - Comments on PR with results

4. Verify:
   - Check PR for automated comment
   - Review workflow logs in Actions tab

### Test GitHub Actions (Production)

**⚠️ WARNING: This runs in production! Only test if safe.**

1. Merge PR to main branch:
   ```bash
   git checkout main
   git pull origin main
   # Merge your test PR
   ```

2. Expected behavior:
   - Production workflow triggers
   - Applies migrations to production database
   - Notifies on success/failure

3. Verify:
   - Check workflow logs in Actions tab
   - Verify migrations applied in production database
   - Check for failure notifications if issues occur

## Required Secrets

Each repository needs these GitHub secrets configured:

### Development Environment:
- `DOPPLER_TOKEN_DEV` - Doppler token for development environment

### Production Environment:
- `DOPPLER_TOKEN_PROD` - Doppler token for production environment

## Common Issues & Solutions

### Issue: Pre-commit hook doesn't run
**Solution:** Ensure hook is executable:
```bash
chmod +x .husky/pre-commit
```

### Issue: Migration generation fails
**Solution:** Check schema syntax and Drizzle configuration:
```bash
bun run db:generate  # See full error message
```

### Issue: GitHub Action doesn't trigger
**Solution:** Verify triggers in workflow file:
- Check file paths match (`db/schema/**`)
- Ensure changes are in scope
- Check workflow syntax with GitHub's validator

### Issue: Production migration fails
**Solution:**
1. Check workflow logs for error details
2. Verify `DOPPLER_TOKEN_PROD` secret is set
3. Ensure migrations are backwards compatible
4. Test in staging environment first

## Workflow Consistency

All three projects follow the same pattern with these adaptations:

| Project | Generate Command | Migrate Command | Lint-Staged |
|---------|-----------------|-----------------|-------------|
| cvoptimiser | `db:generate` | `db:migrate:prd` or `db:migrate:dev` | ✅ Yes |
| interviewoptimiser | `db:generate` | `db:migrate:prd` or `db:migrate:dev` | ✅ Yes |
| referenceoptimiser | `db:generate:dev` | `db:migrate:dev` | ❌ No |

## Best Practices

1. **Always generate migrations locally first**
   - Don't rely solely on pre-commit hooks
   - Review generated migrations before committing

2. **Test migrations in development**
   - Run `bun run db:migrate:dev` locally
   - Verify schema changes work as expected

3. **Make migrations backwards compatible**
   - Add columns as nullable initially
   - Use multi-step migrations for breaking changes
   - Consider zero-downtime deployment strategies

4. **Review PR comments carefully**
   - GitHub Actions will warn about missing migrations
   - Don't merge PRs with migration warnings

5. **Monitor production migrations**
   - Watch workflow logs during deployment
   - Have rollback plan ready
   - Test in staging environment first

## Maintenance

### Adding a new project
1. Copy `.husky/pre-commit` from existing project
2. Copy `.github/workflows/database-migrations.yml`
3. Update project-specific commands if needed
4. Configure GitHub secrets
5. Test with a dummy schema change

### Updating the workflow
1. Edit workflow file in one project
2. Test thoroughly with PRs
3. Apply same changes to other projects
4. Update this documentation

## Additional Resources

- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Doppler CLI Documentation](https://docs.doppler.com/docs/cli)

## Support

If you encounter issues:
1. Check this documentation
2. Review workflow logs in GitHub Actions
3. Check Drizzle Kit documentation
4. Verify environment variables and secrets
5. Test locally before pushing changes
