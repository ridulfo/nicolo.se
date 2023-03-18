rm public/employment-diagram.svg
mmdc -i employment-diagram.md -o public/employment-diagram.svg -t forest -b transparent
mv public/employment-diagram-1.svg public/employment-diagram.svg
curl "https://github-readme-stats.vercel.app/api/top-langs/?username=ridulfo&langs_count=8&exclude_repo=blog&hide=Jupyter%20Notebook&bg_color=00000000&theme=transparent" > public/stats.svg