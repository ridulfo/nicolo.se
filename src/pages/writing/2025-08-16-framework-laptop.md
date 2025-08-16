---
layout: "@layouts/WritingLayout.astro"
---

# Framework Laptop Part 1

## Introduction

Last week I got to experience the withdrawl-like symptoms of exiting the Apple Ecosystem. It is worth noting that I have been using MacOS laptops for over ten years and I've been fully immersed in the Apple Ecosystem (iPhone, Macbooks, Airpods, iCloud and iMessage) for the last four years. Leaving this walled garden you loose the interoperability between devices. No integrated password manager, cross-device copy-paste, air-play and air-drop.

### Past attempts
Two attempts to switch to a Linux laptop have been made during the last decade. About five years ago (2020), I bought a [HP ENVY x360](https://support.hp.com/lv-en/document/c06692927) featuring a AMD Ryzen 5 4500U. A great laptop, I am sure, but at that time I assumed that Linux would just work out of the box - it did not. At least not with the latest version of Ubuntu at that time. I ended up having to manually upgrade the kernel. This is not a distribution that makes that easy to do. Still some pieces of the hardware did not work properly and I ended up returning it. The second attempt was a little more than a year ago (2024). I bought a refurbished Thinkpad T480s: a great laptop for Linux. I ended up returning that one as well because of the keyboard. They had replaced the original one with one of lower quality that caused me wrist pain.

Today my daily driver is a 2020 M1 Macbook Air running MacOS and NixDarwin. This is in my opinion probably the best laptop ever made. Nothing comes close, it has the battery life of Eliud Kipchoge and the performance of Usain Bolt. The ARM processor is super power efficient and does not produce much heat. This eliminates the need for a fan and it is therefore noiseless. The screen, keyboard and track pad are great. It has one big issue: it only runs MacOS well. Yes, I've tried running Asahi Linux a couple times, but the lack of an external display and the unreliability of a reverse engineered system does not work for me. 

## Framework 
Cut to present time, I got a Framework Laptop. When ordering it they estimated that it would take 2-3 weeks before it would even ship. You can understand how over the moon I was when it arrived just 3 days later. I literally placed the order on Tuesday evening and it arrived Friday morning. 

Here is the mandatory [`fastfetch`](https://github.com/fastfetch-cli/fastfetch) (read [`neofetch`](https://github.com/dylanaraps/neofetch)).
```
> nix shell nixpkgs#fastfetch --command fastfetch           
          ▗▄▄▄       ▗▄▄▄▄    ▄▄▄▖             nicolo@epsilon
          ▜███▙       ▜███▙  ▟███▛             --------------
           ▜███▙       ▜███▙▟███▛              OS: NixOS 25.11 (Xantusia) x86_64
            ▜███▙       ▜██████▛               Host: Laptop 13 (AMD Ryzen AI 300 Series) (A7)
     ▟█████████████████▙ ▜████▛     ▟▙         Kernel: Linux 6.16.0
    ▟███████████████████▙ ▜███▙    ▟██▙        Uptime: 1 hour, 42 mins
           ▄▄▄▄▖           ▜███▙  ▟███▛        Packages: 1204 (nix-system), 392 (nix-user)
          ▟███▛             ▜██▛ ▟███▛         Shell: zsh 5.9
         ▟███▛               ▜▛ ▟███▛          Display (BOE0BCA): 2256x1504 @ 60 Hz in 13" [Built-in]
▟███████████▛                  ▟██████████▙    DE: GNOME 48.3
▜██████████▛                  ▟███████████▛    WM: Mutter (Wayland)
      ▟███▛ ▟▙               ▟███▛             WM Theme: Adwaita
     ▟███▛ ▟██▙             ▟███▛              Theme: Adwaita [GTK2/3/4]
    ▟███▛  ▜███▙           ▝▀▀▀▀               Icons: Adwaita [GTK2/3/4]
    ▜██▛    ▜███▙ ▜██████████████████▛         Font: Adwaita Sans (11pt) [GTK2/3/4]
     ▜▛     ▟████▙ ▜████████████████▛          Cursor: Adwaita (24px)
           ▟██████▙       ▜███▙                Terminal: kitty 0.42.2
          ▟███▛▜███▙       ▜███▙               Terminal Font: DejaVuSansMono (14pt)
         ▟███▛  ▜███▙       ▜███▙              CPU: AMD Ryzen AI 7 350 (16) @ 2.00 GHz
         ▝▀▀▀    ▀▀▀▀▘       ▀▀▀▘              GPU: AMD Radeon 840M / 860M Graphics [Integrated]
                                               Memory: 4.79 GiB / 30.64 GiB (16%)
                                               Swap: 0 B / 33.69 GiB (0%)
                                               Disk (/): 104.54 GiB / 881.64 GiB (12%) - ext4
                                               Local IP (wlp192s0): 10.10.4.113/24
                                               Battery (FRANGWA): 71% (9 hours, 39 mins remaining) [Discharging]
                                               Locale: en_US.UTF-8
```

The hardware choices that were made were to balance battery life and performance. I've not read good things about the 2.8k display, and so I chose to go for the "normal resolution" one. The one I picked has lower latency, consumes less power and has better color reproduction. There is one downside though, it requires fractional scaling (more on that later...). The SSD was chosen because it had lower power consumption, while not sacrificing much performance. The difficult choice was between the two available AMD CPUs. Intel was not even considered due to how bad it compares to the CPUs from AMD, mostly in battery life and heat production. The choice was between the AI 300 and 7040 series AMD processors. The picture that I got when researching was that the 7040 series is a bit older and has better support. It also has a better GPU for gaming. While the AI 300's are newer and more efficient, resulting in better battery life. They also feature a powerful neural Processing Unit (NPU), that in the case of the CPU that I picked (AMD Ryzen AI 7 350) manages 50 trillon operations per second (TOPS). This is on par with an RTX 4080 (though comparing TOPS to FLOPS). For my use case, the AI 300 series CPU was the much better fit.

### The OS
(I use NixOS, btw)
Today, my Linux distribution of choice is NixOS, I run it on all my Linux machines. Although in the past, I've mostly run Debian based distributions: Debian, Raspian and Ubuntu. There was also a small stint with Arch Linux. NixOS' declarative nature resonates with me on a fundamental level. 

On my Macbook Air I've used NixDarwin for the last year and it has been great for the most part. The only issue is that it does not really feel like you are truly in control. It feels more like you are just allowed to customizing a small piece on top of an otherwise locked down machine. Maybe this is the price you have to pay for amazing battery life and things just working.

Setting up NixOS on the Framework was completely painless. Everything worked out of the box without any hacking. Luckily I had recently refactored my nixos-config so that all my devices were declared in one flake (read one entry point). Now I just run `nixos-rebuild switch --flake .` and Nix uses the `hostname` to decide what configuration to evaluate and switch to. 

This is what my `nixos-config` directory looks like:
```bash
> tree     
.
├── build.sh
├── flake.lock
├── flake.nix
├── home
│   ├── hosts
│   │   ├── beta.nix
│   │   ├── epsilon.nix # <-- The Framework laptop
│   │   ├── nixnas.nix
│   │   └── nixserv.nix
│   ├── platforms
│   │   ├── darwin.nix
│   │   └── linux.nix
│   └── suites
│       ├── common.nix
│       └── development.nix
├── hosts
│   ├── beta
│   │   └── configuration.nix
│   ├── epsilon # <-- The Framework laptop
│   │   ├── configuration.nix
│   │   └── hardware-configuration.nix
│   ├── nixnas
│   │   ├── configuration.nix
│   │   ├── hardware-configuration.nix
│   │   └── webservices.nix
│   └── nixserv
│       ├── colemak-se
│       ├── configuration.nix
│       └── hardware-configuration.nix
├── overlays
│   └── ollama.nix # My fork of ollama
└── README.md
```

According to `wc` I have a total of 1401 lines of nix code:
```bash 
> find . -name \*.nix | xargs wc -l | tail -n 1
    1401 total
```

## Impressions

The hardware has exceeded my expectations. Almost everything met my standards, except for the screen. I'll mention that last.

### Keyboard

For the keyboard I took some risk. Normally I use Nordic ISO keyboards with a custom Swedish Colemak layout. This time I went for Framework's second generation keyboard with the standard English layout. The reason for this is that it is supposed to be better for programming.  

The keys have a nice tactile feeling, but require a bit more pressure to actuate compared to a Macbook's. Comparing the two, I actually prefer the Framework's. Initially, I got thrown off by the swapped location of the `fn` and `ctrl`. The `ctrl` key was at the bottom left, which is the opposite of the layout on Macbooks. Luckily there was a convenient setting in the BIOS to swap them. 

### Trackpad
I was expecting the track pad to be terrible, as is Linux tradition. To my surprise, it is almost as good as my Macbook's. Not as good clicking experience, but you can use tap to click.

### Speakers
At first, I didn't think that the speakers were that bad, then I tried watching a video. I honestly thought that the presenter was having some microphone issues. They work, but I would not use them to listen to anything where I care about sound quality.

### Battery
The 61 watt hour battery is good. I've mostly used it plugged into my USB-C dock, but during the few sessions on battery it has held up alright. Dropping at a slow and steady rate. Charging it back up was crazy fast!
Now, it will never get close to a vertically integrated M-series Apple Macbook, but this is the price you pay for being able to run any OS.
My daily use of a laptop involves it mostly being connected to a dock. In order not to degrade the battery's health, I set a charge limit of 70% on the BIOS level. Great to see that you can do that manually, as compared to Apple's "smart" battery charge manager or third party apps like [AlDente](https://github.com/AppHouseKitchen/AlDente-Battery_Care_and_Monitoring).

### Primary memory
I went for 32GB of DDR5 RAM. From the `fastfetch` above you can see that I was only using 5 GB of the time of writing leaving 84% of it unused. The reason for all the RAM is to run local LLMs. Which worked well, but were still memory bandwidth limited.

### Secondary memory
I thought that the SSD was crazy fast.

```
> nix shell nixpkgs#fio --command fio --name=seq-test --ioengine=libaio --iodepth=1 --rw=readwrite --bs=1M --direct=1 --size=1G --numjobs=1 --runtime=60 --group_reporting --filename=/tmp/fio-seq-test
```

Returned raw drive performance of 1543 MB/s for sequential reads and 1643 MB/s for writes. When I first got into Linux I was excited for my new HDD that could read at 120 MB/s.

### Display
The display is a 13.5-inch 3:2 2256x1504 matte display. That comes out at 201 pixels per inch (PPI). Great PPI (in theory), on par with MacBooks' retina display. That is where the issues began.

Firstly, this PPI density makes everything look small at normal 1x scaling. Menu bars are super slim and text is only for ants. Going up to the next whole integer increment (2x), makes everything too big. Therefore, fractional scaling is required. I cannot speak for Windows, but on Mac, you do not even think about fractional scaling - everything just looks good. On Linux, it is a different story. Some apps respect fractional scaling and render correctly, some don't and end up blurry because the display manager renders them at one resolution and then scales them to the actual one.

Secondly, I believe that the display has too "punchy whites". Reading light text on a dark background was hard. To try to solve this I increased the color temperature of the display with the built in night light settings. That helped a little, but it still was hard to use for extended periods of time.

Lastly, the matte finish. Naturally, matte displays scatter the light a bit which makes characters appear slightly blurry. Together with the artifacts from fractional scaling, my eyes were strained after just a couple of hours of use. This made the built in display completely unusable.

When you install GNOME on NixOS by setting the settings below, you get a very minimal GNOME experience. To get nice sharp typography you have to configure some more things like anti-aliasing, hinting, and subpixel rendering.  

```nix
services.displayManager.gdm.enable = true;
services.desktopManager.gnome.enable = true;
```

I have probably spent over ten hours trying out different things. For example, using text-scaling instead of framebuffer-scaling, using newer GTK based apps, using Firefox instead of Chromium, passing flags to all electron-based apps like Slack and Spotify, and trying all types of incantations in order to get OpenGL-rendered apps like Kitty to render sharp text. Suffice to say that I wasted a lot of time.

Some sources suggested that KDE had better fractional scaling support than GNOME, so I replaced the two lines above with:

```nix
services.displayManager.sddm.enable = true;
services.displayManager.sddm.wayland.enable = true;
services.desktopManager.plasma6.enable = true;
```

This uninstalled GNOME and installed KDE. Unfortunately, KDE wasn't that much better and I ended up continuing my attempts on GNOME. 

To rule things out, I tried installing Fedora which is officially supported by Framework. I guess that things were as sharp as they could be. Nevertheless, the matte display still made the edges of characters a bit blurry and strained my eyes.

### Software
As mentioned earlier, setting up Nixos was really painless. All the hardware was discovered and just worked with the Linux kernel 6.16! 

Haven't been using Linux as a desktop/laptop since getting a job and I was pretty disappointed about the availability of the corporate applications (teams, outlook etc). 

For web browsing I decided to go with Firefox as it rendered text the best. However, coming from safari, I felt that the profiles management was lacking . In order not to mix personal and work accounts I use different browser profiles. In safari that is implemented at opening new windows from the existing window. This can easily be done with keyboard shortcuts. In firefox, you have to open a whole new instance from outside of the application. That was so annoying, that I had to create a bash alias (see below). Furthermore, when using a profile, you have no way of knowing which one you are using. The recommendation online was to "style" them differently...

```bash
ff() {
  nohup firefox -P "''${1:-default}" --no-remote &>/dev/null & disown
}
```

## Conclusion
This experience has been eye-opening. I have journeyed into the wilderness that is the Linux Laptop Ecosystem and returned enlightened. I've realized how much effort goes into making laptop hardware and the distributions of software and configuration that ship with them. I have deep respect for people that interface the infinitely messy physical reality with the pure world of logic and code. Laptops are just much more complex than desktops. The displays come at strange resolutions, power-management is way more important, hot swapping external displays needs to work well.

Although it is great to be able to customize every single aspect of you machine, it comes at a cost. While on MacOS everything is 85% perfect out of the box, you cannot get above 92% perfect. On Linux you are able to get things to 100% perfect, but for every percent above 80%, the effort required to reach the next percent is doubled.  

I have no problem with a platform where the software ecosystem isn't as polished and integrated. Heck, I had to self-host a password manager and set up DDNS and  HTTPS to leave the iCloud one. I do not even case if you need to do manual configuration, my 1.4k lines of nix code proves that. But the issue of fractional scaling isn't a completely solved one and perhaps the blurry text is also in part due to the matte finish. Either way, working so much with computers, my eye health is too important to risk.

