const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');

//puxando as informações dotenv
const dotenv = require('dotenv');
dotenv.config();
const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

//importação dos comandos
const fs = require('node:fs');
const path = require('node:path');

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith('.js'));

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `Esse comando possui em ${filePath} "data" ou "execute" ausentes`
    );
  }
}

//login do bot
client.once(Events.ClientReady, c => {
  console.log(`Ready! Logado como ${c.user.tag}`);
});

client.login(TOKEN);

//listener de interações
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    console.error('comando não encontrado');
    return;
  }
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply('houve um erro ao executar esse comando!');
  }
});
