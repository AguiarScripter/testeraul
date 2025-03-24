
const { 
    Client, 
    GatewayIntentBits,
    REST,
    Routes,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    ActivityType
} = require('discord.js');
const { authenticator } = require('otplib');
const { loadEmbed } = require('./src/embed');
const config = require('./config.json'); // Importa as configurações do arquivo JSON

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// Função para definir o status do bot
function setBotStatus(client) {
    client.user.setPresence({
        status: 'dnd', // Define como "Não Perturbe"
        activities: [{ name: 'GOAT STORE', type: ActivityType.Playing }]
    });
}

const commands = [{
    name: 'set2fa',
    description: 'Configure 2FA authentication'
}];

client.once('ready', async () => {
    console.log('Bot online!');

    // Define o status do bot
    setBotStatus(client);

    // Garante que a aplicação está carregada antes de registrar os comandos
    if (!client.application) {
        await client.application.fetch();
    }

    const rest = new REST({ version: '10' }).setToken(config.token);
    try {
        await rest.put(
            Routes.applicationCommands(client.application.id),
            { body: commands }
        );
        console.log('Comandos registrados!');
    } catch (error) {
        console.error('Erro ao registrar comandos:', error);
    }
});

client.on('interactionCreate', async interaction => {
    try {
        // Comando para abrir o modal do ID do canal
        if (interaction.isCommand() && interaction.commandName === 'set2fa') {
            if (interaction.user.id !== config.allowedUserId) {
                return interaction.reply({ 
                    content: '❌ Você não tem permissão para usar este comando.', 
                    ephemeral: true 
                });
            }

            const modal = new ModalBuilder()
                .setCustomId('channel_modal')
                .setTitle('Configurar Canal')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('channelId')
                            .setLabel('Digite o ID do canal')
                            .setPlaceholder('Ex: 1234567890')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    )
                );

            await interaction.showModal(modal);
        }

        // Captura a resposta do modal de canal
        if (interaction.isModalSubmit() && interaction.customId === 'channel_modal') {
            const channelId = interaction.fields.getTextInputValue('channelId');

            // Tenta pegar o canal
            const channel = await client.channels.fetch(channelId).catch(() => null);
            if (!channel) {
                return interaction.reply({ 
                    content: '❌ Canal não encontrado. Verifique o ID e tente novamente.', 
                    ephemeral: true 
                });
            }

            const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('open_2fa_modal')
                        .setLabel('2FA')
                        .setStyle(ButtonStyle.Secondary) // Cinza
                        .setEmoji('1344918240932925541') // Adicionando o emoji
                );

            const embedData = await loadEmbed();

            // Envia no canal especificado
            await channel.send({
                ...embedData,
                components: [button]
            });

            // Confirma para o usuário (apenas ele vê)
            await interaction.reply({ 
                content: `✅ Comando executado com sucesso no canal **${channel.name}**!`,
                ephemeral: true 
            });
        }

        // Quando o botão "2FA" for clicado
        if (interaction.isButton() && interaction.customId === 'open_2fa_modal') {
            const modal = new ModalBuilder()
                .setCustomId('2fa_modal')
                .setTitle('Insira a chave secreta 2FA')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('secretKey')
                            .setLabel('Chave secreta 2FA')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    )
                );

            await interaction.showModal(modal);
        }

        // Captura a resposta do modal de 2FA
        if (interaction.isModalSubmit() && interaction.customId === '2fa_modal') {
            await interaction.deferReply({ ephemeral: true });

            const secretKey = interaction.fields.getTextInputValue('secretKey');
            
            try {
                const token = authenticator.generate(secretKey);
                
                const embed = new EmbedBuilder()
                    .setColor('#f1f2f2')
                    .setTitle('Seu Código 2FA')
                    .setDescription('```' + token + '```');

                await interaction.editReply({ 
                    embeds: [embed],
                    ephemeral: true
                });
                
                setTimeout(() => {
                    interaction.deleteReply().catch(console.error);
                }, 60000);

            } catch (error) {
                console.error('Erro ao gerar 2FA:', error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#f1f2f2')
                    .setTitle('Erro')
                    .setDescription('Erro ao gerar o código 2FA. Tente novamente.');
                
                await interaction.editReply({ 
                    embeds: [errorEmbed],
                    ephemeral: true
                });
            }
        }

    } catch (error) {
        console.error('Erro na interação:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ 
                content: '❌ Algo deu errado. Tente novamente.', 
                ephemeral: true 
            });
        }
    }
});

client.login(config.token);
