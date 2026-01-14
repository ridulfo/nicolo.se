---
layout: "@layouts/WritingLayout.astro"
---

# Framework Laptop Part 2

Five months in and I haven't looked back!

The number of edits to my NixOS configuration files has gone from a few per day to maybe once a week on average. I have settled into a sweet spot.

## Addressing concerns
In [Framework Laptop Part 1](/writing/2025-08-16-framework-laptop.html) I raised a number of concerns. I'll start by addressing these concerns.

### Blurry display
My biggest pain point with my Framework laptop was the blurriness of the display. This was completely due to fractional scaling. The pixel density and the screen size just did not work well.
This wasn't a global problem, most applications rendered text all right. However, some texts, borders and lines would be blurry and it messed with my eyes. Trying to focus on something that actually was blurry is a sure way to get headaches.

The simple solution was to get the [2.8K display](https://frame.work/se/en/products/display-kit?v=FRANJF0001) from Framework. This allowed the scaling to be increased by a whole integer amount (200%). Now everything looks even better than with the original display! This display also comes with a higher refresh rate, which is a nice bonus. It makes scrolling text look buttery smooth.

[Notebook Check](https://www.notebookcheck.net/Framework-Laptop-13-5-Core-Ultra-7-review-New-2-8K-120-Hz-display-with-Arc-8-graphics.874187.0.html) mentioned that the color reproduction of this display skewed more to the colder side. Luckily, they also provided a calibration file that I simply applied. [Link to the calibration file](https://www.notebookcheck.net/uploads/tx_nbc2/BOE0CB4.icm)

This had an impact on battery life. Exactly how much it affected it is hard to say. On a full charge doing light development work (terminal, LSP, Firefox), it still reports 9-10 hours of battery life. But this does depend a lot on what you are running on the machine and the screen brightness. The screen brightness alone can account for 50% of the wattage.
Frankly, we are talking about a laptop running Linux. The battery life will never be great. 

### Speakers, microphone and camera
The speakers are still not great - there is only so much speaker calibration can do. Honestly, I use the laptop mostly for writing code and reading text, so it does not bother me that much. However, if you care about speakers, microphone and camera quality you'll need to either get dedicated peripherals or an Apple laptop.

### Wifi
My laptop came with the MEDIATEK MT7925 Wi-Fi 7 wireless LAN card. There have been some issues with the reliability of the wireless connection that I did not notice until I started using it at the office. I am not the only one having issues.

When I change rooms in the office quickly, it can take a minute or so for it to change access points. This is definitely a problem when you rush to a meeting room and connect to a call. One manual work around I have found is to reconnect to the WiFi (no need to turn the WiFi on and off).


## Looking forward
My M1 MacBook Air was probably the best laptop I have had and probably will ever have from a "everything just works" point of view. **However, in terms of customizability and control, my Framework laptop running Linux is without a doubt the best laptop I have ever had.** The ability to easily change out components whenever I want is such a refreshing feeling that I think most people (including myself) have forgotten. It is absurd that we should throw out an otherwise perfectly working laptop because it needs more RAM, has too little storage, some keys on the keyboard stopped working or that the latest OS version makes the laptop slow.
I would like to add that customizability and control is not unique to Framework laptops, they are far from the inventors of it. Enterprise laptops have done this for decades. What the Framework company has succeeded in doing is making that accessible for everyone. Personally, I find that getting spare components for other laptops feels like a treasure hunt where success is not guaranteed. If we take Lenovo's spare parts portal as an example, it does not make sense to me. Neither does going on auction websites to get components that you direly need. People also warn each other about different sub-vendors' varying quality.
Framework makes it easy and reliable.

### The OS
For me personally, NixOS is the best Linux distribution. It is just a no-brainer. You wouldn't manage your cloud infrastructure without IaC; why wouldn't you do the same with your machine?
It is not an all or nothing thing either. Should you want to, you can configure things outside of NixOS in exactly the same way as in normal distributions. For example, in GNOME, the only things that I configure using Nix are the most fundamental things like my keyboard layouts, my CAPS LOCK mapping to act as ESC, and my ALT+TAB configuration to switch between windows. For more mundane things like connecting to WiFi or changing wallpaper I just do it manually in the GUI; although you could do it with code if you wanted to.

### Bonus: optimizing battery life 
I have done a bunch of research on how to optimize the battery life for Linux on this machine and have come up with the following configurations.

```nix
# Power optimizations
boot.kernelParams = [
  # AMD P-state configuration
  "amd_pstate=active" # Enable AMD P-state EPP driver
  "amd_prefcore=enable" # Enable preferred core support

  # AMD graphics optimization
  "amdgpu.runpm=-1" # Auto GPU runtime power management
  "amdgpu.ppfeaturemask=0xffffbfff" # Enable all PowerPlay features except overdrive
  "amdgpu.dcfeaturemask=0xB" # Enable PSR and display power features
  "amdgpu.abmlevel=3" # Adaptive backlight management

  # Storage power management
  "pcie_aspm.policy=powersupersave"

  # System-wide optimizations
  "nmi_watchdog=0" # Disable NMI watchdog

  # Audio power management
  "snd_hda_intel.power_save=10" # Audio power save timeout
];

# Power management services
services.power-profiles-daemon.enable = true;
services.tlp.enable = false; # Explicitly disable to prevent conflicts
services.auto-cpufreq.enable = false;

# Power management settings
powerManagement = {
  enable = true;
  cpuFreqGovernor = "schedutil"; # Best with AMD P-state
};
```
