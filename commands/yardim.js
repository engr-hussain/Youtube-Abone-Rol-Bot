/**
 * Yardım Komutu - Bot komutları hakkında bilgi verir
 * @module commands/yardim
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yardım')
        .setDescription('Bot komutları hakkında bilgi verir'),
        
    // Komut işleyici
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(config.embeds.global.colors.help)
            .setAuthor({ 
                name: 'Bot Komut Merkezi', 
                iconURL: config.embeds.global.authorIcon || interaction.client.user.displayAvatarURL({ dynamic: true })
            })
            .setTitle('📚 İnteraktif Yardım Menüsü')
            .setDescription('Aşağıdaki menüden bir kategori seçerek ilgili komutları görüntüleyebilirsiniz.')
            .setThumbnail(config.embeds.yardim.thumbnail || interaction.guild.iconURL({ dynamic: true, size: 256 }))
            .addFields(
                { 
                    name: '🔍 Genel Komutlar', 
                    value: '```/ping - Bot ve API gecikme sürelerini gösterir\n/yardım - Bu yardım menüsünü gösterir```',
                    inline: false 
                }
            )
            .addFields(
                { 
                    name: '🛡️ Yetkili Komutları', 
                    value: '```/abone-rol - Belirli bir kullanıcıya abone rolü verir\n/youtube-bilgi - YouTube kanal ve video bilgilerini gösterir```',
                    inline: false 
                }
            )
            .addFields(
                { 
                    name: '📱 Kullanıcı Etkileşimleri', 
                    value: 'Normal kullanıcılar komut kullanmazlar, sadece abone kanalına ekran görüntüsü gönderirler.',
                    inline: false 
                }
            )
            .addFields(
                { 
                    name: `<:howto:${config.embeds.emojis.howto}> Nasıl Çalışır?`, 
                    value: '> 1️⃣ Kullanıcı, doğru YouTube kanalının doğru videosunu açar\n> 2️⃣ Videoya abone olup beğeni (👍) yapar\n> 3️⃣ Ekran görüntüsünü <#KANAL_ID> kanalına gönderir\n> 4️⃣ Bot görüntüyü analiz eder ve kriterleri doğrular\n> 5️⃣ Tüm şartlar sağlanırsa, kullanıcıya otomatik olarak abone rolü verilir',
                    inline: false 
                }
            )
            .setImage(config.embeds.yardim.bannerImage) 
            .setFooter({ 
                text: `${interaction.client.user.username} • Abone Rol Sistemi v1.2.0 • ${interaction.guild.name}`, 
                iconURL: config.embeds.global.footerIcon || interaction.client.user.displayAvatarURL() 
            })
            .setTimestamp();
            
        // Kategori seçim menüsü
        const categorySelect = new StringSelectMenuBuilder()
            .setCustomId('help_category')
            .setPlaceholder('📂 Bir komut kategorisi seçin...')
            .addOptions([
                {
                    label: 'Genel Komutlar',
                    description: 'Herkesin kullanabileceği genel komutlar',
                    value: 'general_commands',
                    emoji: '🔍'
                },
                {
                    label: 'Yetkili Komutları',
                    description: 'Sadece yetkililerin kullanabileceği komutlar',
                    value: 'admin_commands',
                    emoji: '🛡️'
                },
                {
                    label: 'Nasıl Çalışır?',
                    description: 'Abone rol sisteminin çalışma prensibi',
                    value: 'how_it_works',
                    emoji: '📋'
                }
            ]);
            
        const menuRow = new ActionRowBuilder()
            .addComponents(categorySelect);
            
        // Butonlar
        const websiteButton = new ButtonBuilder()
            .setLabel('🌐 Website')
            .setStyle(ButtonStyle.Link)
            .setURL('https://example.com');
            
        const supportButton = new ButtonBuilder()
            .setLabel('💬 Destek Sunucusu')
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.gg/example');
            
        const tutorialButton = new ButtonBuilder()
            .setLabel('📺 Video Rehber')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('help_tutorial');
            
        const buttonRow = new ActionRowBuilder()
            .addComponents(websiteButton, supportButton, tutorialButton);
            
        await interaction.reply({ 
            embeds: [embed],
            components: [menuRow, buttonRow]
        });
    },
};
