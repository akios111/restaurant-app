#!/bin/bash

# Navigate to the script's directory to ensure it runs from project root
# cd "$(dirname "$0")"

# Add all changes
echo "Adding all changes to staging..."
git add .

# Prompt for commit message
read -p "Enter commit message: " COMMIT_MESSAGE

# Commit changes
if [ -z "$COMMIT_MESSAGE" ]; then
  echo "No commit message entered. Using default 'Update files'."
  git commit -m "Update files"
else
  git commit -m "$COMMIT_MESSAGE"
fi

# Push to origin main
echo "Pushing to origin main..."
git push origin main

echo "Done." 