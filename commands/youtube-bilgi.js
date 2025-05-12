const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const youtubeApi = require('../utils/youtubeApi');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('youtube-bilgi')
        .setDescription('YouTube kanal ve son video bilgilerini gösterir')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), 
    
    // Komut işleyici
    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            const videoSummary = await youtubeApi.getLatestVideoSummary();
            const embed = new EmbedBuilder()
                .setColor(config.embeds.global.colors.youtube)
                .setAuthor({ 
                    name: 'YouTube Bilgi Sistemi', 
                    iconURL: config.embeds.youtube.channelImage || 'https://i.imgur.com/7M3pkTL.png'
                })
                .setTitle('📺 YouTube Kanal ve Video Bilgileri')
                .setDescription('> Abone rol sistemi için gereken kanal ve video bilgilerinin detaylı görünümü. Bot bu bilgileri kullanarak kullanıcıların doğru kanala abone olup olmadığını kontrol eder.')
                .addFields(
                    { 
                    name: `<:youtube:${config.embeds.emojis.youtube}> Kanal Bilgileri`, 
                        value: `> **◽ Kanal Adı:** ${videoSummary.channelName}\n> **◽ Kanal ID:** \`${videoSummary.channelId}\`\n> **◽ Video Sayısı:** \`${videoSummary.videoCount || 'Bilinmiyor'}\`\n> **◽ Kanal URL:** [Tıkla ve Git](https://www.youtube.com/channel/${videoSummary.channelId})`,
                        inline: false 
                    }
                )
                .setTimestamp();
            
            if (videoSummary.latestVideoFound && videoSummary.latestVideo) {
                const publishDate = new Date(videoSummary.latestVideo.publishedAt).toLocaleString('tr-TR');
                
                embed.addFields({ 
                    name: '🎬 En Son Yayınlanan Video', 
                    value: `>>> **◽ Başlık:** ${videoSummary.latestVideo.title}\n**◽ Yayın Tarihi:** <t:${Math.floor(new Date(videoSummary.latestVideo.publishedAt).getTime() / 1000)}:R>\n**◽ Video ID:** \`${videoSummary.latestVideo.id}\`\n**◽ İzlenme:** ${videoSummary.latestVideo.viewCount || 'Bilinmiyor'}\n**◽ Link:** [Video'ya Git](${videoSummary.latestVideo.url})`,
                    inline: false 
                });
                
                if (config.youtube.checkLatestVideoOnly) {
                    embed.addFields({ 
                        name: '🔍 Bot Doğrulama Kriterleri', 
                    value: `┌─────── **SON VİDEO KONTROLÜ** ───────┐\n✅ **Son video kontrolü aktif edildi**\n\n**Kullanıcı Ekran Görüntüsünde Olması Gerekenler:**\n\n> 🔴 __Video Adı__: \`${videoSummary.latestVideo.title}\`\n> 👤 __Kanal Adı__: \`${videoSummary.channelName}\`\n> ✓ __Abone Durumu__: Abone olmuş (✓ işareti görünmeli)\n> 👍 __Beğeni Durumu__: Beğenmiş (mavi 👍 işareti olmalı)\n\n**Not:** Kullanıcılar tüm bu kriterler görünecek şekilde ekran görüntüsü almalıdır.`,
                        inline: false 
                    });
                } else {
                    embed.addFields({ 
                        name: '🔍 Bot Doğrulama Kriterleri', 
                        value: `┌─────── **GENEL KANAL KONTROLÜ** ───────┐\n⚠️ **Son video kontrolü devre dışı**\n\n**Kullanıcı Ekran Görüntüsünde Olması Gerekenler:**\n\n> 👤 __Kanal Adı__: \`${videoSummary.channelName}\`\n> ✓ __Abone Durumu__: Abone olmuş (✓ işareti görünmeli)\n\n**Not:** Kullanıcılar herhangi bir videoyu açabilirler, önemli olan kanala abone olduklarını göstermeleridir.`,
                        inline: false 
                    });
                }
                
                if (videoSummary.latestVideo.thumbnails && videoSummary.latestVideo.thumbnails.high && videoSummary.latestVideo.thumbnails.high.url) {
                    embed.setImage(videoSummary.latestVideo.thumbnails.high.url);
                }
            } else {
                embed.addFields({ 
                    name: '⚠️ Dikkat', 
                    value: 'Kanalda hiç video bulunamadı veya API erişim hatası.',
                    inline: false 
                });
            }
            
            if (videoSummary.videoCount > 1) {
                const { videos } = await youtubeApi.updateChannelAndVideoInfo();
                
                const recentVideos = videos.slice(0, 5);
                
                if (recentVideos.length > 1) {
                    let videoListText = '';
                    
                    recentVideos.forEach((video, index) => {
                        if (index === 0) return; 
                        const date = new Date(video.publishedAt).getTime() / 1000;
                        videoListText += `> **${index}.** [${video.title}](${video.url}) • <t:${Math.floor(date)}:R>\n`;
                    });
                    
                    if (videoListText) {
                        embed.addFields({ 
                            name: '📋 Diğer Son Videolar', 
                            value: videoListText || '*Listelenecek başka video bulunamadı*',
                            inline: false 
                        });
                    }
                }
            }
            
            embed.addFields({ 
                name: '⚙️ Sistem Konfigürasyonu', 
                value: `\`\`\`yaml\nAPI Endpoint: ${config.youtube.apiEndpoint}\nKanal ID: ${config.youtube.channelId}\nGüncelleme Sıklığı: ${config.youtube.checkIntervalMinutes} dakika\nOtomatik Kontrol: ${config.youtube.autoCheck ? 'Aktif' : 'Pasif'}\n\`\`\``,
                inline: false 
            });
            
            const lastUpdate = Math.floor(Date.now() / 1000);
            embed.setFooter({ 
                text: `${interaction.user.tag} tarafından talep edildi • ${config.youtube.checkIntervalMinutes} dakikada bir otomatik güncellenir`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();
            
            const watchButton = new ButtonBuilder()
                .setLabel('🎬 Videoyu İzle')
                .setStyle(ButtonStyle.Link)
                .setURL(videoSummary.latestVideo?.url || `https://www.youtube.com/channel/${videoSummary.channelId}`);
                
            const refreshButton = new ButtonBuilder()
                .setLabel('🔄 Bilgileri Yenile')
                .setStyle(ButtonStyle.Success)
                .setCustomId('refresh_youtube_info');
                
            const instructionButton = new ButtonBuilder()
                .setLabel('📝 Abone Olma Kılavuzu')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('youtube_instruction');
                
            const row = new ActionRowBuilder()
                .addComponents(watchButton, refreshButton, instructionButton);
                
            await interaction.editReply({ 
                embeds: [embed],
                components: [row] 
            });
            
        } catch (error) {
            console.error('YouTube bilgileri alınırken hata:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor(config.embeds.global.colors.error)
                .setAuthor({ 
                    name: 'YouTube API Hatası', 
                    iconURL: config.embeds.youtube.errorIcon || 'https://i.imgur.com/VSqSYDB.png'
                })
                .setTitle('⚠️ Veri Alınamadı')
                .setDescription('YouTube bilgileri alınırken bir sorun oluştu. Bu geçici bir kesinti olabilir veya API anahtarınızla ilgili bir sorun olabilir.')
                .addFields({ 
                    name: '📝 Hata Detayı', 
                    value: `\`\`\`js\n${error.message || 'Bilinmeyen hata'}\`\`\``,
                    inline: false 
                })
                .addFields({ 
                    name: '🔍 Olası Nedenler', 
                    value: '> • YouTube API kotanız dolmuş olabilir\n> • API anahtarınız geçersiz olabilir\n> • Belirtilen kanal ID\'si hatalı olabilir\n> • YouTube servislerinde geçici bir kesinti olabilir',
                    inline: false 
                })
                .addFields({ 
                    name: '🛠️ Ayarlarınızı Kontrol Edin', 
                    value: `**◽ Kanal ID:** \`${config.youtube.channelId}\`\n**◽ API Endpoint:** \`${config.youtube.apiEndpoint}\`\n**◽ Yapılandırma Dosyası:** \`config.json\``,
                    inline: false 
                })
                .addFields({ 
                    name: '💡 Çözüm Önerileri', 
                    value: '1. config.json dosyasındaki API anahtarınızı kontrol edin\n2. Farklı bir API anahtarı kullanmayı deneyin\n3. Kanal ID\'sini doğru girdiğinizden emin olun\n4. Bir süre bekleyip tekrar deneyin',
                    inline: false 
                })
                .setFooter({ 
                    text: `Hata Zamanı: ${new Date().toLocaleString('tr-TR')}`, 
                    iconURL: interaction.guild.iconURL({ dynamic: true }) 
                })
                .setTimestamp();
                
            // Yardım butonu
            const helpButton = new ButtonBuilder()
                .setLabel('🔍 Sorun Giderme Yardımı')
                .setStyle(ButtonStyle.Secondary)
                .setCustomId('youtube_api_help');
                
            const apiDashboardButton = new ButtonBuilder()
                .setLabel('⚙️ YouTube API Dashboardu')
                .setStyle(ButtonStyle.Link)
                .setURL('https://api.kynux.cloud/');
                
            const errorRow = new ActionRowBuilder()
                .addComponents(helpButton, apiDashboardButton);
                
            await interaction.editReply({ 
                embeds: [errorEmbed],
                components: [errorRow]
            });
        }
    },
};
