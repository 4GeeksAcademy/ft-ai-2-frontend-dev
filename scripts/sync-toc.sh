#!/usr/bin/env bash
#
# sync-toc.sh — propagate the Module Demonstrations TOC from main to every
# other branch.
#
# The canonical TOC block lives in main/README.md between HTML comment markers:
#
#   <!-- TOC:START -->
#   ## Module Demonstrations
#   ...
#   <!-- TOC:END -->
#
# On each branch the script replaces that entire marked block (heading, intro,
# and module links). Branch-specific content outside the markers — intros,
# devlogs, walkthrough links — is left untouched.
#
# Branches that do not yet have markers get a one-time migration: the script
# finds the old TOC section heuristically, replaces it with the marked block,
# and adds the markers for future runs.
#
# Only main publishes docs/index.html (GitHub Pages). That file is regenerated
# with `marked` on main alone.
#
# Usage:
#   scripts/sync-toc.sh            # dry run: show what would change, push nothing
#   scripts/sync-toc.sh --push     # commit and push the changes to each branch
#
# Requirements: git (with push access to origin), node/npx.

set -euo pipefail

REPO_URL="https://github.com/4GeeksAcademy/ft-ai-2-frontend-dev.git"
SOURCE_BRANCH="main"
MARKED_VERSION="18"
TOC_START='<!-- TOC:START -->'
TOC_END='<!-- TOC:END -->'

PUSH=false
[ "${1:-}" = "--push" ] && PUSH=true

WORKDIR="$(mktemp -d)"
cleanup() { rm -rf "$WORKDIR"; }
trap cleanup EXIT

echo "Cloning $REPO_URL ..."
git clone --quiet "$REPO_URL" "$WORKDIR/repo"
cd "$WORKDIR/repo"

# commit_and_report <message>: commit staged changes (or, in dry run, show the
# diff and discard them). Assumes the relevant files are already staged.
commit_and_report() {
  local message="$1"
  if git diff --cached --quiet; then
    echo "  already up to date"
    return
  fi
  if [ "$PUSH" = true ]; then
    git commit --quiet -m "$message"
    git push --quiet origin "$(git rev-parse --abbrev-ref HEAD)"
    echo "  committed and pushed"
  else
    echo "  would update (dry run):"
    git --no-pager diff --cached --stat | sed 's/^/  /'
    git reset --quiet
  fi
}

# extract_toc_block <readme> <output>
# Pull the canonical marked TOC block from a README file.
extract_toc_block() {
  local readme="$1"
  local output="$2"
  awk -v start="$TOC_START" -v end="$TOC_END" '
    $0 == start { capture = 1 }
    capture { print }
    $0 == end   { capture = 0; exit }
  ' "$readme" > "$output"
}

# patch_readme <readme> <toc-block>
# Replace the TOC region in a README with the canonical block.
patch_readme() {
  local readme="$1"
  local tocfile="$2"

  if grep -qF "$TOC_START" "$readme"; then
    awk -v start="$TOC_START" -v end="$TOC_END" -v tocfile="$tocfile" '
      BEGIN {
        while ((getline line < tocfile) > 0) toc = toc line "\n"
        close(tocfile)
      }
      $0 == start { printf "%s", toc; skip = 1; next }
      skip && $0 == end { skip = 0; next }
      skip { next }
      { print }
    ' "$readme" > "${readme}.tmp"
  else
    awk -v tocfile="$tocfile" '
      BEGIN {
        while ((getline line < tocfile) > 0) toc = toc line "\n"
        close(tocfile)
        skipping = 0
        replaced = 0
      }
      /^## (Repo Table Of Contents|Repo Structure|Module Demonstrations)/ {
        if (!replaced) { printf "%s", toc; replaced = 1 }
        skipping = 1
        next
      }
      skipping && /^- .*tree\/module\// { next }
      skipping && /^Each (section|demonstration)/ { next }
      skipping && /^$/ { next }
      skipping && /^## / { skipping = 0 }
      skipping { next }
      { print }
    ' "$readme" > "${readme}.tmp"
  fi

  mv "${readme}.tmp" "$readme"
}

# 1. Extract the canonical TOC block from main.
git checkout --quiet "$SOURCE_BRANCH"
extract_toc_block README.md "$WORKDIR/toc-block.md"

if ! grep -qF "$TOC_START" "$WORKDIR/toc-block.md"; then
  echo "ERROR: $TOC_START / $TOC_END markers not found in $SOURCE_BRANCH/README.md" >&2
  echo "       Add the marked TOC block to main before running this script." >&2
  exit 1
fi

echo "Canonical TOC block (from $SOURCE_BRANCH):"
sed 's/^/    /' "$WORKDIR/toc-block.md"
echo

# 2. Regenerate docs/index.html on main only.
echo "=== $SOURCE_BRANCH (docs/index.html) ==="
if [ -f docs/index.html ]; then
  npx --yes "marked@$MARKED_VERSION" -i README.md -o docs/index.html
  git add docs/index.html
  commit_and_report "Rebuild docs/index.html from README"
else
  echo "  no docs/index.html on $SOURCE_BRANCH, skipping"
fi

# 3. Patch the TOC block into every other branch (README only).
branches="$(git for-each-ref --format='%(refname:lstrip=3)' refs/remotes/origin \
  | grep -vxE "HEAD|$SOURCE_BRANCH")"

for branch in $branches; do
  echo "=== $branch ==="
  git checkout -f --quiet "$branch"

  if ! grep -qE '^- .*tree/module/' README.md && ! grep -qF "$TOC_START" README.md; then
    echo "  no TOC found, skipping"
    continue
  fi

  patch_readme README.md "$WORKDIR/toc-block.md"
  git add README.md
  commit_and_report "Sync module demonstrations TOC from $SOURCE_BRANCH"
done

echo
if [ "$PUSH" = true ]; then
  echo "Done. TOC synced to all branches."
else
  echo "Dry run complete. Re-run with --push to commit and push."
fi
