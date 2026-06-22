import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding veritabanı başlatılıyor...')

  // Veritabanını temizle
  await prisma.dailyTask.deleteMany()
  await prisma.progress.deleteMany()
  await prisma.user.deleteMany()

  // Kullanıcı Oluştur (Demo Ahmet Hoca)
  const user = await prisma.user.create({
    data: {
      name: 'Ahmet Hoca',
      email: 'ahmet@ilahiyat.demo',
      role: 'STUDENT',
      progress: {
        create: {
          streakDays: 12,
          targetCompletion: 65,
          fikihScore: 78,
          kelamScore: 45,
          memorizedAyahs: 124,
          flashcardsToReview: 42
        }
      },
      dailyTasks: {
        create: [
          {
            title: 'Fıkıh: Hac İbadeti ve Şartları',
            type: 'Konu Anlatımı',
            timeOrCount: '15 dk',
            completed: true,
            active: false,
            order: 1
          },
          {
            title: 'MBSTS Fıkıh Mini Denemesi',
            type: 'Soru Çözümü',
            timeOrCount: '10 Soru',
            completed: false,
            active: true,
            order: 2
          },
          {
            title: 'Arapça YDS Kelimeleri (Set 4)',
            type: 'Aralıklı Tekrar',
            timeOrCount: '20 Kelime',
            completed: false,
            active: false,
            order: 3
          }
        ]
      }
    }
  })

  console.log(`Demo Kullanıcı oluşturuldu: ${user.name}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('Seeding başarıyla tamamlandı.')
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
