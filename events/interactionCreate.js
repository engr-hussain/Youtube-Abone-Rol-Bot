const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            
            if (!command) {
                console.error(`${interaction.commandName} komutu bulunamadı.`);
                return;
            }
            
            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`${interaction.commandName} komutu çalıştırılırken hata oluştu:`, error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#e74c3c')
                    .setTitle('⚠️ Komut Hatası')
                    .setDescription(`Bu komut çalıştırılırken bir hata meydana geldi.`)
                    .addFields({ 
                        name: '📝 Hata Detayı', 
                        value: `\`\`\`js\n${error.message || 'Bilinmeyen hata'}\`\`\``, 
                        inline: false 
                    })
                    .setFooter({
                        text: 'Bu hata kaydedildi ve sistem yöneticilerine bildirildi',
                        iconURL: interaction.client.user.displayAvatarURL()
                    })
                    .setTimestamp();
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            }
            return;
        }
        if (interaction.isButton()) {
            try {
                const buttonId = interaction.customId;
                
                if (buttonId === 'refresh_ping') {
                    const pingCommand = interaction.client.commands.get('ping');
                    if (pingCommand) {
                        await interaction.deferUpdate();
                        await pingCommand.execute(interaction);
                    }
                }
                
                else if (buttonId === 'system_info') {
                    const uptime = process.uptime();
                    const days = Math.floor(uptime / 86400);
                    const hours = Math.floor((uptime % 86400) / 3600);
                    const minutes = Math.floor((uptime % 3600) / 60);
                    
                    const systemEmbed = new EmbedBuilder()
                        .setColor('#3498db')
                        .setTitle('📊 Sistem Bilgileri')
                        .addFields(
                            { name: '🤖 Bot Sürümü', value: `v1.2.0`, inline: true },
                            { name: '⏰ Çalışma Süresi', value: `${days}g ${hours}s ${minutes}d`, inline: true },
                            { name: '🧠 Bellek Kullanımı', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`, inline: true },
                            { name: '👥 Sunucu Sayısı', value: `${interaction.client.guilds.cache.size}`, inline: true },
                            { name: '📊 Sunucu Üye Sayısı', value: `${interaction.guild.memberCount}`, inline: true }
                        )
                        .setFooter({
                            text: `${interaction.user.tag} tarafından istendi`,
                            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                        })
                        .setTimestamp();
                        
                    await interaction.reply({ embeds: [systemEmbed], ephemeral: true });
                }
                
                else if (buttonId === 'refresh_youtube_info') {
                    const youtubeInfoCommand = interaction.client.commands.get('youtube-bilgi');
                    if (youtubeInfoCommand) {
                        await interaction.deferUpdate();
                        await youtubeInfoCommand.execute(interaction);
                    }
                }
                
                else if (buttonId === 'youtube_instruction') {
                    const instructionEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('📝 Abone Olma Adımları')
                        .setDescription('Abone rolü alabilmek için izlemeniz gereken adımlar:')
                        .addFields(
                            { name: '1️⃣ YouTube Kanalına Git', value: 'Doğru YouTube kanalına gittiğinizden emin olun.', inline: false },
                            { name: '2️⃣ Son Videoyu Aç', value: 'En son yayınlanan videoyu açın ve tam ekran görüntüsünü alın.', inline: false },
                            { name: '3️⃣ Abone Ol ve Beğen', value: 'Kanala abone olun ve videoyu beğenin (Like).', inline: false },
                            { name: '4️⃣ Ekran Görüntüsü Al', value: 'Abone durumunu (✓) ve beğeni (👍) gösterecek şekilde ekran görüntüsü alın.', inline: false },
                            { name: '5️⃣ Discord\'a Gönder', value: 'Aldığınız ekran görüntüsünü #abone kanalına gönderin.', inline: false }
                        )
                        .setImage('https://i.imgur.com/EGbUQUi.png') 
                        .setFooter({
                            text: 'Bot ekran görüntünüzü otomatik olarak analiz edecektir',
                            iconURL: interaction.client.user.displayAvatarURL()
                        })
                        .setTimestamp();
                        
                    await interaction.reply({ embeds: [instructionEmbed], ephemeral: true });
                }
                
                else if (buttonId === 'youtube_api_help') {
                    const apiHelpEmbed = new EmbedBuilder()
                        .setColor('#f39c12')
                        .setTitle('🔍 YouTube API Sorun Giderme')
                        .setDescription('YouTube API sorunlarını çözmek için izlemeniz gereken adımlar:')
                        .addFields(
                            { name: '1️⃣ API Anahtarınızı Kontrol Edin', value: 'Google Cloud Console\'da API anahtarınızın aktif olduğunu doğrulayın.', inline: false },
                            { name: '2️⃣ Kota Kullanımınızı Kontrol Edin', value: 'API kota limitinizi aşmış olabilirsiniz. Google Cloud Console\'dan kontrol edin.', inline: false },
                            { name: '3️⃣ Kanal ID\'sini Doğrulayın', value: 'config.json dosyasındaki YouTube kanal ID\'sinin doğru olduğundan emin olun.', inline: false },
                            { name: '4️⃣ YouTube API Sürümünü Kontrol Edin', value: 'YouTube Data API v3 kullandığınızdan emin olun.', inline: false }
                        )
                        .setFooter({
                            text: 'Daha fazla yardım için YouTube API dokümantasyonunu ziyaret edin',
                            iconURL: interaction.client.user.displayAvatarURL()
                        })
                        .setTimestamp();
                        
                    await interaction.reply({ embeds: [apiHelpEmbed], ephemeral: true });
                }
                
                else if (buttonId.startsWith('profile_')) {
                    const userId = buttonId.split('_')[1];
                    try {
                        const user = await interaction.client.users.fetch(userId);
                        const member = await interaction.guild.members.fetch(userId);
                        
                        const createdDate = Math.floor(user.createdTimestamp / 1000);
                        const joinedDate = Math.floor(member.joinedTimestamp / 1000);
                        
                        const profileEmbed = new EmbedBuilder()
                            .setColor('#9b59b6')
                            .setTitle(`${user.tag} Profili`)
                            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
                            .addFields(
                                { name: '🆔 Kullanıcı ID', value: `\`${user.id}\``, inline: true },
                                { name: '📆 Hesap Oluşturma', value: `<t:${createdDate}:R>`, inline: true },
                                { name: '📥 Sunucuya Katılma', value: `<t:${joinedDate}:R>`, inline: true },
                                { name: '🚩 Roller', value: member.roles.cache.size > 1 ? 
                                    member.roles.cache.filter(role => role.id !== interaction.guild.id).map(role => `<@&${role.id}>`).join(', ') : 
                                    'Rol yok', inline: false }
                            )
                            .setFooter({
                                text: `${interaction.user.tag} tarafından görüntülendi`,
                                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                            })
                            .setTimestamp();
                            
                        await interaction.reply({ embeds: [profileEmbed], ephemeral: true });
                    } catch (error) {
                        console.error('Kullanıcı profili alınırken hata:', error);
                        await interaction.reply({ 
                            content: '❌ Kullanıcı profili alınamadı.', 
                            ephemeral: true 
                        });
                    }
                }
                
                else {
                    console.log(`Tanımlanmamış buton ID'si: ${buttonId}`);
                }
                
            } catch (error) {
                console.error('Buton işlenirken hata:', error);
                await interaction.reply({ 
                    content: '❌ Bu buton işlenirken bir hata oluştu.', 
                    ephemeral: true 
                });
            }
            return;
        }
        
        if (interaction.isStringSelectMenu()) {
            try {
                const menuId = interaction.customId;
                const selectedValue = interaction.values[0];
                
                if (menuId === 'help_category') {
                    let embed;
                    
                    if (selectedValue === 'general_commands') {
                        embed = new EmbedBuilder()
                            .setColor('#3498db')
                            .setTitle('🔍 Genel Komutlar')
                            .setDescription('Herkesin kullanabileceği komutların detaylı açıklamaları:')
                            .addFields(
                                { 
                                    name: '🏓 /ping', 
                                    value: `Bot ve Discord API gecikmesini görüntüler.\n**Kullanım:** \`/ping\`\n**Çıktı:** Bot gecikmesi ve API gecikmesi değerleri.`, 
                                    inline: false 
                                },
                                { 
                                    name: '📚 /yardım', 
                                    value: `Komutlar hakkında yardım bilgilerini gösterir.\n**Kullanım:** \`/yardım\`\n**Çıktı:** Bu yardım menüsü.`, 
                                    inline: false 
                                }
                            )
                            .setFooter({
                                text: 'İpucu: Komutları kullanmak için / tuşuna basabilirsiniz',
                                iconURL: interaction.client.user.displayAvatarURL()
                            })
                            .setTimestamp();
                    }
                    
                    else if (selectedValue === 'admin_commands') {
                        embed = new EmbedBuilder()
                            .setColor('#e74c3c')
                            .setTitle('🛡️ Yetkili Komutları')
                            .setDescription('Sadece yetkililerin kullanabileceği komutların detaylı açıklamaları:')
                            .addFields(
                                { 
                                    name: '🎭 /abone-rol', 
                                    value: `Belirli bir kullanıcıya abone rolü verir.\n**Kullanım:** \`/abone-rol kullanıcı:[etiket] sebep:[opsiyonel]\`\n**İzin:** Yönetici`, 
                                    inline: false 
                                },
                                { 
                                    name: '📺 /youtube-bilgi', 
                                    value: `Abone rol sistemi için gerekli YouTube kanal ve video bilgilerini gösterir.\n**Kullanım:** \`/youtube-bilgi\`\n**İzin:** Yönetici`, 
                                    inline: false 
                                }
                            )
                            .setFooter({
                                text: 'Bu komutlar sadece yönetici iznine sahip kullanıcılar için görünür',
                                iconURL: interaction.client.user.displayAvatarURL()
                            })
                            .setTimestamp();
                    }
                    
                    else if (selectedValue === 'how_it_works') {
                        embed = new EmbedBuilder()
                            .setColor('#2ecc71')
                            .setTitle('📋 Abone Rol Sistemi: Nasıl Çalışır?')
                            .setDescription('Abone rol sisteminin detaylı çalışma prensibi:')
                            .addFields(
                                { 
                                    name: '1️⃣ Kullanıcı Adımları', 
                                    value: `- YouTube kanalını ziyaret eder\n- Son videoya abone olur ve beğenir\n- Ekran görüntüsü alır\n- #abone kanalına gönderir`, 
                                    inline: false 
                                },
                                { 
                                    name: '2️⃣ Bot İşlem Süreci', 
                                    value: `- Görüntüyü yapay zeka ile analiz eder\n- Doğru video olup olmadığını kontrol eder\n- Abone durumunu doğrular\n- Beğeni durumunu kontrol eder`, 
                                    inline: false 
                                },
                                { 
                                    name: '3️⃣ Sonuç', 
                                    value: `- Tüm kriterler karşılanırsa, kullanıcıya abone rolü verilir\n- İşlem log kanalında kaydedilir\n- Kullanıcıya bildirim gönderilir`, 
                                    inline: false 
                                },
                                { 
                                    name: '⚙️ Yönetici Ayarları', 
                                    value: `- YouTube kanalı ve video kontrolleri yapılandırılabilir\n- \`/youtube-bilgi\` komutu ile güncel video takip edilebilir\n- Manuel rol vermek için \`/abone-rol\` komutu kullanılabilir`, 
                                    inline: false 
                                }
                            )
                            .setImage('https://i.imgur.com/EGbUQUi.png')
                            .setFooter({
                                text: 'Daha fazla bilgi için sunucu yöneticileriyle iletişime geçin',
                                iconURL: interaction.client.user.displayAvatarURL()
                            })
                            .setTimestamp();
                    }
                    
                    if (embed) {
                        await interaction.reply({ embeds: [embed], ephemeral: true });
                    }
                }
                
            } catch (error) {
                console.error('Seçim menüsü işlenirken hata:', error);
                await interaction.reply({ 
                    content: '❌ Bu seçim işlenirken bir hata oluştu.', 
                    ephemeral: true 
                });
            }
            return;
        }
    },
};
