#!/bin/sh
# Push the current commit to the staging site, without the CNAME file
# (staging must not claim the custom domain).
# Staging: https://hunterxhawke.github.io/accipiterpictures-staging/
set -e
idx=$(mktemp)
GIT_INDEX_FILE=$idx git read-tree HEAD
GIT_INDEX_FILE=$idx git rm --cached -q --ignore-unmatch CNAME
tree=$(GIT_INDEX_FILE=$idx git write-tree)
rm -f "$idx"
commit=$(git commit-tree "$tree" -m "Staging: $(git log -1 --format=%s)")
git push -f staging "$commit:refs/heads/main"
