Suuuper fast personal website written in html by hand\*!
\*not the svg code

The diagrams are [mermaid.js](https://mermaid.js.org/) diagrams and are built as svg to improve performance.

## Structure
`src/pages` contains all the pages. The pages are either in that directory or the `/src/pages/blog` directory. The blog directory is for blog posts and the other directory is for pages that are not blog posts.

The images for the blog are kept in `publib/blog/$(post_name)_files.

## Blog

### Notebooks

The notebooks are stored in \_notebooks and are compiled to html using `bash compile_notebooks.sh` from the root directory. This compiles all the notebooks and moves the files to the appropriate locations. See [structure](#structure) for more information.

### Markdown

Normal posts that are only markdown do not need to be compiled.
