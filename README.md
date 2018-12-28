# party-peer

## Prerequisite

### Run `yarn install`
This is will pull in all dependencies required for the project.

### Setup a Firebase Project
1. Go to [firebase.google.com](https://firebase.google.com) and create a new project.
2. Select Firestore and create the database under the newly created project.
3. Open your terminal, run `firebase init`
4. Select your project, and choose hosting & firestore.
5. Done!

### yarn scripts

#### `yarn test`
Before you run the tests, it's recommended you create a separate firebase project.

These test will be refactored to use mocking library in future.

add a `firebase.env.json` under project root with firebase configurations:
```json
{
    "testing": {
        "apiKey": "...",
        "authDomain": "...",
        "databaseURL": "...",
        "projectId": "...",
        "storageBucket": "...",
        "messagingSenderId": "..."
    },
    "production": {}
}

```

#### `yarn build`
Generate javascript build from the typescript source.
