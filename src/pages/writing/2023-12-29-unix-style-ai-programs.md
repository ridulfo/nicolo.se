---
layout: "@layouts/WritingLayout.astro"
---

# Unix-style AI programs

## TL;DR

I created "AI" based command line programs that can be compose into extremely powerful commands.
For example, semantic search for Christmas themed recipes and find one that that can be made quickly: `semgrep -n 5 -p documents/notes/recipes "Christmas recipe" | ai "Which of these recipes can I make in 30 minutes?"`

## Background

I love the [Unix philosophy](https://en.wikipedia.org/wiki/Unix_philosophy). Here is a summarized version of it by [Peter H. Salus](https://en.wikipedia.org/wiki/Peter_H._Salus "Peter H. Salus") :

- Write programs that do one thing and do it well.
- Write programs to work together.
- Write programs to handle text streams, because that is a universal interface.

Following these simple rules many simple programs can be chained into a powerful meta-program.

### Why

The majority of the time I spend on my computer, I spend it in the terminal. That is where I do most of my work: programming, note-taking, program and script running etc.

I have for the last couple of months felt like I need artificial intelligence in my terminal to remove boring manual labour. Nobody want's to manually format a program's output into something more human readable, summarize a document or find the answer in a massive wall of error messages.
This is a perfect job for an LLM.

## semgrep

To find documents I usually use something like `grep -r search-term .`. It works most of the time when I know what words to search for. However, when one does not know what words to use, but only knows semantically equivalent words one can use semantic search.

For this I created `semgrep`.

```
semgrep -h
usage: Semantic grep [-h] [--update] [--path PATH] [-n N] query

A semantic document search

positional arguments:
  query                 The search query.

options:
  -h, --help            show this help message and exit
  --update, -u          Whether to update the index (might take some time).
  --path PATH, -p PATH  The directory to search.
  -n N                  The number of results to return
```

It simply takes a query and returns sections of text that are semantically similar. For more information check it out on [Github](https://github.com/ridulfo/ai-tools).

**Example:**

```
> semgrep "Hard problem to solve"
./2022-07-04-Recipes-as-a-Service.md with score 0.35454288125038147 in chapter 2
## This post
In this post we explore various ways of finding recipes that have ingredients in common. Although this task might seem simple at first, it turns out that the problem has a factorial time complexity. [...]
```

### A small aside:

Most guides on building semantic search programs advocate using vector databases to store the embeddings. This is extreme overkill unless you have hundreds of thousands of embeddings. In the case of `semgrep`, it does **not** even use specialized data-structures such as [faiss](https://github.com/facebookresearch/faiss).

Here is [a great article](https://about.xethub.com/blog/you-dont-need-a-vector-database)by XetData about not needing vector databases.

## LLMs as a Unix program

Now imagine you have a text file that you would like to have summarized. You would like to simply write `cat README.md | ai "Summarize this."`.
That is possible with the other script that I created just called `ai`. More information about it here: [Github](https://github.com/ridulfo/ai-tools).

```
> ai -h
usage: ai [-h] [-n N] [--model MODEL] [--verbose] prompt

positional arguments:
  prompt

options:
  -h, --help            show this help message and exit
  -n N
  --model MODEL, -m MODEL
  --verbose, -v
```

This script is simple. It just reads stdin and argv, creates a prompt and then prints the output to stdout. It uses [llama-cpp-python](https://github.com/abetlen/llama-cpp-python) and a light weight llama-model. This means that no internet is needed, which in turn means that no sensitive information is send to third parties.

## Unix-style composability

Here are some examples of chains of commands that can be run.

**Semantic search and then ask the LLM to answer a question based on those results.**

```
> semgrep "Hard problem to solve" | ai "Why is this problem hard to solve?"

The problem you described is indeed complex and computationally intensive, especially considering the time complexity `O(n!)`. This type of problem falls under the category of combinatorial optimization problems which are known for their NP-hard nature.[...]
```

_(The output of `semgrep` which is piped into `ai` can be found above.)_

**Browse the web.**

```
 wget -qO- nicolo.se | ai "What does it say in on this website?"

 This website appears to be a personal portfolio and blog website of an individual named Nicolo. The website has several sections, including "about", "thoughts", "blog", and "projects". The homepage lists these categories in a navigation menu.
```

**Summarize an article**

```
> wget -qO- https://nicolo.se/writing/2023-11-24-my-note-taking-setup-2023-11.html | pandoc -f html -t markdown_github | ai -c 2048 "Summarize this article"

 This article tells the story of how the author lost notes saved in iCloud due to a git reset command being executed, leading them to re-evaluate their approach to note-taking and data backups. The new setup involves hosting their own git server on their home network, which they access using a VPN connection when away from home. They also use the Working Copy app on their iPhone for taking notes.

The main takeaway from this experience is that the author learned to take more control of their data and ensure it is backed up regularly. This involved moving away from a service-based solution like iCloud towards a self-hosted option, which provided them with more flexibility and control over their data.
```

## Conclusion

Applying the Unix philosophy to simple LLM programs can yield great results. The examples above are not cherry-picked, they were first try. The output of one AI can even be piped into another to incrementally build on the complexity of the desired output.

### Future work

There are endless opportunities for future development. Here are some of the top of my head:

- [Use of tools](https://en.wikipedia.org/wiki/Large_language_model#Tool_use)
- Different system prompts to create different "agents"
- Create a program to query a traditional search engine (such as duck duck go) and pipe the results into `ai` to get an answer.
