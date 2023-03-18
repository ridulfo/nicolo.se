path_to_notebooks=_notebooks
path_to_blog_posts=src/pages/blog
path_to_public_blog_posts=public/blog

notebooks=$(ls $path_to_notebooks/*.ipynb | xargs basename)

# Compile all notebooks in notebooks/ to markdown in src/pages/blog/
for post in $notebooks; do
    jupyter nbconvert --to markdown --output-dir $path_to_blog_posts --log-level WARN $path_to_notebooks/$post
done;

# Move all the markdown files to the public/blog/ folder
for notebook_files_dir in $(find src/pages/blog/*_files -maxdepth 1 -type d -exec basename {} \;); do
    rm -r $path_to_public_blog_posts/$notebook_files_dir
    mv $path_to_blog_posts/$notebook_files_dir $path_to_public_blog_posts/$notebook_files_dir
done;

# Replace the _files directory with /blog/*_files in each blog post
# This is because the images are located in the public/blog/*_files directory
for post in $notebooks; do
    post_md="${post%.*}.md"
    post_md_files="${post%.*}_files"
    python -c "print(open('$path_to_blog_posts/$post_md').read().replace('$post_md_files','/blog/$post_md_files'))" > temp && mv temp $path_to_blog_posts/$post_md
done;

# Prepend the blog_post_prepend.md file to each blog post
for post in $notebooks; do
    post_md="${post%.*}.md"
    cat blog_post_prepend.md $path_to_blog_posts/$post_md > temp && mv temp $path_to_blog_posts/$post_md
done;