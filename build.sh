rm employment-diagram.svg
mmdc -i employment-diagram.md -o employment-diagram.svg -t forest -b transparent
curl "https://github-readme-stats.vercel.app/api/top-langs/?username=ridulfo&langs_count=8&exclude_repo=blog" > stats.svg