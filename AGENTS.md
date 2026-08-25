## Agent skills

### Issue tracker

GitHub Issues on Quadro77/Catapult. See `docs/agents/issue-tracker.md`.

### Triage labels

Default roles: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `CONTEXT.md` + `docs/adr/`. See `docs/agents/domain.md`.

### Glossary

Shared language for humans and agents: `Glossary.md`. Game terms match `CONTEXT.md`. Engineering terms (module, seam, grill, ticket) live there too.

### Geometry bake

Locking editor window placements into TypeScript defaults. Run `npm run bake` (save → defaults). See `docs/adr/0004-bake-is-save-to-defaults.md`.
