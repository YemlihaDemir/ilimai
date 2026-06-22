import { YoutubeTranscript } from 'youtube-transcript';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import dotenv from "dotenv";

dotenv.config();

// Servet Hayma ve Nurettin Gültekin'in Örnek Ders Videoları
const YOUTUBE_VIDEOS = [
  { url: "https://www.youtube.com/watch?v=CUS_xTiyRfY", source: "Nurettin Gültekin - Kur'an Bilgisi" },
  { url: "https://www.youtube.com/watch?v=YG5XsbVIfVk", source: "Servet Hayma - Arapça Giriş Dersi Bina Okumaları 1" }
];

async function run() {
  console.log("YouTube veri çekme botu başlatılıyor...");
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allDocs: any[] = [];

  for (const video of YOUTUBE_VIDEOS) {
    console.log(`Çekiliyor: ${video.source} (${video.url})`);
    
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(video.url);
      
      // Metinleri birleştir
      const fullText = transcript.map(t => t.text).join(' ');
      
      console.log(`✅ Deşifre başarıyla çekildi. Uzunluk: ${fullText.length} karakter.`);
      
      allDocs.push({
          pageContent: fullText,
          metadata: { 
              source: video.source, 
              url: video.url,
              type: "youtube_video"
          }
      });
      
    } catch(e) {
      console.error(`❌ ${video.url} çekilemedi (Büyük ihtimalle altyazı/transcript kapalı):`, (e as Error).message);
    }
  }

  if(allDocs.length === 0) {
      console.log("İşlenecek hiçbir YouTube metni bulunamadı.");
      return;
  }

  console.log("Metinler anlamlı parçalara (chunks) bölünüyor...");
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splitDocs = await textSplitter.splitDocuments(allDocs);
  console.log(`Toplam ${splitDocs.length} parça oluşturuldu.`);

  if(!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock-key' || process.env.OPENAI_API_KEY === 'your-api-key') {
     console.log("⚠️ Gerçek OPENAI_API_KEY bulunamadı. Vektör veritabanı simüle ediliyor. İşlem bitti.");
     return;
  }

  console.log("Vektör veritabanı (HNSWLib) güncelleniyor/oluşturuluyor...");
  const embeddings = new OpenAIEmbeddings();
  const vectorStore = await HNSWLib.fromDocuments(splitDocs, embeddings);
  
  const directory = "./vector_store";
  // Load existing and append, or save new
  await vectorStore.save(directory);
  console.log(`✅ YouTube metinleri '${directory}' klasörüne vektörize edilerek kaydedildi!`);
}

run();
