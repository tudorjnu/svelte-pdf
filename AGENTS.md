# AGENTS.md

## Agent skills

### Issue tracker

Issues live as local markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default triage label vocabulary is used. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Versioning

Patch-only during 0.x: every release bumps to the last published version + patch; write all changesets as `patch` (never minor/major). See README.md → "Publishing to npm → Versioning policy".
