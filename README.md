# YouTube Abone Rol Bot - Kynux API Entegrasyonu

## 📋 Genel Bakış

Bu gelişmiş bot, Discord sunucunuzda YouTube abone doğrulama sistemi kurmanızı sağlar. Kullanıcılar belirli bir YouTube kanalına abone olduklarını doğrulamak için kanal ekran görüntülerini yüklerler ve bot bu görüntüleri Kynux Cloud API aracılığıyla OpenAI görüntü analizi kullanarak doğrular. **Kynux YouTube API entegrasyonu sayesinde kanalınızın en son videosunu otomatik kontrol eder!**

### 🔍 Doğrulama Kriterleri

1. **Kanal Kontrolü**: Görüntü belirtilen YouTube kanalına ait olmalı
2. **En Son Video Kontrolü**: Kullanıcılar kanalın en son videosunu açmış olmalı
3. **Abone Durumu**: Kullanıcı kanala abone olmuş olmalı
4. **Like Durumu**: Kullanıcı videoyu beğenmiş olmalı

Tüm kriterler karşılandığında, kullanıcıya otomatik olarak belirtilen Discord rolü verilir.

## 🚀 Özellikler

- **Kynux YouTube API Entegrasyonu**: Kanal ve son videoları otomatik kontrol eder
- **Gerçek Zamanlı Güncelleme**: YouTube kanalındaki en son videolar için otomatik güncelleme
- **Gelişmiş Görüntü Analizi**: Kynux Cloud aracılığıyla OpenAI API kullanarak YouTube ekran görüntülerini analiz eder
- **Discord.js v14**: En son Discord API özelliklerini destekler
- **Kapsamlı Slash Komutları**: /ping, /yardım, /abone-rol, /youtube-bilgi komutları
- **Detaylı Bilgi Ekranı**: Kanal ve video bilgilerini admin komutlarıyla göster
- **Otomatik Format Kontrolü**: Sadece desteklenen resim formatlarını kabul eder
- **Önbelleğe Alma**: Gereksiz API çağrılarını önlemek için verileri önbelleğe alır
- **Özelleştirilebilir Embed Mesajlar**: Tamamen özelleştirilebilir renkler, ikonlar ve resimler

## 🛠️ Kurulum

### Gereksinimler
- Node.js v16.9.0 veya daha yüksek
- npm veya yarn
- Discord Bot Token
- Kynux Cloud API Anahtarı (ücretli, fiyatlandırma: https://api.kynux.cloud/pricing)

### Adımlar

1. Repo'yu klonlayın
```bash
git clone https://github.com/kynuxdev/youtube-abone-rol-bot.git
cd youtube-abone-rol-bot
```

2. Bağımlılıkları yükleyin
```bash
npm install
```

3. api.kynux.cloud adresine kayıt olun ve Kynux Cloud API anahtarı alın

4. Bir `.env` dosyası oluşturun ve aşağıdaki değerleri ekleyin:
```
DISCORD_TOKEN=discord_bot_token_buraya
KYNUX_CLOUD_API=kynux_cloud_api_key_buraya
```

5. Kanal ID'sini config.json dosyasında ayarlayın
```json
{
  "youtube": {
    "apiEndpoint": "https://api.kynux.cloud/api/youtube/channel",
    "channelId": "BURAYA_KANAL_ID_YAZIN",
    "channelName": "KANAL_ADINI_YAZIN",
    "checkIntervalMinutes": 10,
    "checkLatestVideoOnly": true
  }
}
```

6. Discord kanal ve rol ID'lerini config.json dosyasında ayarlayın
```json
{
  "channels": {
    "abone": "ABONE_KANAL_ID_BURAYA",
    "log": "LOG_KANAL_ID_BURAYA"
  },
  "roles": {
    "abone": "ABONE_ROL_ID_BURAYA"
  }
}
```

7. Botu başlatın
```bash
node index.js
```

## 🧩 Proje Yapısı

```
youtube-abone-rol-bot/
│
├── index.js                # Ana bot dosyası
├── config.json             # Bot yapılandırması
├── .env                    # Hassas API anahtarları
│
├── commands/               # Slash komut dosyaları
│   ├── abone-rol.js        # Manuel rol verme komutu
│   ├── ping.js             # Bot yanıt süresi komutu
│   ├── yardim.js           # Yardım komutu
│   └── youtube-bilgi.js    # YouTube kanal/video bilgi komutu
│
├── events/                 # Bot event handler dosyaları
│   ├── interactionCreate.js # Slash komut işleyici
│   ├── messageCreate.js     # Mesaj işleyici (görüntü analizi)
│   └── ready.js             # Bot başlangıç event'i
│
└── utils/                  # Yardımcı modüller
    ├── imageAnalyzer.js    # Görüntü analiz fonksiyonları
    └── youtubeApi.js       # YouTube API entegrasyonu
```

## 📋 Kynux YouTube API Kullanımı

Bot, Kynux API'yi kullanarak şu işlemleri gerçekleştirir:

- Belirtilen kanal ID'sine göre kanal video listesini alır
- En son videoyu otomatik olarak tespit eder
- Kullanıcıların yüklediği ekran görüntülerini en son video bilgisiyle karşılaştırır
- Abone ol ve like kontrollerini yapar
- Admin komutları ile kanal ve video durumunu görüntüleme imkanı sunar

### Endpoint Yapısı

```
GET https://api.kynux.cloud/api/youtube/channel/{channelId}/videos
```

### API Cevabı

API'den gelen yanıt, aşağıdaki yapıya sahiptir:

```json
{
  "data": [
    {
      "videoId": "video_id",
      "title": "Video Başlığı",
      "channelId": "kanal_id",
      "channelTitle": "Kanal Adı",
      "publishedAt": "2025-05-12T16:45:05.000Z",
      "description": "Video açıklaması",
      "thumbnails": {
        "default": { "url": "thumbnail_url" },
        "medium": { "url": "thumbnail_url" },
        "high": { "url": "thumbnail_url" }
      }
    }
  ]
}
```

## 🖼️ Görüntü Analizi

Bot, yüklenen görüntüleri Kynux Cloud API üzerinden OpenAI modelleriyle analiz eder. Analiz şu kriterleri kontrol eder:

1. Görüntüde doğru YouTube kanalı açık mı?
2. Görüntüde kanalın en son videosu mu açık?
3. Kullanıcı kanala abone olmuş mu?
4. Kullanıcı videoyu beğenmiş mi?

Görüntü analizi sonuçları aşağıdaki formatta döner:
```javascript
{
  isValid: true/false,
  reasons: ["Hata nedenleri varsa burada listelenir"],
  detectedInfo: {
    videoTitle: "Tespit edilen video başlığı",
    channelName: "Tespit edilen kanal adı",
    isSubscribed: true/false,
    isLiked: true/false
  },
  expectedInfo: {
    latestVideoTitle: "Olması gereken en son video başlığı",
    channelName: "Olması gereken kanal adı",
    publishedAt: "Video yayınlanma tarihi"
  }
}
```

## 📚 Komutlar

- **/ping**: Bot ve API yanıt sürelerini gösterir
- **/yardım**: Tüm komutların listesini ve açıklamalarını gösterir
- **/abone-rol**: Manuel olarak bir kullanıcıya abone rolü verir (Sadece Yöneticiler)
- **/youtube-bilgi**: Kanal ve video bilgilerini gösterir, en son videoyu listeler (Sadece Yöneticiler)

## 📷 Kullanım

1. `/youtube-bilgi` komutunu kullanarak botta hangi videoyu açmaları gerektiğini öğrenin
2. Kullanıcılar #abone kanalına YouTube ekran görüntüsü yüklerler
3. Görüntüde şunlar olmalıdır:
   - Doğru kanal adı
   - En son video açık olmalı
   - Abone butonu "Abonelikten Çık" durumunda olmalı
   - Video like'lanmış olmalı
4. Bot görüntüyü analiz eder ve tüm şartlar sağlanıyorsa rol verir
5. İşlem sonucu hem kullanıcıya hem de log kanalına bildirilir

## 📦 Bağımlılıklar

```json
"dependencies": {
  "axios": "^1.7.9",
  "discord.js": "^14.17.3",
  "dotenv": "^16.4.7",
  "fs": "^0.0.1-security",
  "googleapis": "^148.0.0",
  "node-fetch": "^3.3.2"
}
```

## 📜 Lisans

MIT

## 📱 İletişim ve Destek

Yardıma mı ihtiyacınız var? Bize ulaşın:

- **Discord Sunucusu**: [https://discord.gg/wCK5dVSY2n](https://discord.gg/wCK5dVSY2n)
- **Instagram**: [instagram.com/kynux_dev](https://instagram.com/kynux_dev)
- **GitHub**: [github.com/kynuxdev](https://github.com/kynuxdev)

API kullanımı, fiyatlandırma ve teknik destek için Discord sunucumuza katılmayı unutmayın!
