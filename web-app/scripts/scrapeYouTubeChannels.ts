import { YoutubeTranscript } from 'youtube-transcript';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import ytsr from 'ytsr';
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Hedef Kanallar (Arama terimi olarak kullanılacak)
const TARGET_CHANNELS = [
  "Nurettin Gültekin",
  "Servet Hayma",
  "Asya Tekin",
  "Yediiklim Yayıncılık",
  "Yargı Plus"
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log("🚀 Devasa YouTube Eğitim Seti Scraping Botu Başlatılıyor (ytsr via search)...");
  console.log("NOT: YouTube Rate Limitlerini (IP Ban) aşmamak için bot yavaş çalışacak ve batch'ler halinde indirecektir.\n");

  const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY || "mock-key" });
  let vectorStore: HNSWLib | null = null;
  const directory = "./vector_store";

  if (fs.existsSync(directory) && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'mock-key') {
      console.log("📁 Mevcut vektör veritabanı belleğe alınıyor...");
      vectorStore = await HNSWLib.load(directory, embeddings);
  }

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  for (const channel of TARGET_CHANNELS) {
      console.log(`\n======================================================`);
      console.log(`📡 Kanal Aranıyor: ${channel}`);
      
      try {
          // Arama yap
          const searchResults = await ytsr(channel, { limit: 5 }); // Sadece ilk 5 videoyu çekelim test için
          const videos = searchResults.items.filter(item => item.type === 'video');
          
          console.log(`Toplam ${videos.length} video bulundu.`);

          for (const video of videos) {
              // ytsr Video object type hack
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const v: any = video;
              
              console.log(`\n▶️ İşleniyor: [${v.title}] (${v.url})`);
              try {
                  const transcript = await YoutubeTranscript.fetchTranscript(v.url);
                  const fullText = transcript.map(t => t.text).join(' ');
                  console.log(`✅ Altyazı çekildi. Uzunluk: ${fullText.length} karakter.`);

                  const doc = {
                      pageContent: fullText,
                      metadata: {
                          source: channel,
                          title: v.title,
                          url: v.url,
                          type: "youtube_video"
                      }
                  };

                  console.log(`✂️ Metin vektör parçalarına ayrılıyor...`);
                  const splitDocs = await textSplitter.splitDocuments([doc]);
                  
                  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock-key' || process.env.OPENAI_API_KEY === 'your-api-key') {
                      console.log(`⚠️ Mock Modu: ${splitDocs.length} parça oluşturuldu ancak DB'ye kaydedilmedi.`);
                  } else {
                      if(!vectorStore) {
                          vectorStore = await HNSWLib.fromDocuments(splitDocs, embeddings);
                      } else {
                          await vectorStore.addDocuments(splitDocs);
                      }
                      await vectorStore.save(directory);
                      console.log(`💾 Veritabanına başarıyla eklendi!`);
                  }

              } catch (e) {
                   console.error(`❌ Video Deşifresi alınamadı (Büyük ihtimalle altyazı kapalı): ${(e as Error).message}`);
              }
              
              // Anti-Ban Gecikmesi
              console.log("⏳ YouTube ban yememek için 5 saniye bekleniyor...");
              await sleep(5000);
          }
      } catch (err) {
          console.error(`Kanal araması başarısız oldu: ${channel}`, err);
      }
  }

  console.log("\n🎉 TÜM İŞLEMLER TAMAMLANDI!");
}

run();
