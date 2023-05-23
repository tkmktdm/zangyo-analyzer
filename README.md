# zangyo-analyzer

<p align="center">
    <img alt="Logo" src="images/zangyo.png" height="240" />
  <p align="center">just a joke bot</p>
  <p align="center">
    <a href="https://hub.docker.com/r/4nm1tsu/zangyo-analyzer/tags"><img alt="Docker Hub" src="http://dockeri.co/image/4nm1tsu/zangyo-analyzer"></a>
  </p>
</p>

## Features

- Visualize Zangyo rates.
- Ranking the number of Zangyo.
- Periodic notification batches.

## Commands

> **Warning**
> Specifications are subject to change in the future.

- `visualize`
  - pie chart
  - radar chart
  - bar chart

## Setup

1. Copy example config files.
   - Navigate to the `config` folder of this project.
2. Obtain a bot token.
   - You'll need to create a new bot in your [Discord Developer Portal](https://discord.com/developers/applications/).
     - See [here](https://www.writebots.com/discord-bot-token/) for detailed instructions.
     - At the end you should have a **bot token**.
3. Modify the config file.
   - Open the `config/config.json` file.
   - You'll need to edit the following values:
     - `client.id` - Your discord bot's [user ID](https://techswift.org/2020/04/22/how-to-find-your-user-id-on-discord/).
     - `client.token` - Your discord bot's token.
4. Install packages.
   - Navigate into the downloaded source files and type `npm install`.
5. Register commands.
   - In order to use slash commands, they first [have to be registered](https://discordjs.guide/creating-your-bot/command-deployment.html).
   - Type `npm run commands:register` to register the bot's commands.
     - Run this script any time you change a command name, structure, or add/remove commands.
     - This is so Discord knows what your commands look like.
     - It may take up to an hour for command changes to appear.

## Start Scripts

You can run the bot in multiple modes:

1. Normal Mode
   - Type `npm start`.
   - Starts a single instance of the bot.
2. Manager Mode
   - Type `npm run start:manager`.
   - Starts a shard manager which will spawn multiple bot shards.
3. PM2 Mode
   - Type `npm run start:pm2`.
   - Similar to Manager Mode but uses [PM2](https://pm2.keymetrics.io/) to manage processes.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)
