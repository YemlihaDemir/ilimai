import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Veritabanı sıfırlanıyor ve örnek verilerle dolduruluyor (Seeding)...");

  // Önceki verileri temizle
  await prisma.examResult.deleteMany();
  await prisma.question.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.dailyTask.deleteMany();
  await prisma.flashcard.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.user.deleteMany();

  // 1. Örnek Kullanıcı Oluştur
  const user = await prisma.user.create({
    data: {
      name: "Ahmet Hoca",
      email: "ahmet@ilimai.com",
      role: "STUDENT",
      progress: {
        create: {
          streakDays: 12,
          targetCompletion: 45,
          fikihScore: 78,
          kelamScore: 65,
          memorizedAyahs: 124,
          flashcardsToReview: 8,
        },
      },
      dailyTasks: {
        create: [
          { title: "MBSTS Fıkıh Modülü", type: "Konu Anlatımı", timeOrCount: "45 dk", active: true, order: 1 },
          { title: "DİA 'Namaz' Maddesi Okuması", type: "RAG Okuması", timeOrCount: "15 dk", order: 2 },
          { title: "Aralıklı Tekrar (Spaced Repetition)", type: "Kelime / Kavram", timeOrCount: "20 Kart", order: 3 },
          { title: "Günün Denemesi: MBSTS Mini", type: "Soru Çözümü", timeOrCount: "10 Soru", order: 4 },
        ],
      },
    },
  });

  // 2. Dersler (Courses) ve Konular (Lessons)
  const courseMbsts = await prisma.course.create({
    data: {
      title: "MBSTS Hazırlık",
      category: "MBSTS",
      description: "Mesleki Bilgiler Seviye Tespit Sınavı için kapsamlı hazırlık seti.",
      lessons: {
        create: [
          { title: "İslam İbadet Esasları", content: "Namaz, Oruç, Zekat ve Hac konularının Diyanet İşleri Başkanlığı kaynaklarına göre detaylı anlatımı...", order: 1 },
          { title: "Kur'an Tarihi ve Tecvid", content: "Kur'an'ın cem'i, istinsahı ve kıraat imamları hakkında temel bilgiler...", order: 2 },
        ],
      },
    },
  });

  const courseGys = await prisma.course.create({
    data: {
      title: "GYS (Görevde Yükselme Sınavı)",
      category: "GYS",
      description: "Diyanet personeli Görevde Yükselme Sınavı mevzuat ve teşkilat konuları.",
      lessons: {
        create: [
          { title: "Diyanet Teşkilat Kanunu", content: "633 sayılı Diyanet İşleri Başkanlığı Kuruluş ve Görevleri Hakkında Kanun özeti...", order: 1 },
          { title: "Devlet Memurları Kanunu", content: "657 sayılı kanunun Diyanet personeline bakan yönleri, disiplin cezaları...", order: 2 },
        ],
      },
    },
  });

  // 3. Deneme Sınavları ve Sorular
  const exam = await prisma.exam.create({
    data: {
      title: "MBSTS Mini Deneme 1",
      category: "MBSTS",
      questions: {
        create: [
          {
            topic: "Fıkıh",
            question: "Aşağıdakilerden hangisi namazın rükünlerinden (içindeki farzlar) biri değildir?",
            optionA: "İftitah Tekbiri",
            optionB: "Kıyam",
            optionC: "Kıraat",
            optionD: "Secde",
            optionE: "Necasetten Taharet",
            correct: "E",
            explanation: "Necasetten Taharet, namazın rükünlerinden (içindeki farzlar) değil, şartlarından (dışındaki farzlar) biridir.",
          },
          {
            topic: "Tefsir",
            question: "Kur'an-ı Kerim'de 'Besmele' ile başlamayan tek sure aşağıdakilerden hangisidir?",
            optionA: "Fatiha",
            optionB: "Tevbe",
            optionC: "Yasin",
            optionD: "Mülk",
            optionE: "İhlas",
            correct: "B",
            explanation: "Tevbe suresi, Kur'an'da başında Besmele bulunmayan tek suredir.",
          },
          {
            topic: "Siyer",
            question: "Peygamber Efendimiz (s.a.v) ile Hz. Hatice'nin evliliğine ne ad verilir?",
            optionA: "Hılfu'l Fudul",
            optionB: "Darü'n Nedve",
            optionC: "Mübahele",
            optionD: "Zifaf",
            optionE: "Böyle özel bir isim yoktur, Muvahat kardeşlik demektir.",
            correct: "E",
            explanation: "Hz. Peygamber ve Hz. Hatice'nin evlilik törenine özel bir ad verilmemiştir. Sıklıkla diğer kavramlarla karıştırılır.",
          }
        ],
      },
    },
  });

  // 4. Flashcards (Spaced Repetition için)
  await prisma.flashcard.createMany({
    data: [
      { userId: user.id, topic: "Fıkıh", front: "Namazın Şartları Kaçtır?", back: "6'dır. (Hades, Necaset, Setr-i Avret, İstikbal-i Kıble, Vakit, Niyet)" },
      { userId: user.id, topic: "Siyer", front: "Bedir Savaşı Hangi Yıl Yapılmıştır?", back: "Hicretin 2. Yılı (Miladi 624)" },
      { userId: user.id, topic: "GYS", front: "Diyanet İşleri Başkanlığı hangi bakanlığa bağlıdır?", back: "Cumhurbaşkanlığına bağlıdır." },
    ],
  });

  console.log("Seed işlemi başarıyla tamamlandı.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
