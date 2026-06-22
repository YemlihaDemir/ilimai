import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import dotenv from "dotenv";

dotenv.config();

// DİA Maddelerinin Linkleri (Örnek)
const DIA_URLS = [
  "https://islamansiklopedisi.org.tr/namaz",
  "https://islamansiklopedisi.org.tr/zekat",
];

async function run() {
  console.log("Diyanet İslam Ansiklopedisi (DİA) verileri çekiliyor...");
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allDocs: any[] = [];

  for (const url of DIA_URLS) {
    console.log(`Çekiliyor: ${url}`);
    // Drop selector to pull entire body text to ensure we get data
    const loader = new CheerioWebBaseLoader(url);
    
    try {
      const docs = await loader.load();
      if(docs.length === 0 || !docs[0].pageContent.trim()) {
         console.warn(`⚠️ ${url} adresinden metin okunamadı.`);
      }
      // Inject metadata
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enrichedDocs = docs.map((doc: any) => ({
          ...doc,
          metadata: { ...doc.metadata, source: "Diyanet İslam Ansiklopedisi", url: url }
      }));
      allDocs.push(...enrichedDocs);
      console.log(`✅ ${url} başarıyla çekildi. Parça sayısı: ${docs.length}`);
    } catch(e) {
      console.error(`❌ ${url} çekilemedi:`, e);
    }
  }

  console.log("Metinler anlamlı parçalara (chunks) bölünüyor...");
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splitDocs = await textSplitter.splitDocuments(allDocs);
  console.log(`Toplam ${splitDocs.length} parça oluşturuldu.`);

  if(!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'mock-key' || process.env.OPENAI_API_KEY === 'your-api-key') {
     console.log("⚠️ Gerçek OPENAI_API_KEY bulunamadı. Vektör veritabanı simüle ediliyor.");
     return;
  }

  console.log("Vektör veritabanı (HNSWLib) oluşturuluyor...");
  const embeddings = new OpenAIEmbeddings();
  const vectorStore = await HNSWLib.fromDocuments(splitDocs, embeddings);
  
  const directory = "./vector_store";
  await vectorStore.save(directory);
  console.log(`✅ Vektör veritabanı '${directory}' klasörüne kaydedildi!`);
}

run();
