import { YoutubeTranscript } from 'youtube-transcript';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

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

  if(!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'mock-key') {
     console.log("⚠️ Gerçek GOOGLE_API_KEY bulunamadı. Vektör veritabanı simüle ediliyor. İşlem bitti.");
     return;
  }

  console.log("Vektör veritabanı (HNSWLib - Google) güncelleniyor/oluşturuluyor...");
  const embeddings = new GoogleGenerativeAIEmbeddings({
     model: "text-embedding-004", 
     apiKey: process.env.GOOGLE_API_KEY
  });
  
  const directory = "./vector_store";
  let vectorStore;

  if (fs.existsSync(directory)) {
      console.log("📁 Mevcut vektör veritabanı belleğe alınıyor...");
      vectorStore = await HNSWLib.load(directory, embeddings);
      await vectorStore.addDocuments(splitDocs);
  } else {
      vectorStore = await HNSWLib.fromDocuments(splitDocs, embeddings);
  }
  
  await vectorStore.save(directory);
  console.log(`✅ YouTube metinleri '${directory}' klasörüne vektörize edilerek kaydedildi!`);
}

run();
