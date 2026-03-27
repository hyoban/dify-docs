#!/bin/bash

# Cross-branch file/folder copy script
# Usage: ./git-copy-from-branch.sh <source-branch> <path> [destination-path]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

usage() {
    echo "Usage: $0 <source-branch> <path> [destination-path]"
    echo ""
    echo "Arguments:"
    echo "  source-branch    Branch to copy from"
    echo "  path             File or folder path to copy"
    echo "  destination-path Optional: destination path (defaults to same as source)"
    echo ""
    echo "Examples:"
    echo "  $0 main en/guides/workflow.md"
    echo "  $0 feature-branch src/components ./backup/"
    echo "  $0 develop config.json config.json.bak"
    exit 1
}

# Check arguments
if [ $# -lt 2 ]; then
    usage
fi

SOURCE_BRANCH="$1"
SOURCE_PATH="$2"
DEST_PATH="${3:-$SOURCE_PATH}"

# Verify we're in a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo -e "${RED}Error: Not a git repository${NC}"
    exit 1
fi

# Verify source branch exists
if ! git rev-parse --verify "$SOURCE_BRANCH" > /dev/null 2>&1; then
    echo -e "${RED}Error: Branch '$SOURCE_BRANCH' does not exist${NC}"
    exit 1
fi

# Check if source path exists in the source branch
if ! git ls-tree -r "$SOURCE_BRANCH" --name-only | grep -q "^${SOURCE_PATH}$\|^${SOURCE_PATH}/"; then
    # Try exact match for files
    if ! git cat-file -e "$SOURCE_BRANCH:$SOURCE_PATH" 2>/dev/null; then
        echo -e "${RED}Error: Path '$SOURCE_PATH' does not exist in branch '$SOURCE_BRANCH'${NC}"
        exit 1
    fi
fi

# Determine if source is a file or directory
IS_DIR=false
if git ls-tree -d "$SOURCE_BRANCH" "$SOURCE_PATH" > /dev/null 2>&1; then
    # Check if it's a tree (directory)
    TYPE=$(git cat-file -t "$SOURCE_BRANCH:$SOURCE_PATH" 2>/dev/null || echo "blob")
    if [ "$TYPE" = "tree" ]; then
        IS_DIR=true
    fi
fi

CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}Copying from branch '$SOURCE_BRANCH' to current branch '$CURRENT_BRANCH'${NC}"
echo "Source: $SOURCE_PATH"
echo "Destination: $DEST_PATH"
echo ""

if [ "$IS_DIR" = true ]; then
    echo -e "${GREEN}Copying directory...${NC}"

    # Create destination directory if needed
    mkdir -p "$DEST_PATH"

    # Get list of files in the directory from source branch
    git ls-tree -r --name-only "$SOURCE_BRANCH" "$SOURCE_PATH" | while read -r file; do
        # Calculate relative path
        REL_PATH="${file#$SOURCE_PATH/}"
        if [ "$REL_PATH" = "$file" ]; then
            REL_PATH="${file#$SOURCE_PATH}"
        fi

        # Construct destination file path
        if [ -n "$REL_PATH" ]; then
            DEST_FILE="$DEST_PATH/$REL_PATH"
        else
            DEST_FILE="$DEST_PATH/$(basename "$file")"
        fi

        # Create parent directory
        mkdir -p "$(dirname "$DEST_FILE")"

        # Copy file content
        git show "$SOURCE_BRANCH:$file" > "$DEST_FILE"
        echo "  Copied: $file -> $DEST_FILE"
    done
else
    echo -e "${GREEN}Copying file...${NC}"

    # Create destination directory if needed
    DEST_DIR=$(dirname "$DEST_PATH")
    if [ "$DEST_DIR" != "." ]; then
        mkdir -p "$DEST_DIR"
    fi

    # Copy file content
    git show "$SOURCE_BRANCH:$SOURCE_PATH" > "$DEST_PATH"
    echo "  Copied: $SOURCE_PATH -> $DEST_PATH"
fi

echo ""
echo -e "${GREEN}Done!${NC}"
echo ""
echo "Files are copied to your working directory (not staged)."
echo "Use 'git add' to stage the changes if needed."
