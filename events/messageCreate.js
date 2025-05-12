const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { analyzeImage, parseAnalysis } = require('../utils/imageAnalyzer');
const youtubeApi = require('../utils/youtubeApi');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const config = require('../config.json');

module.exports = {
    name: Events.MessageCreate,
    
    async execute(message) {
        const ABONE_KANAL_ID = config.channels.abone;
        const ABONE_ROL_ID = config.roles.abone;
        const LOG_KANAL_ID = config.channels.log;
        if (message.channel.id !== ABONE_KANAL_ID || message.author.bot) return;
        if (message.attachments.size === 0) return;
        const attachment = message.attachments.first();
        const logChannel = message.client.channels.cache.get(LOG_KANAL_ID);
        let tempImagePath = path.join(__dirname, '..', 'temp_ss.png');
        let messageProcessed = false; 
        let messageResult = null; 
        
        try {
            await message.react('🔍'); 
        } catch (err) {
            console.error('Emoji reaksiyon eklenirken hata:', err);
        }
        
        try {
            const supportedFormats = ['.png', '.jpg', '.jpeg', '.webp'];
            const fileExtension = path.extname(attachment.name).toLowerCase();
            
            if (!supportedFormats.includes(fileExtension)) {
                    messageResult = {
                        success: false,
                        title: '❌ Desteklenmeyen Dosya Formatı',
                        description: 'Lütfen sadece resim (PNG, JPG, JPEG, WEBP) dosyası yükleyin.',
                        color: config.embeds.global.colors.error,
                        reaction: '❌',
                        reasons: ['Desteklenmeyen dosya formatı'],
                        thumbnail: config.embeds.abone.errorThumbnail,
                        image: config.embeds.abone.errorImage
                    };
                messageProcessed = true;
                return;
            }
            
            const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
            fs.writeFileSync(tempImagePath, Buffer.from(response.data));
            
            const analiz = await analyzeImage(tempImagePath);
            const sonuc = await parseAnalysis(analiz);
            
            if (sonuc.isValid) {
                try {
                    await message.member.roles.add(ABONE_ROL_ID);
                    
                    messageResult = {
                        success: true,
                        title: '✨ Premium Abone Rolün Aktifleştirildi!',
                        description: `## ✅ İşlem Başarılı!\n> 🎉 **${message.author.username}**, abone rolün başarıyla aktifleştirildi.\n> 🔓 Artık özel içeriklere erişebilirsin!\n\n📂 <#altyapılar> kanalına göz atmayı unutma.\n⏰ ${new Date().toLocaleTimeString('tr-TR')} tarihinde aktifleştirildi.`,
                        color: config.embeds.global.colors.success,
                        reaction: '🎉',
                        reasons: [],
                        thumbnail: config.embeds.abone.successThumbnail,
                        image: config.embeds.abone.successImage,
                        fields: [
                            { name: '👑 Özel Üyelik', value: 'Artık premium içeriklerimize erişebilirsin!', inline: true },
                            { name: '⌛ Süre', value: 'Süresiz', inline: true }
                        ]
                    };
                } catch (roleError) {
                    console.error('Rol verilirken hata:', roleError);
                    messageResult = {
                        success: false,
                        title: '⚠️ Rol Verme Hatası',
                        description: 'Abone rolü verilirken bir hata oluştu. Lütfen yöneticilere bildirin.',
                        color: config.embeds.global.colors.warning,
                        reaction: '⚠️',
                        reasons: ['Rol verme hatası'],
                        thumbnail: config.embeds.abone.errorThumbnail,
                        image: null
                    };
                }
            } else {
                const correctVideo = sonuc.expectedInfo?.latestVideoTitle || "En güncel video";
                const videoUrl = `https://www.youtube.com/watch?v=${await youtubeApi.getLatestVideoId()}`;
                
                const formattedReasons = sonuc.reasons && sonuc.reasons.length > 0 
                    ? sonuc.reasons.map(reason => `> ${reason}`).join('\n') 
                    : "> ❓ Bilinmeyen nedenler - Tekrar deneyin.";
                
                    messageResult = {
                        success: false,
                        title: '❌ Abone Rol İşlemi Reddedildi',
                        description: `## ⚠️ Kriterleri Karşılamıyor!\n${formattedReasons}\n\n### 📝 Doğru Adımlar:\n1️⃣ [**Bu Videoyu Aç**](${videoUrl}) (${correctVideo})\n2️⃣ Abone ol ve like at\n3️⃣ Tüm kriterleri içeren bir ekran görüntüsü paylaş`,
                        color: config.embeds.global.colors.error,
                        reaction: '❌',
                        reasons: sonuc.reasons || ['Bilinmeyen nedenler'],
                        thumbnail: config.embeds.abone.errorThumbnail,
                        image: config.embeds.abone.errorImage,
                        videoUrl: videoUrl,
                        videoTitle: correctVideo,
                        fields: [
                            { name: '🎯 Doğru Video', value: `[${correctVideo}](${videoUrl})`, inline: false },
                            { name: '📊 Tespit Edilen', value: `Video: ${sonuc.detectedInfo?.videoTitle || 'Bilinmiyor'}\nKanal: ${sonuc.detectedInfo?.channelName || 'Bilinmiyor'}\nAbone: ${sonuc.detectedInfo?.isSubscribed ? '✅' : '❌'}\nLike: ${sonuc.detectedInfo?.isLiked ? '✅' : '❌'}`, inline: false }
                        ]
                    };
            }
            
            messageProcessed = true;
            
        } finally {
            try {
                if (fs.existsSync(tempImagePath)) {
                    fs.unlinkSync(tempImagePath);
                }
            } catch (err) {
                console.error('Geçici dosya silinirken hata:', err);
            }
            
            if (messageProcessed && messageResult) {
                try {
                    // Modern embed oluştur
                    const embed = new EmbedBuilder()
                        .setColor(messageResult.color)
                        .setTitle(messageResult.title)
                        .setDescription(messageResult.description)
                        .setFooter({ 
                            text: `${message.client.user.username} • Premium Abone Sistemi`, 
                            iconURL: message.client.user.displayAvatarURL() 
                        })
                        .setThumbnail(messageResult.thumbnail || null)
                        .setTimestamp();
                    
                    if (messageResult.image) {
                        embed.setImage(messageResult.image);
                    }
                    if (messageResult.fields && messageResult.fields.length > 0) {
                        embed.addFields(messageResult.fields);
                    }
                    const components = [];
                    if (!messageResult.success && messageResult.videoUrl) {
                        const row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setLabel('📺 Doğru Videoyu Aç')
                                    .setStyle(5) 
                                    .setURL(messageResult.videoUrl),
                                new ButtonBuilder()
                                    .setLabel('❓ Yardım')
                                    .setStyle(2)
                                    .setCustomId('abone_help')
                            );
                        components.push(row);
                    }
                    if (messageResult.success) {
                        const row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setLabel('📁 Özel İçerikler')
                                    .setStyle(1)
                                    .setCustomId('premium_content'),
                                new ButtonBuilder()
                                    .setLabel('📌 Profil')
                                    .setStyle(2) 
                                    .setCustomId(`profile_${message.author.id}`)
                            );
                        components.push(row);
                    }
                    await message.reply({ 
                        embeds: [embed], 
                        components: components.length > 0 ? components : undefined 
                    });
                    
                    try {
                        await message.reactions.removeAll();
                        await message.react(messageResult.reaction);
                    } catch (emojiErr) {
                        console.error('Emoji reaksiyon işleminde hata:', emojiErr);
                    }
                    
                    if (logChannel) {
                        try {
                            const logEmbed = new EmbedBuilder()
                                .setColor(messageResult.color)
                                .setAuthor({ 
                                    name: message.author.tag, 
                                    iconURL: message.author.displayAvatarURL({ dynamic: true }) 
                                })
                                .setTitle(messageResult.success ? '✅ Abone Rol İşlemi Başarılı' : '❌ Abone Rol Talebi Reddedildi')
                                .setDescription(`### ${messageResult.success ? 'Başarılı İşlem' : 'Başarısız İşlem'} Kaydı\n> **Kullanıcı:** ${message.author} (ID: ${message.author.id})\n> **Kanal:** ${message.channel}\n> **Tarih:** <t:${Math.floor(Date.now() / 1000)}:F>\n${!messageResult.success ? `\n### Red Nedenleri:\n${messageResult.reasons.map(r => `- ${r}`).join('\n')}` : ''}`)
                                .addFields(
                                    { name: '📌 İşlem ID', value: `\`${Math.random().toString(36).substring(2, 10).toUpperCase()}\``, inline: true },
                                    { name: '⏱️ İşlem Süresi', value: `${Date.now() - message.createdTimestamp}ms`, inline: true }
                                )
                                .setImage(attachment.url)
                                .setFooter({ 
                                    text: `AI-Powered Abone Rol Sistemi • ${new Date().toLocaleDateString('tr-TR')}`,
                                    iconURL: message.client.user.displayAvatarURL()
                                })
                                .setTimestamp();                            
                            if (sonuc && sonuc.detectedInfo) {
                                logEmbed.addFields(
                                    { 
                                        name: '🔍 Tespit Edilen Bilgiler', 
                                        value: `Video: \`${sonuc.detectedInfo.videoTitle || 'Bilinmiyor'}\`\nKanal: \`${sonuc.detectedInfo.channelName || 'Bilinmiyor'}\`\nAbone: ${sonuc.detectedInfo.isSubscribed ? '✅' : '❌'}\nLike: ${sonuc.detectedInfo.isLiked ? '✅' : '❌'}`, 
                                        inline: false 
                                    }
                                );
                            }
                            
                            await logChannel.send({ embeds: [logEmbed] });
                        } catch (logErr) {
                            console.error('Log mesajı gönderilemedi:', logErr);
                        }
                    }
                } catch (msgErr) {
                    console.error('Sonuç mesajı gönderilirken ciddi hata:', msgErr);
                }
            }
        }
    },
};
