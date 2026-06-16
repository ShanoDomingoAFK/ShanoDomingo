# PesoTrack — Setup Guide (for total beginners)

Everything in this folder is ready to go. There's only **ONE thing you need
to do yourself**: create a free Firebase account so your data can sync
across devices. This takes about 3 minutes.

---

## ✅ Already done for you
- The full app (`src/App.jsx`)
- Cloud sync wiring (loads/saves your data automatically)
- Project setup files (`package.json`, `vite.config.js`, `index.html`, `src/main.jsx`)

## ⏳ The ONE thing you need to do: Firebase setup

### Step 1 — Create a Firebase project
1. Go to **console.firebase.google.com** (in Safari)
2. Sign in with any Google account
3. Tap **"Add project"**
4. Type any name (e.g. `pesotrack`) → tap **Continue**
5. Turn OFF Google Analytics (toggle) → tap **Create project**
6. Wait ~30 seconds → tap **Continue**

### Step 2 — Turn on the database
1. On the left sidebar, tap **Build** → **Firestore Database**
2. Tap **"Create database"**
3. Pick location: choose one starting with **asia-southeast** (closest to PH)
4. Tap **Next**
5. Choose **"Start in test mode"** → tap **Create**

### Step 3 — Get your config keys
1. Tap the **gear icon ⚙️** (top left, next to "Project Overview") → **Project settings**
2. Scroll down to **"Your apps"**
3. Tap the **`</>`** icon (this means "Web app")
4. Type any nickname (e.g. `pesotrack-web`) → tap **"Register app"**
5. You'll now see a code block that looks like this:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...........................",
  authDomain: "pesotrack-xxxxx.firebaseapp.com",
  projectId: "pesotrack-xxxxx",
  storageBucket: "pesotrack-xxxxx.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
```

6. **Copy this entire block** (just the part inside the `{ }`)

### Step 4 — Paste it into your project
1. Open the file **`src/firebase.js`** (it's in this folder)
2. Find this section near the top:

```js
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID",
};
```

3. **Delete it** and **paste your real config** from Step 3 in its place
4. A little further down, find this line:

```js
export const HOUSEHOLD_ID = "change-me-to-something-unique";
```

5. Change `"change-me-to-something-unique"` to any private word/phrase only
   you and your partner know — e.g. `"juandelacruz-2025"`. This keeps your
   data separate from anyone else who might use this same code.
6. Save the file.

### Step 5 — Upload to GitHub
Go to your `pesotrack` repo on github.com and update these 3 files
(use **Add file → Upload files**, and tick "Replace" if it offers):

| File in this folder | Goes to this path in GitHub |
|---|---|
| `package.json` | `package.json` (overwrite existing) |
| `src/firebase.js` | `src/firebase.js` (new file) |
| `src/App.jsx` | `src/App.jsx` (overwrite existing) |

Commit the changes.

### Step 6 — Wait for Vercel
Vercel automatically rebuilds your site (~1 minute) after you commit.
Open your site's URL on Safari and on another device — both should now
show **"🟢 Synced across devices"** at the bottom-left of the sidebar.

---

## 🔒 A note on privacy
"Test mode" Firestore is open to anyone who has your config + HOUSEHOLD_ID
for 30 days. For a personal finance app this is generally fine as long as
you don't share your config publicly — but if you want it locked down
permanently, come back and ask for "Firestore security rules" and it can
be tightened in under a minute.

## ❓ If something breaks
Copy the exact error message from Vercel's "Build Logs" and bring it back
here — that's usually enough to fix in one go.
