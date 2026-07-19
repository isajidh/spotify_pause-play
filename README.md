# Spotify Web Player 2-Minute Song Delay Automation

A Tampermonkey userscript that automatically pauses every new song in the **Spotify Web Player** for a configurable amount of time before resuming playback.

The script is designed for users who want an automatic silent gap between shuffled tracks without modifying playlists, queues, or using the Spotify desktop application.

---

## Features

### Core Features

* Automatically detects when Spotify starts a new track.
* Immediately pauses the new track.
* Waits for a configurable delay period.
* Automatically resumes playback.
* Repeats continuously while Spotify Shuffle mode is active.

### Current Features

✅ Works with Spotify Web Player
✅ No playlist or queue modifications
✅ No Spotify API usage required
✅ No desktop application required
✅ Runs directly inside the browser
✅ Compatible with Microsoft Edge + Tampermonkey
✅ Supports manual track skipping
✅ Restarts the delay timer when a new track is selected
✅ Lightweight browser-only automation

---

## How It Works

Spotify Web Player automatically starts the next shuffled track when the previous song ends.

The userscript monitors the currently playing track:

```
Song A finishes

        ↓

Spotify starts Song B

        ↓

Script detects Song B

        ↓

Pause playback

        ↓

Wait 120 seconds

        ↓

Resume Song B

        ↓

Wait for Song C

        ↓

Repeat
```

The script does not control Spotify's queue or shuffle algorithm. It only controls playback timing.

---

# Requirements

## Browser

Supported browsers:

* Microsoft Edge
* Google Chrome
* Chromium-based browsers

## Extension

Install:

Tampermonkey

https://www.tampermonkey.net/

## Spotify

Required:

* Spotify account
* Spotify Web Player
* Playback started in the browser

Open:

https://open.spotify.com

---

# Installation

## 1. Install Tampermonkey

Install the Tampermonkey browser extension.

After installation, confirm the Tampermonkey icon appears in your browser toolbar.

---

## 2. Create the Userscript

1. Click the Tampermonkey icon.
2. Select:

```
Create a new script
```

3. Remove the default template.
4. Paste the complete Spotify Delay userscript.
5. Save the script.

---

## 3. Start Spotify

1. Open:

```
https://open.spotify.com
```

2. Log in.
3. Start playing music.
4. Enable Shuffle mode.

The automation will begin automatically.

---

# User Interface

The script provides a small control panel:

```
+----------------------+
| 🎵 Spotify Delay     |
|                      |
| Status: Monitoring   |
| Resume: --           |
|                      |
| [Disable]            |
+----------------------+
```

During a delay:

```
+----------------------+
| 🎵 Spotify Delay     |
|                      |
| Status: Paused       |
| Resume: 01:42        |
|                      |
| [Disable]            |
+----------------------+
```

---

# Controls

## Enable / Disable

The button allows temporarily disabling automation.

When disabled:

* Existing timers are cancelled.
* Spotify playback is not controlled.
* The script remains installed.

---

## Dragging the Panel

The status panel can be moved:

1. Click and hold the panel title.
2. Drag it anywhere on the Spotify page.
3. The position is saved automatically.

---

# Configuration

The script contains a configuration section:

```javascript
const CONFIG = {

    pauseDurationSeconds: 120,

    fallbackIntervalMs: 1000,

    showPanel: true,

    logging: true

};
```

---

## Change Delay Duration

Example:

### 2 minutes

```javascript
pauseDurationSeconds: 120
```

### 5 minutes

```javascript
pauseDurationSeconds: 300
```

### 30 seconds

```javascript
pauseDurationSeconds: 30
```

---

# Technical Details

## Track Detection

The script uses Spotify's DOM attributes:

```html
data-testid="context-item-info-title"
```

to identify the current track.

---

## Playback Control

The Play/Pause button is controlled through:

```html
data-testid="control-button-playpause"
```

The script checks the button state:

```
aria-label="Pause"
```

means playback is active.

```
aria-label="Play"
```

means playback is paused.

---

## Detection Method

Primary method:

```
MutationObserver
```

This reacts when Spotify updates the page.

Fallback method:

```
Periodic checking
```

This improves reliability if Spotify changes how the page updates.

---

# Manual Track Changes

The script uses the following behavior:

## Option 1: Restart Timer

Example:

```
Song B paused

01:10 remaining

User clicks Next

Song C starts

Song C pauses

Timer resets to 02:00
```

This keeps every song consistent.

---

# Troubleshooting

## Script does not start

Check:

1. Tampermonkey is enabled.
2. The script is enabled.
3. Spotify URL is:

```
https://open.spotify.com/*
```

4. Refresh the Spotify page.

---

## Music does not pause

Open browser developer tools:

```
F12 → Console
```

Look for:

```
Spotify Delay:
```

messages.

If no messages appear:

* Confirm the userscript is running.
* Refresh Spotify.

---

## Spotify Updates Break the Script

Spotify occasionally changes its Web Player HTML structure.

If selectors stop working, update:

```javascript
data-testid="context-item-info-title"
```

or:

```javascript
data-testid="control-button-playpause"
```

inside the script.

---

# Limitations

* Spotify Web Player UI changes may require selector updates.
* The next track may play for a fraction of a second before pausing.
* Browser sleep or computer sleep may interrupt timers.
* Spotify must remain open.

---

# Privacy

The script:

* Does not collect data.
* Does not send information anywhere.
* Does not modify Spotify accounts.
* Does not access playlists.
* Does not use external services.

All processing happens locally in your browser.

---

# Project Goal

Provide a simple browser-based solution for creating automatic silent gaps between Spotify tracks while preserving:

* Spotify Shuffle behavior
* Existing playlists
* Existing queues
* Normal Spotify playback controls

---

# License

Free to use and modify for personal purposes.
