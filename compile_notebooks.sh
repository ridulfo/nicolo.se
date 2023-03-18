path_to_notebooks=_notebooks
path_to_blog_posts=src/pages/blog
path_to_public_blog_posts=public/blog

notebooks=$(ls $path_to_notebooks/*.ipynb | xargs basename)

# Compile all notebooks in notebooks/ to markdown in src/pages/blog/
for post in $notebooks; do
    jupyter nbconvert --to markdown --output-dir $path_to_blog_posts --log-level WARN $path_to_notebooks/$post
done;

# Move all the markdown files to the public/blog/ folder
for notebook_files in $(find src/pages/blog/*_files -maxdepth 1 -type d -exec basename {} \;); do
    rm -r $path_to_public_blog_posts/$notebook_files
    mv $path_to_blog_posts/$notebook_files $path_to_public_blog_posts/$notebook_files
done;

# Prepend the blog_post_prepend.md file to each blog post
for post in $notebooks; do
    post_md="${post%.*}.md"
    cat blog_post_prepend.md $path_to_blog_posts/$post_md > temp && mv temp $path_to_blog_posts/$post_md
done;