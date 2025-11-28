# Sports Task Coach API

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```
PORT=4000
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=final_lab_pwa
SESSION_SECRET=change_me
SESSION_COOKIE_NAME=sid
SESSION_MAX_AGE_MS=604800000
SESSION_TTL_SECONDS=604800
BCRYPT_SALT_ROUNDS=10
CLIENT_ORIGIN=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Scripts

- `npm run dev` – start the development server with Nodemon
- `npm start` – start the production server

Make sure MongoDB is running locally or adjust the URI to a hosted cluster.
