const fs = require('fs').promises;
const { EmbedBuilder } = require('discord.js');

// Função para converter cor hex para decimal
function hexToDecimal(hex) {
    return parseInt(hex.replace('#', ''), 16);
}

// Função para carregar e processar a embed
async function loadEmbed() {
    try {
        const [embedData, textContent] = await Promise.all([
            fs.readFile('embed.json', 'utf8'),
            fs.readFile('texto.txt', 'utf8')
        ]);
        
        let embed = JSON.parse(embedData);
        
        if (embed.embeds?.[0]) {
            if (embed.embeds[0].color) {
                embed.embeds[0].color = hexToDecimal(embed.embeds[0].color);
            }
            embed.embeds[0].description = textContent;
        }
        
        return embed;
    } catch (error) {
        console.error('Erro ao carregar a embed:', error);
        return getDefaultEmbed();
    }
}

// Embed padrão caso ocorra algum erro
function getDefaultEmbed() {
    return {
        embeds: [
            new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('GOAT 2FA')
                .setDescription('✅️・Bot para pegar codigo 2fa da rockstar')
                                
        ]
    };
}

module.exports = {
    loadEmbed,
    getDefaultEmbed
};