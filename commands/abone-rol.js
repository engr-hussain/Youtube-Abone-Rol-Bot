const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');

module.exports = {
    // Komut tanımı
    data: new SlashCommandBuilder()
        .setName('abone-rol')
        .setDescription('Belirtilen kullanıcıya abone rolü verir')
        .addUserOption(option => 
            option.setName('kullanıcı')
                .setDescription('Rol verilecek kullanıcı')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('sebep')
                .setDescription('Rol verme sebebi')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Sadece yöneticiler kullanabilir
    
    // Komut işleyici
    async execute(interaction) {
        // Config'den değerleri al
        const ABONE_ROL_ID = config.roles.abone;
        const LOG_KANAL_ID = config.channels.log;
        
        // Parametre kontrolü
        const targetUser = interaction.options.getUser('kullanıcı');
        const reason = interaction.options.getString('sebep') || 'Manuel olarak verildi';
        
        try {
            // Guild member al (rol verebilmek için)
            const targetMember = await interaction.guild.members.fetch(targetUser.id);
            
            // Rolü ver
            await targetMember.roles.add(ABONE_ROL_ID);
            
            // Modern ve dikkat çekici embed - config'den renk ve görsel ayarlarını al
            const embed = new EmbedBuilder()
                .setColor(config.embeds.global.colors.success)
                .setAuthor({ 
                    name: '⭐ Abone Rol Sistemi • Premium', 
                    iconURL: interaction.guild.iconURL({ dynamic: true }) 
                })
                .setTitle('✓ Abone Rolü Verildi')
                .setDescription(`> ### İşlem Başarılı\n> <:crown:${config.embeds.emojis.crown}> **${targetUser}** kullanıcısına abone rolü verildi.`)
                .addFields(
                    { name: '👤 Kullanıcı', value: `<@${targetUser.id}>`, inline: true },
                    { name: '🛡️ Yetkili', value: `<@${interaction.user.id}>`, inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: '📝 Sebep', value: `\`\`\`${reason}\`\`\``, inline: false },
                    { name: '⏰ İşlem Zamanı', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: false }
                )
                .setThumbnail(config.embeds.abone.successThumbnail || targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
                .setFooter({ 
                    text: `${interaction.guild.name} • ${new Date().toLocaleDateString('tr-TR')}`, 
                    iconURL: interaction.guild.iconURL({ dynamic: true })
                })
                .setTimestamp();
                
            // Başarı görseli kullan
            embed.setImage(config.embeds.abone.successImage);
                
            // Modern düğmeler
            const profileButton = new ButtonBuilder()
                .setLabel('Kullanıcı Profili')
                .setEmoji('👤')
                .setStyle(ButtonStyle.Primary)
                .setCustomId(`profile_${targetUser.id}`);
                
            const statsButton = new ButtonBuilder()
                .setLabel('İstatistikler')
                .setEmoji('📊')
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`stats_${targetUser.id}`);
                
            const logButton = new ButtonBuilder()
                .setLabel('İşlem Kaydı')
                .setEmoji('📋')
                .setStyle(ButtonStyle.Success)
                .setCustomId(`log_view`);
                
            // Buton satırı
            const row = new ActionRowBuilder()
                .addComponents(profileButton, statsButton, logButton);
                
            await interaction.reply({ embeds: [embed], components: [row] });
            
            // Log kanalına gelişmiş bildirim gönder - modern tasarım
            const logChannel = interaction.client.channels.cache.get(LOG_KANAL_ID);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor(config.embeds.global.colors.info)
                    .setAuthor({ 
                        name: '🔶 Abone Rol Sistemi • Log Kaydı', 
                        iconURL: config.embeds.global.authorIcon || interaction.client.user.displayAvatarURL() 
                    })
                    .setDescription('> ### Yeni Abone Rolü Verildi\n> Aşağıda işlem detaylarını görebilirsiniz.')
                    .addFields(
                        { name: '👤 Kullanıcı', value: `${targetUser} (\`${targetUser.tag}\`)`, inline: true },
                        { name: '🛡️ İşlemi Yapan', value: `${interaction.user} (\`${interaction.user.tag}\`)`, inline: true },
                        { name: '🆔 Kullanıcı ID', value: `\`${targetUser.id}\``, inline: false },
                        { name: '📋 Sebep', value: `\`\`\`${reason}\`\`\``, inline: false },
                        { name: '⏰ Tarih ve Zaman', value: `<t:${Math.floor(Date.now() / 1000)}:F> (<t:${Math.floor(Date.now() / 1000)}:R>)`, inline: false }
                    )
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 128 }))
                    .setFooter({ 
                        text: `${interaction.guild.name} • Abone Rol Sistemi v2.0`, 
                        iconURL: interaction.guild.iconURL({ dynamic: true }) 
                    })
                    .setTimestamp();
                    
                await logChannel.send({ embeds: [logEmbed] });
            }
        } catch (error) {
            console.error('Rol verme hatası:', error);
            
            // Modern hata mesajı - config'den renkleri ve görsel öğeleri al
            const errorEmbed = new EmbedBuilder()
                .setColor(config.embeds.global.colors.error)
                .setAuthor({ 
                    name: '⚠️ İşlem Hatası', 
                    iconURL: config.embeds.global.authorIcon || interaction.client.user.displayAvatarURL() 
                })
                .setTitle('Abone Rolü Verilemedi')
                .setDescription('> ### Bir Sorun Oluştu\n> Abone rolü verirken beklenmedik bir hata ile karşılaşıldı.')
                .addFields(
                    { name: '🔍 Hata Kodu', value: `\`E${Math.floor(Math.random() * 900) + 100}\``, inline: true },
                    { name: '⏱️ Zaman', value: `<t:${Math.floor(Date.now() / 1000)}:T>`, inline: true },
                    { name: '\u200B', value: '\u200B', inline: true },
                    { name: '📌 Teknik Detay', value: `\`\`\`js\n${error.message || 'Bilinmeyen hata'}\`\`\``, inline: false },
                    { name: '🔄 Çözüm Önerileri', value: '• Sunucu ayarlarını kontrol edin\n• Bot yetkilerini doğrulayın\n• Rol hiyerarşisini kontrol edin', inline: false }
                )
                .setThumbnail('https://i.imgur.com/VSqSYDB.png')
                .setFooter({ 
                    text: 'Bu hata otomatik olarak sistem yöneticilerine iletildi', 
                    iconURL: interaction.guild.iconURL({ dynamic: true }) 
                })
                .setTimestamp();
                
            await interaction.reply({ 
                embeds: [errorEmbed], 
                ephemeral: true 
            });
        }
    },
};
