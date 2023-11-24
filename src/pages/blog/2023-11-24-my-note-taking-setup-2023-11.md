---
layout: "@layouts/BlogLayout.astro"
---

# My note-taking setup 2023-11

## TL;DR
I lost a lot of notes because I failed to realize that the notes were not being backed up.

I decided to move away from hosting my notes on iCloud to hosting my own git server on my home network. To access it I VPN into the network.

If you are just interested in the new set up, feel free to skip to [new setup](#new-setup).

## Introduction

A week ago I lost months of notes... It was my fault, and it will never happen again.

Around the time I was finishing university, I was using [Evernote](https://evernote.com) to keep notes. It worked well for the purpose of journaling and keeping track of projects. However, it was lacking something that I have come to obsess about. **Freedom and Control**.

As I understood at the time, Evernote keeps your notes in their proprietary format on their servers. Yes, it is quite convenient as it allows you to access all your notes from anywhere. The only problem is that you do not have control over your data. This probably goes for most of the note-taking systems out there. With all these systems you are just a consumer consuming a product. There is little you can do to make it to suit your individual needs. If what you want to do isn't supported, then "sucks to be you". Either forget your need, or find a painful workaround.

This is when I discovered [Obsidian.md](https://obsidian.md). It is a note-taking application that stores everything in the simple [markdown](https://en.wikipedia.org/wiki/Markdown) text format. The user can choose to store their files anywhere they want. Finally a note-taking system that gave back ownership to the users. **It was a tool, not a service.** I have used obsidian to keep notes since July of 2022. Perfectly happy, typing away.

In order to be able to write on both my computer and my phone without painful manual synchronization, I kept my notes in iCloud. If I made changes to a note, they would immediately be visible on my computer. A perfect system that worked flawlessly.

Since everything was just plain text files, I made it into a git repository. It allowed me to add version control to my notes. This was particularly helpful when doing bulk changes using scripts without risking to loose things. If something went wrong, I could just revert the changes.

## The downfall 
Enter `git reset --hard`... The thing with git repositories is that changes need to be committed in order for them to get version controlled. One day at work I was working on a hard problem which I could not get right. I had to reset back to square one multiple times because the idea did not work out. As you can guess, I accidentally reset my obsidian vault...

Unfortunately, I had not committed anything in four months. Everything was lost. In panic I googled how to undo a reset. I managed to find that one could do `git reset 'HEAD@{1}'`. For a couple of days I thought that I had undone the accident. I later realized that I had only brought back new files created after the last commit. All the changes to old files were still gone. 

Despite this, I did not worry (yet). I backed up my laptop multiple times every day. At most I would loose that day's notes. Turns out, which now makes sense, even though you have a symlink (shortcut) to a directory in iCloud time machine does not back it up.

*This is when I swore that I would never loose data again.*

## New setup
The only solution is **more freedome and more control**! I needed to ditch iCloud and host my own documents.

Being a big vim user and being inspired by Edwin Wenink's [building a note-taking system with vanilla vim](https://www.edwinwenink.xyz/posts/42-vim_notetaking/), I also decided to drop Obsidian (on my computer). My vim, or rather Neovim, setup is quite simple. I have created snippets for inserting boilerplate text that is present in every journal entry and have set up [telescope](https://github.com/nvim-telescope/telescope.nvim) to search for files and grep for text.

I set up a git-server on my NAS and pushed my notes to it. In order to connect to the server and push new changes when I'm not on my network, I have a [wireguard](https://www.wireguard.com) VPN server that tunnels me into my network. This allows me to access it from anywhere in the world.

With that fixed there was one last problem. Taking notes on my phone. This is something that I do when I am on the move or in informal meetings. Not being able to take notes on my phone would be a deal breaker. Luckily I found [this post](https://meganesulli.com/blog/sync-obsidian-vault-iphone-ipad/) by Megan Sullivan detailing how to set up [working copy](https://workingcopy.app) with Obsidian. It was almost too good to be true. But it worked! Note, working copy is not open source and I have no control there. But at the moment I am stuck with an iPhone which gives me little alternatives. Its files app's connection to samba shares is way too unreliable to use.

In order to pull and push changes from my phone, I set up very simple iOS shortcuts. With a single tap I can pull and commit new notes.

## What have I learned
It was never the fault of iCloud or Obsidian that I lost all of those notes. I could probably be using both of them for the foreseeable future. What probably caused it was the perceived complexity and distance between me writing notes and the underlying system keeping them safe.

Now that I am literally just editing text files using the simplest of editors, the distance has been shortened. The same thing goes for backing hem up. I have to commit and push when I am done. Forgetting to do that means that they aren't synchronized.
The safety is built into the system using very simple mechanisms.

One last neat thing! At the moment my NAS' purpose storing time machine backups and my notes. It only has one hard drive. Would it fail, everything would be lost. This does not worry me though. The data is distributed across my laptop and phone. 

PS: I will by another hard drive for my NAS, I am just waiting for it to move up my priorities.
