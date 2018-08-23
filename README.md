# webjetAPITest

This node.js app was developed for a test.

## Functional Requirements

- Connect to the 2 APIs which point to 2 popular movie databases, cinemaworld and filmworld
  * /api/{cinemaworld or filmworld}/movies : This returns the movies that are available
  * /api/{cinemaworld or filmworld}/movie/{ID}: This returns the details of a single movie
- Build a web app to allow customers to get the cheapest price for movies from these two providers

## Steps for the setup

Clone the repo and install the dependencies.

```bash
git clone https://github.com/rastoginimit/webjetAPITest.git
cd webjetAPITest
```

```bash
npm install
```

Start the express server, run the following

```bash
node server.js
```

Open [http://localhost:3100] and take a look around.
