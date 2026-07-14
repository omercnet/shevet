# Paseo repo setup

Run this after creating a fresh Paseo worktree:

```bash
node .paseo/setup.mjs
```

It installs package dependencies in `web/`, `studio/`, and `tools/import/` only when `node_modules` is missing.
