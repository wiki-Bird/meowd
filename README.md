</br>
<p align="center"><a href="https://meowd.ramiels.me/" target="_blank" rel="noreferrer noopener"><img width="170" alt="Logo" src="./images/logo1.png"></a></p>
<h2 align="center"> Meowd</h2>
<h3 align="center">Your powerful, customisable Discord bot. <br> 
Neep help? Check out <a href="https://meowd.ramiels.me/">meowd.ramiels.me</a>.</h3>

</br>

<!-- <h3 align="center"> 🏗️ Currently under development </h3> -->
<div align="center">
   <img src="https://github.com/wiki-Bird/meowd/actions/workflows/codeql.yml/badge.svg">
   <img src="https://github.com/wiki-Bird/meowd/actions/workflows/node.js.yml/badge.svg">
   <img src="https://github.com/wiki-Bird/meowd/actions/workflows/eslint.yml/badge.svg">
</div>


</br>

## 🤕 Issues:

#### If you've found an issue with the bot, please open an issue in the [issues tab](https://github.com/wiki-Bird/meowd/issues). 

</br>

## 🐱 Some Features:

#### For a full list, visit [meowd.ramiels.me/features](https://meowd.ramiels.me/features).

- Moderate your server with powerful moderation commands
- Keep your server running smoothly with community tools
- Have fun with your friends with commands
- Customise the bot to your liking with the config command


</br>

## ⌨️ Some Commands:

#### For a full list, and examples, visit [meowd.ramiels.me/commands](https://meowd.ramiels.me/commands).

- Moderation:
   - `/ban`, `/kick`, `/mute`, `/warn`
   - `/modlogs`, `/remove`
   - `/purge`
   - `/config`
- Utility:
   - `/poll`, `/report`, `/embed`, `/whois`
   - `/help`
- Fun:
   - `/otter`, `/imgedit`
   - `/stats <overwatch>`
   - `starboard`


</br>

## 💡 Features being worked on:

#### For a full list, visit [projects](https://github.com/users/wiki-Bird/projects/4).

- [x] Timezone conversion
- [x] Starboard
- [x] Funny font
- [ ] Website guide
- [ ] Banned words/websites
- [ ] Whitelisted websites
- [ ] System logging

</br>

## 🛠️ Build/run:

Install node.js v16.15.1, typescript, and yarn;

- Update `config[TEMPLATE].json` and remove [TEMPLATE] from the name
- Generate a [Firebase admin SDK](https://console.firebase.google.com/u/3/project/_/settings/serviceaccounts/adminsdk) and move it into root
  - Update the line `const serviceAccount = require("../firebaseSDKhere.json");` in `index.ts` to point to this file
- Update `databaseURL: ""` in `index.ts` to your Firebase DB URL
---
1. `yarn install`
2. `yarn build`
3. `node build/index.js`

</br>

## 🌐 Website Repository:

<a href="https://github.com/wiki-Bird/meowd-site" target="_blank" rel="noreferrer noopener"><img width="170" alt="Logo" src="./images/meowdReacts/point.png"></a> <b>View the Meowd website repository [here](https://github.com/wiki-Bird/meowd-site) </b>