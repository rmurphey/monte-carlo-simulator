#!/bin/bash
# Simple secret detection for common patterns in staged files

# Look for lines that were added (+) containing potential secrets
secrets_found=$(git diff --cached | grep -E "^\+" | grep -E "(api_key|password|secret|token).*=.*[\"'][A-Za-z0-9]{20,}[\"']" | wc -l)

if [ "$secrets_found" -gt 0 ]; then
  echo "Potential secrets detected in staged files!"
  git diff --cached | grep -E "^\+" | grep -E "(api_key|password|secret|token).*=.*[\"'][A-Za-z0-9]{20,}[\"']"
  exit 1
else
  echo "No secrets detected"
  exit 0
fi