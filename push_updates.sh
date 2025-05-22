#!/bin/bash

# Script to add, commit, and push changes to GitHub.

# Ensure the script is run from the project root where .git directory is.
# If your .git directory is not in the same directory as this script,
# you might need to cd to the correct project root first.
# For example: cd /c/ergasies/restaurant || exit

echo "Navigating to project root (C:/ergasies/restaurant)..."
cd "/c/ergasies/restaurant" || { echo "Failed to navigate to project root. Exiting."; exit 1; }

# Add all changes to staging
# This includes new files, modified files, and deleted files.
echo "Adding all changes to staging..."
git add .

# Check if there are any changes to commit
if git diff-index --quiet HEAD --; then
  echo "No changes to commit. Working tree clean."
  exit 0
fi

# Prompt for commit message
read -p "Enter commit message (or press Enter for 'Update files'): " COMMIT_MESSAGE

# Commit changes
if [ -z "$COMMIT_MESSAGE" ]; then
  COMMIT_MESSAGE="Update files"
  echo "No commit message entered. Using default: '$COMMIT_MESSAGE'"
fi

echo "Committing changes with message: '$COMMIT_MESSAGE'..."
git commit -m "$COMMIT_MESSAGE"

# Check if commit was successful
if [ $? -ne 0 ]; then
  echo "Git commit failed. Please check for errors (e.g., unresolved merge conflicts, empty commit)."
  exit 1
fi

# Define the remote repository URL and branch
REMOTE_URL="https://github.com/akios111/restaurant-app"
BRANCH="main"

# Push to the specified remote and branch
echo "Pushing to $REMOTE_URL on branch $BRANCH..."
git push "$REMOTE_URL" "$BRANCH"

# Check if push was successful
if [ $? -eq 0 ]; then
  echo "Successfully pushed to $REMOTE_URL $BRANCH."
else
  echo "Git push failed. Please check your remote repository settings, network connection, and authentication."
  echo "Common issues:"
  echo "- Ensure you have write permissions to the repository."
  echo "- Check if the remote URL '$REMOTE_URL' is correct."
  echo "- Ensure you are authenticated with Git (e.g., via SSH key or Personal Access Token)."
  echo "- If it's a new repository or you haven't pushed before, you might need 'git push -u origin main' the first time for the current branch setup."
  exit 1
fi

echo "Done." 