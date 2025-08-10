#!/usr/bin/env bash
set -euo pipefail

# Convert notebooks to markdown
jupyter nbconvert --to markdown --output-dir src/pages/writing --log-level WARN _notebooks/*.ipynb

for notebook in _notebooks/*.ipynb; do
    name=$(basename "$notebook" .ipynb)
    md_file="src/pages/writing/$name.md"
    assets_dir="src/pages/writing/${name}_files"
    
    # Skip if markdown doesn't exist (shouldn't happen)
    if [[ ! -f "$md_file" ]]; then
        continue
    fi
    
    # Move assets to src/assets directory if they exist
    if [[ -d "$assets_dir" ]]; then
        mkdir -p src/assets
        rm -rf "src/assets/${name}_files" 2>/dev/null || true
        mv "$assets_dir" "src/assets/"
    fi
    
    # Fix image paths and add frontmatter
    {
        echo "---"
        echo "layout: \"@layouts/WritingLayout.astro\""
        echo "---"
        echo
        # Fix image paths to use relative paths to src/assets
        sed "s|${name}_files|../../assets/${name}_files|g" "$md_file"
    } > temp && mv temp "$md_file"
done
