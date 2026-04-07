# 🐾 Pupular v2 — Swipe to Adopt

Beautiful, addicting swipe-based pet adoption app powered by **RescueGroups.org API v5**.

---

## 🚀 Getting Started

### 1. Install
```bash
npm install
```

### 2. Add your RescueGroups API Key
Edit `src/services/rescueGroupsApi.js`:
```js
export const API_KEY = 'YOUR_RESCUEGROUPS_API_KEY';
```

**Get a free key at:** https://rescuegroups.org/services/adoptable-pet-data-api/
(Fill out the form — usually approved within 1 business day)

### 3. Run
```bash
npx expo start
# Press i for iOS simulator
# Scan QR code with Expo Go app on your phone
```

---

## 🔑 RescueGroups API v5

**Base URL:** `https://api.rescuegroups.org/v5`

**Authentication:** API key in `Authorization` header
```
Authorization: YOUR_API_KEY
Content-Type: application/vnd.api+json
```

**Key endpoint used:**
```
POST /public/animals/search/available,haspic,dogs/?page=1&limit=25&sort=random&include=pictures,species,breeds,orgs,locations
```
With body:
```json
{
  "data": {
    "filterRadius": {
      "postalcode": "90210",
      "miles": 100
    }
  }
}
```

---

## 📱 iOS App Store Submission

### Prerequisites
- Apple Developer account ($99/yr) — https://developer.apple.com
- Expo account — https://expo.dev
- EAS CLI: `npm install -g eas-cli`

### Steps
```bash
# 1. Login
eas login

# 2. Configure (first time only)
eas build:configure

# 3. Update eas.json with your Apple credentials

# 4. Build
eas build --platform ios --profile production

# 5. Submit
eas submit --platform ios
```

---

## 🗂 Project Structure

```
pupular/
├── App.js                            # Root + custom tab bar
├── app.json                          # Expo config
├── eas.json                          # Build & submit config
├── package.json
└── src/
    ├── constants/theme.js            # Design system: colors, shadows, radii
    ├── context/AppContext.js         # Animals + User state
    ├── services/rescueGroupsApi.js   # 🔑 RescueGroups v5 API
    ├── screens/
    │   ├── OnboardingScreen.js       # Animated 4-step onboarding
    │   ├── SwipeScreen.js            # Card swipe with pan gestures
    │   ├── LikesScreen.js            # Grid of liked pets
    │   ├── PetDetailScreen.js        # Full profile modal
    │   └── ProfileScreen.js          # Stats + settings
    └── components/
        └── FilterSheet.js            # Bottom sheet filter
```

---

## ✨ Features

- 🐾 **Swipe cards** — PanResponder gestures, spring animations
- 💚 **Like / ✕ Pass / ⭐ Super Like** — with haptic feedback
- 🔥 **Streak counter** — rewarding engagement  
- 📍 **Location-based** — pets within 100 miles of your ZIP
- 🔍 **Filters** — species, age, size, sex
- ❤️ **Likes grid** — save and revisit your favorites
- 📱 **Pet detail** — photo gallery, traits, compatibility, shelter contact

---

## 📋 App Store Checklist

- [ ] `assets/icon.png` — 1024×1024px (no transparency)
- [ ] `assets/splash.png` — splash screen
- [ ] Screenshots for 6.7", 6.5", 5.5" iPhone displays
- [ ] Privacy Policy URL
- [ ] App description & keywords (see suggestions below)
- [ ] Age rating: 4+

### Suggested Description
> Pupular makes finding your forever pet as easy and fun as swiping. Browse thousands of rescue dogs, cats, rabbits, and more near you. Swipe right to like, left to pass — each swipe brings a homeless pet one step closer to finding their family. Powered by RescueGroups.org.

### Keywords
adoption, pets, dogs, cats, rescue, shelter, swipe, animals, adopt

---

Made with ❤️ for every pet waiting for a home 🐾
