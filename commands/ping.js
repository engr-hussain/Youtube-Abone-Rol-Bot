const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Bot ping değerini gösterir'),
        
    async execute(interaction) {
        const sent = await interaction.reply({ 
            content: `<a:loading:${config.embeds.emojis.loading}> **Sistem yanıt süresi hesaplanıyor...**`, 
            fetchReply: true 
        });
        
        const ping = sent.createdTimestamp - interaction.createdTimestamp;
        const apiPing = Math.round(interaction.client.ws.ping);
        
        let pingStatus, pingColor;
        
        if (ping < 100) {
            pingStatus = '🟢 Mükemmel';
            pingColor = config.embeds.global.colors.success;
        } else if (ping < 200) {
            pingStatus = '🟡 İyi';
            pingColor = config.embeds.global.colors.warning;
        } else if (ping < 400) {
            pingStatus = '🟠 Orta';
            pingColor = config.embeds.global.colors.warning; 
        } else {
            pingStatus = '🔴 Yavaş';
            pingColor = config.embeds.global.colors.error; 
        }
        
        const embed = new EmbedBuilder()
            .setColor(pingColor)
            .setAuthor({ 
                name: 'Sistem Performans Monitörü', 
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTitle(`🏓 Pong! ${pingStatus}`)
            .setDescription(`Sistemin yanıt süreleri aşağıda gösterilmektedir.`)
            .addFields(
                { 
                    name: `<:bot:${config.embeds.emojis.bot}> Bot Gecikmesi`, 
                    value: `\`\`\`${ping}ms\`\`\``, 
                    inline: true 
                },
                { 
                    name: `<:api:${config.embeds.emojis.api}> API Gecikmesi`, 
                    value: `\`\`\`${apiPing}ms\`\`\``, 
                    inline: true 
                }
            )
            .addFields(
                { 
                    name: '📊 Detaylı Performans Bilgisi', 
                    value: `Sunucu üzerinde çalışan botun tepki süresi kullanıcı deneyimini doğrudan etkiler. ${pingStatus.split(' ')[1]} performans seviyesi, komutların işlenmesi için ${ping < 200 ? 'ideal' : ping < 400 ? 'yeterli' : 'yeterli değil'}.`,
                    inline: false 
                }
            )
            .setFooter({ 
                text: `${interaction.user.tag} tarafından talep edildi • ${new Date().toLocaleTimeString('tr-TR')}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();
        
        const refreshButton = new ButtonBuilder()
            .setCustomId('refresh_ping')
            .setLabel('🔄 Yenile')
            .setStyle(ButtonStyle.Primary);
            
        const systemInfoButton = new ButtonBuilder()
            .setCustomId('system_info')
            .setLabel('📌 Sistem Bilgisi')
            .setStyle(ButtonStyle.Secondary);
            
        const row = new ActionRowBuilder()
            .addComponents(refreshButton, systemInfoButton);
            
        await interaction.editReply({ 
            content: null, 
            embeds: [embed],
            components: [row]
        });
    },
};
