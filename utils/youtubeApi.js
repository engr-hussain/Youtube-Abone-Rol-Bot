const axios = require('axios');
const config = require('../config.json');

let videoCache = {
    lastUpdate: null,
    videos: [],
    latestVideo: null,
    channelInfo: null
};

async function getChannelVideos(channelId) {
    try {
        const endpoint = `https://api.kynux.cloud/api/youtube/channel/${channelId}/videos`;
        
        console.log(`Kynux API çağrısı yapılıyor: ${endpoint}`);
        
        const response = await axios.get(endpoint, {
            headers: {
                'X-API-Key': config.kynuxApiKey,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
            throw new Error('API geçersiz yanıt döndürdü');
        }
        
        return response.data.data.map(video => ({
            id: video.videoId,
            title: video.title,
            description: video.description || '',
            publishedAt: video.publishedAt,
            thumbnails: video.thumbnails || {
                default: { url: '' },
                medium: { url: '' },
                high: { url: '' }
            },
            channelTitle: video.channelTitle,
            channelId: video.channelId,
            url: `https://www.youtube.com/watch?v=${video.videoId}`
        }));
    } catch (error) {
        console.error('Kynux API Hatası (Video Listesi):', error.message);
        throw error;
    }
}

function cleanTitle(title) {
    if (!title) return '';
    
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s|]/g, '')
        .replace(/İ/g, 'i')
        .replace(/I/g, 'i')
        .replace(/ı/g, 'i')
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/\s+/g, ' ')
        .trim();
}

async function updateChannelAndVideoInfo() {
    try {
        const now = new Date();
        const checkIntervalMs = config.youtube.checkIntervalMinutes * 60 * 1000;
        
        if (videoCache.lastUpdate && (now - videoCache.lastUpdate) < checkIntervalMs) {
            console.log('Önbellekten video bilgileri kullanılıyor...');
            return {
                videos: videoCache.videos,
                latestVideo: videoCache.latestVideo,
                channelInfo: videoCache.channelInfo
            };
        }
        
        console.log('Kynux API ile video bilgileri güncelleniyor...');
        
        const channelId = config.youtube.channelId;
        
        if (!channelId) {
            throw new Error('Konfigürasyon dosyasında kanal ID tanımlanmamış');
        }
        
        const videos = await getChannelVideos(channelId);
        
        videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        
        const latestVideo = videos.length > 0 ? videos[0] : null;
        
        const channelInfo = {
            id: channelId,
            title: videos.length > 0 ? videos[0].channelTitle : config.youtube.channelName,
            subscriberCount: 'Bilinmiyor',
            videoCount: videos.length
        };
        
        videoCache = {
            lastUpdate: now,
            videos: videos,
            latestVideo: latestVideo,
            channelInfo: channelInfo
        };
        
        console.log(`✅ ${videos.length} video ve kanal bilgileri güncellendi.`);
        if (latestVideo) {
            console.log(`📺 En son video: "${latestVideo.title}" - ${latestVideo.publishedAt}`);
        }
        
        return { videos, latestVideo, channelInfo };
    } catch (error) {
        console.error('Video ve kanal bilgileri güncellenirken hata:', error.message);
        
        if (videoCache.videos.length > 0) {
            console.log('Hata nedeniyle önbellekteki eski veriler kullanılıyor...');
            return {
                videos: videoCache.videos,
                latestVideo: videoCache.latestVideo,
                channelInfo: videoCache.channelInfo
            };
        }
        
        return { 
            videos: [], 
            latestVideo: null,
            channelInfo: {
                id: config.youtube.channelId,
                title: config.youtube.channelName,
                subscriberCount: 'Bilinmiyor',
                videoCount: 0
            }
        };
    }
}

async function getLatestVideoSummary() {
    try {
        const { latestVideo, channelInfo, videos } = await updateChannelAndVideoInfo();
        
        return {
            channelName: channelInfo.title,
            channelId: channelInfo.id,
            subscriberCount: channelInfo.subscriberCount,
            videoCount: videos.length,
            latestVideoFound: !!latestVideo,
            latestVideo: latestVideo ? {
                id: latestVideo.id,
                title: latestVideo.title,
                publishedAt: latestVideo.publishedAt,
                url: latestVideo.url,
                thumbnails: latestVideo.thumbnails
            } : null
        };
    } catch (error) {
        console.error('Son video özeti alınırken hata:', error.message);
        return {
            channelName: config.youtube.channelName,
            channelId: config.youtube.channelId,
            subscriberCount: 'Bilinmiyor',
            videoCount: 0,
            latestVideoFound: false,
            latestVideo: null
        };
    }
}

async function getVideoSearchCriteria() {
    try {
        const { latestVideo, channelInfo } = await updateChannelAndVideoInfo();
        
        if (!latestVideo) {
            throw new Error('Son video bulunamadı');
        }
        
        return {
            channelName: channelInfo.title,
            latestVideoTitle: latestVideo.title,
            cleanTitle: cleanTitle(latestVideo.title),
            videoId: latestVideo.id,
            publishedAt: latestVideo.publishedAt
        };
    } catch (error) {
        console.error('Video arama kriterleri alınırken hata:', error.message);
        
        return {
            channelName: config.youtube.channelName,
            latestVideoTitle: "Son video bilgisi alınamadı",
            cleanTitle: "",
            videoId: "",
            publishedAt: new Date().toISOString()
        };
    }
}

async function getVideoById(videoId) {
    try {
        const { videos } = await updateChannelAndVideoInfo();
        return videos.find(video => video.id === videoId) || null;
    } catch (error) {
        console.error(`${videoId} ID'li video bilgileri alınırken hata:`, error.message);
        return null;
    }
}

async function getLatestVideoId() {
    try {
        const criteria = await getVideoSearchCriteria();
        return criteria.videoId;
    } catch (error) {
        console.error('Son video ID alınırken hata:', error.message);
        return '';
    }
}

module.exports = {
    getChannelVideos,
    updateChannelAndVideoInfo,
    getLatestVideoSummary,
    getVideoSearchCriteria,
    getVideoById,
    cleanTitle,
    getLatestVideoId
};
