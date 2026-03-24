# Elite Trainer

A browser-based controller for the **Elite Suito Pro** indoor cycling trainer. Connect your trainer, a heart rate monitor, and your Strava account — then ride and let it handle the rest.

## Features

- **Live metrics** — power (W), cadence (RPM), speed (km/h), and heart rate (BPM) streamed directly from your devices
- **ERG mode** — set a target wattage and the trainer holds it automatically
- **Resistance mode** — manually set resistance level (1–20)
- **Workout programs** — build interval sessions with custom steps (duration + target power), with automatic step transitions
- **Heart rate monitor** — connect any Bluetooth heart rate device (Garmin watch, chest strap, etc.)
- **Post-workout summary** — duration, avg/max power, avg cadence, distance, calories, and heart rate stats
- **Strava auto-upload** — connects once, then uploads every workout automatically as a Virtual Ride with full power and heart rate data

---

## Requirements

### Hardware
- **Elite Suito Pro** trainer (or any FTMS-compatible smart trainer)
- A Bluetooth heart rate monitor (optional)
  - Tested with: Garmin Forerunner 255
  - Any device that supports the standard Bluetooth Heart Rate Profile will work

### Browser
- **Google Chrome** or **Microsoft Edge** — version 56 or later
- Web Bluetooth is **not supported** in Firefox, Safari, or mobile browsers

### Software
- [Node.js](https://nodejs.org) v18 or later
- npm (comes with Node.js)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/elite-trainer.git
cd elite-trainer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in Chrome or Edge.

### 4. Build for production (optional)

```bash
npm run build
```

The output is in the `dist/` folder and can be served by any static file host (Netlify, Vercel, GitHub Pages, nginx, etc.).

---

## Usage

### Connecting your trainer

1. Make sure your Elite Suito Pro is powered on
2. Click **Connect Trainer** in the top-right corner
3. Select your trainer from the browser popup and click **Connect**
4. The status dot turns green — live metrics will start streaming immediately

> **Note:** Make sure no other app (Zwift, TrainerRoad, etc.) is connected to the trainer. Only one BLE controller can hold the trainer at a time.

### Connecting a heart rate monitor

1. **On your Garmin watch:** start an activity and enable heart rate broadcasting from within that activity — most Garmin models only broadcast HR during an active workout. Search *"Garmin [your model] broadcast heart rate"* for the exact steps on your firmware version.
2. Click **Connect Heart Rate Monitor** in the header
3. Select your device from the browser popup
4. A pulsing red dot and live BPM will appear in the header

Any Bluetooth HRM that follows the standard BLE Heart Rate Profile will work — Garmin watches, Polar, Wahoo TICKR, etc.

### Manual control

1. Connect your trainer
2. Select the **Manual** tab
3. Choose **ERG (Power)** or **Resistance** mode and set your target
4. Click **Apply** to send the target to the trainer
5. Click **Start** to begin the session, **Stop** to end it

A workout summary will appear when you stop.

### Running a workout program

1. Connect your trainer
2. Select the **Program** tab
3. Edit the steps — each step has a label, duration (minutes), and target power (watts)
4. Click **Start Workout** — the trainer steps through each interval automatically
5. Click **Stop Workout** to end early, or let it finish on its own

A workout summary appears when the session ends. If Strava is connected, the upload starts automatically.

### Setting up Strava

You only need to do this once.

1. Go to [strava.com/settings/api](https://www.strava.com/settings/api) and create an application:
   - **Application Name:** anything you like (e.g. *Elite Trainer*)
   - **Website:** `http://localhost:5173` (or your deployment URL)
   - **Authorization Callback Domain:** `localhost` (or your deployment domain, without `http://`)
2. Copy your **Client ID** and **Client Secret**
3. In the app, click **Connect Strava** in the header
4. Paste your Client ID and Client Secret, then click **Authorize**
5. Strava will ask you to approve access — confirm and you'll be returned to the app

After that, every workout uploads automatically when you stop. The summary screen shows a direct link to the activity on Strava.

> **Privacy:** your Client ID, Client Secret, and Strava tokens are stored only in your browser's `localStorage` and are never sent anywhere except directly to Strava's own servers.

---

## Tech stack

| | |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Trainer protocol | Bluetooth FTMS (Fitness Machine Service, 0x1826) |
| Heart rate protocol | Bluetooth Heart Rate Profile (0x180d) |
| Strava | OAuth 2.0 + TCX file upload via Strava API v3 |

---

## Troubleshooting

**"Web Bluetooth is not supported in this browser"**
Switch to Chrome or Edge on desktop. Firefox and Safari do not support Web Bluetooth.

**Trainer not appearing in the device picker**
- Confirm the trainer is powered on and no other app is connected to it
- On Linux, make sure the Bluetooth service is running: `sudo systemctl start bluetooth`
- In Chrome, try enabling `chrome://flags/#enable-experimental-web-platform-features`

**Resistance / power not changing**
Make sure you press **Apply** first to set the target, then **Start** to engage the trainer. The trainer won't respond to control commands until a session is started.

**Heart rate monitor not found**
- Start an activity on your watch before searching — Garmin devices only broadcast HR during an active workout
- Confirm no other app or device is already connected to the watch over Bluetooth

**Strava upload fails**
- Double-check that the Authorization Callback Domain in your Strava API settings matches your app's hostname exactly (e.g. `localhost`, no port, no `http://`)
- Use the **↓ Download TCX** button in the summary screen as a fallback to upload the file to Strava manually

---

## License

MIT
