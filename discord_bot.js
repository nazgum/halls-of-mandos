import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import fs from 'fs/promises';
import path from 'path';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const DOMAIN = process.env.DOMAIN;
const URL = process.env.URL;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const cooldowns = new Map();
const COOLDOWN_SECONDS = 10;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 Megabytes

// define the /mandos command with a title string and a file attachment
const commands = [
    new SlashCommandBuilder()
        .setName('mandos')
        .setDescription('Chronicle a new battle in the Halls of Mandos')
        .addStringOption(option => 
            option.setName('title')
                  .setDescription('The name of this battle or event')
                  .setRequired(true)
        )
        .addAttachmentOption(option => 
            option.setName('log')
                  .setDescription('The .txt log file')
                  .setRequired(true)
        )
];

client.once('ready', async () => {
    console.log(`🤖 Halls of Mandos Bot online as ${client.user.tag}`);
    const rest = new REST({ version: '10' }).setToken(token);
    try {
        await rest.put(Routes.applicationCommands(clientId), { body: commands });
        console.log('Slash command /mandos registered.');
    } catch (error) {
        console.error('Failed to register commands:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand() || interaction.commandName !== 'mandos') return;

    const userId = interaction.user.id;
    const attachment = interaction.options.getAttachment('log');

    // cooldown limit for security
    if (cooldowns.has(userId)) {
        const expirationTime = cooldowns.get(userId) + (COOLDOWN_SECONDS * 1000);
        if (Date.now() < expirationTime) {
            const timeLeft = ((expirationTime - Date.now()) / 1000).toFixed(1);

            // reply ephemerally so only the spammer sees the warning
            return interaction.reply({ 
                content: `Please wait ${timeLeft}s before uploading another log.`, 
                ephemeral: true 
            });
        }
    }

    if (attachment.size > MAX_FILE_SIZE) {
        return interaction.reply({ 
            content: 'Log files must be under 2MB.', 
            ephemeral: true 
        });
    }

    // passed safety checks, acknowledge the command publicly
    await interaction.deferReply(); 

    // update the cooldown timestamp
    cooldowns.set(userId, Date.now());

    const title = interaction.options.getString('title');
    const uploader = interaction.user.username; // e.g., Nazgum

    // strictly enforce .txt files
    if (!attachment.name.endsWith('.txt')) {
        return interaction.editReply('We only accept `.txt` files, please try again.');
    }

    try {
        // sanitize the title into a safe base filename
        const baseName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        if (!baseName) {
            return interaction.editReply('Invalid title, use letters and numbers.');
        }

        // ensure unique filename in public/logs/
        const logsDir = path.join(process.cwd(), 'public', 'logs');
        await fs.mkdir(logsDir, { recursive: true });

        let fileName = `${baseName}.txt`;
        let filePath = path.join(logsDir, fileName);
        let counter = 1;

        while (true) {
            try {
                await fs.access(filePath);
                fileName = `${baseName}-${counter}.txt`;
                filePath = path.join(logsDir, fileName);
                counter++;
            } catch (e) {
                break; 
            }
        }

        // download and save the log file
        const response = await fetch(attachment.url);
        const text = await response.text();
        await fs.writeFile(filePath, text);

        const urlSlug = fileName.replace('.txt', '');
        const viewUrl = `${URL}/log/${urlSlug}`;
        
        const excitingMessage = `## ⚔️ The Halls of Mandos have expanded! ⚔️\n\n**${title}** - by **${uploader}**.\n${viewUrl}`;

        // grab the message for the discord url
        const postedMessage = await interaction.editReply(excitingMessage);

        // update logs.json with the new log
        const jsonPath = path.join(process.cwd(), 'logs.json');
        let logsData = [];
        
        try {
            const fileData = await fs.readFile(jsonPath, 'utf-8');
            logsData = JSON.parse(fileData);
        } catch (err) {
            // file doesn't exist yet, start fresh
        }

        const newEntry = {
            filename: fileName,
            title: title,
            author: uploader,
            views: 0,
            discord_url: postedMessage.url
        };
        
        logsData.push(newEntry);
        await fs.writeFile(jsonPath, JSON.stringify(logsData, null, 4));

    } catch (err) {
        console.error("Error processing log:", err);
        await interaction.editReply('An error occurred while etching your record into mandos.');
    }
});

// export to start from server.js
export function startBot() {
    if (!token || !clientId) {
        return console.warn("Missing Discord tokens in .env. Bot not started.");
    }
    client.login(token);
}