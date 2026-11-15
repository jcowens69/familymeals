# Family Table

Our family cookbook as a phone app. Everyone can search the recipes, rate meals, and vote on what they want this week. The cook sets the menu, logs what gets made, and the grocery list builds itself from the menu.

- No accounts needed: people get in with a **family code** and tap their name. People with Gmail can also **sign in with Google**.
- Installs to the home screen on iPhone and Android.
- Runs free on Cloudflare (Workers + a D1 database).

## Put it online (one time, about 10 minutes)

1. Make a free account at [dash.cloudflare.com](https://dash.cloudflare.com/sign-up).
2. In the dashboard, go to **Compute (Workers) → Workers & Pages → Create → Import a repository**.
3. Connect GitHub and pick **familymeals**. Leave the build settings as they are and deploy.
   The database is created for you on the first deploy.
4. When it finishes, open the `https://familymeals.<your-name>.workers.dev` address it shows.
5. The first visit asks you to set things up: your name (you're the cook), a cook PIN, the family code, and everyone's names.

Every push to the main branch redeploys the app automatically.

## Share it with the family

Send them the link and the family code. On their phone:

- **iPhone:** open the link in Safari → Share → **Add to Home Screen**.
- **Android:** open the link in Chrome → ⋮ menu → **Install app** (or Add to Home screen).

## Sign in with Google (optional)

Open the app as the cook, tap your name at the top right, and follow the steps under **Sign in with Google**. You'll need a free Google client ID, and you add each person's Gmail to their name in the same panel.

## Changing recipes

Recipes live in `public/recipes.json`, one entry per recipe.

## Run it on a computer

```
npm install
npm run dev
```
Then open http://localhost:8787.
