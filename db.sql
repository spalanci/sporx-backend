-- Sporx Veritabanı Oluşturma ve Seçme
CREATE DATABASE IF NOT EXISTS `sporx_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `sporx_db`;

-- Foreign Key Kontrollerini Geçici Olarak Kapat (Import Kolaylığı İçin)
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- 1. PORTAL KULLANICILARI TABLOSU (Admin, Eğitmen, Sporcu)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `role` ENUM('admin', 'trainer', 'athlete') NOT NULL DEFAULT 'athlete',
  `first_name` VARCHAR(50) NOT NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1: Aktif, 0: Pasif',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_role` (`role`),
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`role`, `first_name`, `last_name`, `email`, `password`, `phone`, `status`) VALUES
  ('admin', 'Admin', 'Sporx', 'admin@sporx.com', 'admin123', '05550000000', 1),
  ('trainer', 'Burak', 'Kaya', 'burak.kaya@sporx.com', 'password1', '05550000001', 1),
  ('trainer', 'Ceren', 'Gul', 'ceren.gul@sporx.com', 'password2', '05550000002', 1),
  ('athlete', 'Doğa', 'Polat', 'doga.polat@sporx.com', 'password3', '05550000003', 1),
  ('athlete', 'Emre', 'Çetin', 'emre.cetin@sporx.com', 'password4', '05550000004', 1),
  ('athlete', 'Fatma', 'Acar', 'fatma.acar@sporx.com', 'password5', '05550000005', 1),
  ('athlete', 'Gökhan', 'Şimşek', 'gokhan.simsek@sporx.com', 'password6', '05550000006', 1),
  ('athlete', 'Hale', 'Tekin', 'hale.tekin@sporx.com', 'password7', '05550000007', 1);

-- --------------------------------------------------------
-- 2. SPORCULAR TABLOSU (Spor yapmak isteyen kişilerin detayları)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `athletes`;
CREATE TABLE `athletes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `birth_date` DATE DEFAULT NULL,
  `gender` ENUM('male', 'female', 'other') DEFAULT NULL,
  `height` DECIMAL(5,2) DEFAULT NULL COMMENT 'cm cinsinden',
  `weight` DECIMAL(5,2) DEFAULT NULL COMMENT 'kg cinsinden',
  `emergency_contact_phone` VARCHAR(20) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_athletes_users` 
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `athletes` (`user_id`, `birth_date`, `gender`, `height`, `weight`, `emergency_contact_phone`) VALUES
  (4, '1994-03-10', 'female', 168.00, 58.00, '05551111111'),
  (5, '1992-08-22', 'male', 180.00, 76.00, '05552222222'),
  (6, '1996-05-14', 'female', 165.00, 54.00, '05553333333'),
  (7, '1998-11-30', 'male', 178.00, 72.00, '05554444444');

-- --------------------------------------------------------
-- 3. EĞİTİM KATEGORİLERİ TABLOSU
-- --------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `slug` VARCHAR(110) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO `categories` (`name`, `slug`, `description`, `status`) VALUES
  ('Yüzme', 'yuzme', 'Su sporları ve yüzme eğitimleri.', 1),
  ('Fitness', 'fitness', 'Sağlıklı yaşam ve fonksiyonel antrenmanlar.', 1),
  ('Masa Tenisi', 'masa-tenisi', 'Hız ve refleks geliştiren masa tenisi eğitimleri.', 1),
  ('Basketbol', 'basketbol', 'Takım oyunu ve saha stratejileri.', 1),
  ('Voleybol', 'voleybol', 'Smaç, blok ve takım taktikleri.', 1);
-- --------------------------------------------------------
-- 4. SPOR EĞİTİMLERİ / İÇERİK TABLOSU
-- --------------------------------------------------------
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT UNSIGNED NOT NULL,
  `trainer_id` INT UNSIGNED DEFAULT NULL COMMENT 'Eğitmeni tutar (users.id)',
  `title` VARCHAR(150) NOT NULL,
  `description` LONGTEXT DEFAULT NULL,
  `duration_minutes` INT UNSIGNED NOT NULL DEFAULT 60,
  `capacity` INT UNSIGNED NOT NULL DEFAULT 20,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category_id` (`category_id`),
  INDEX `idx_trainer_id` (`trainer_id`),
  CONSTRAINT `fk_courses_categories` 
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) 
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_courses_trainers` 
    FOREIGN KEY (`trainer_id`) REFERENCES `users` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `courses` (`category_id`, `trainer_id`, `title`, `description`, `duration_minutes`, `capacity`, `status`) VALUES
  (1, 2, 'Yüzme Temel Teknikleri', 'Su üzerinde yüzme teknikleri, nefes kontrolü ve doğru form.', 90, 15, 1),
  (1, 2, 'Yüzme Dayanıklılık Antrenmanı', 'Kondisyon artırıcı yüzme çalışmaları.', 120, 12, 1),
  (2, 3, 'Fitness Başlangıç', 'Temel fonksiyonel antreman ve cardio dersleri.', 80, 18, 1),
  (2, 3, 'Metabolik Kondisyon', 'Günlük performans ve dayanıklılık geliştirme.', 90, 16, 1),
  (3, 2, 'Masa Tenisi Hız ve Refleks', 'Top kontrolü ve hızlı karşı vuruş teknikleri.', 75, 14, 1),
  (4, 3, 'Basketbol Hücum Stratejileri', 'Hücum oyun planları ve şut teknikleri.', 100, 16, 1),
  (4, 3, 'Basketbol Savunma Oyunları', 'Alan savunması ve bire bir savunma çalışmaları.', 95, 14, 1),
  (5, 2, 'Voleybol Smaç ve Blok', 'Smaç numaraları ve blok pozisyon güvenliği.', 85, 12, 1),
  (5, 2, 'Voleybol Takım Taktikleri', 'Set yönetimi ve saha rotasyonu.', 100, 12, 1);

-- --------------------------------------------------------
-- 5. SPOR EĞİTİM TARİHLERİ / SEANSLAR TABLOSU
-- --------------------------------------------------------
DROP TABLE IF EXISTS `course_schedules`;
CREATE TABLE `course_schedules` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT UNSIGNED NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `quota` INT UNSIGNED NOT NULL DEFAULT 20,
  `location` VARCHAR(100) DEFAULT 'Main Hall' COMMENT 'Salon/Stüdyo Bilgisi',
  `status` ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_course_date` (`course_id`, `start_time`),
  CONSTRAINT `fk_schedules_courses` 
    FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `course_schedules` (`course_id`, `start_time`, `end_time`, `quota`, `location`, `status`) VALUES
  (1, '2026-08-05 09:00:00', '2026-08-05 10:30:00', 15, 'Havuz 1', 'scheduled'),
  (2, '2026-08-06 10:00:00', '2026-08-06 12:00:00', 12, 'Havuz 2', 'scheduled'),
  (3, '2026-08-07 18:00:00', '2026-08-07 19:20:00', 18, 'Fitness Salonu', 'scheduled'),
  (4, '2026-08-08 17:00:00', '2026-08-08 18:30:00', 16, 'Fitness Salonu', 'scheduled'),
  (5, '2026-08-09 16:00:00', '2026-08-09 17:15:00', 14, 'Spor Salonu', 'scheduled');

-- --------------------------------------------------------
-- 6. SPORCU BAŞVURU / KAYIT TABLOSU
-- --------------------------------------------------------
DROP TABLE IF EXISTS `course_applications`;
CREATE TABLE `course_applications` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `athlete_id` INT UNSIGNED NOT NULL,
  `schedule_id` INT UNSIGNED NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected', 'attended', 'cancelled') NOT NULL DEFAULT 'pending',
  `applied_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `note` VARCHAR(255) DEFAULT NULL,
  UNIQUE KEY `uk_athlete_schedule` (`athlete_id`, `schedule_id`),
  INDEX `idx_application_status` (`status`),
  CONSTRAINT `fk_applications_athletes` 
    FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_applications_schedules` 
    FOREIGN KEY (`schedule_id`) REFERENCES `course_schedules` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `course_applications` (`athlete_id`, `schedule_id`, `status`, `applied_at`, `note`) VALUES
  (1, 1, 'pending', '2026-07-20 12:15:00', 'Hafta sonu yüzme dersi için kaydoldum.'),
  (2, 3, 'approved', '2026-07-19 09:30:00', 'Fitness başlangıç programına kaydım onaylandı.'),
  (3, 5, 'pending', '2026-07-18 17:45:00', 'Masa tenisi çalışmasına kayıt olmak istiyorum.'),
  (4, 4, 'approved', '2026-07-17 11:20:00', 'Voleybol taktik çalışmasına talibim.'),
  (4, 2, 'rejected', '2026-07-16 14:10:00', 'Yüzme dayanıklılık dersi doluymuş, tekrar başvuru yapacağım.');

-- --------------------------------------------------------
-- 7. İLETİŞİM TABLOSU
-- --------------------------------------------------------
DROP TABLE IF EXISTS `contacts`;
CREATE TABLE `contacts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `subject` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0: Okunmadı, 1: Okundu',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `contacts` (`full_name`, `email`, `phone`, `subject`, `message`, `is_read`) VALUES
  ('Ali Demir', 'ali.demir@example.com', '05555550001', 'Kurs detayları', 'Fitness kursu kayıt ücretini öğrenmek istiyorum.', 0),
  ('Beyza Aksoy', 'beyza.aksoy@example.com', '05555550002', 'Deneme ders', 'Yüzme kursu için deneme dersine kayıt olmak istiyorum.', 0),
  ('Cem Yıldız', 'cem.yildiz@example.com', '05555550003', 'Saatler', 'Basketbol antrenman saatleri nelerdir?', 1),
  ('Deniz Korkmaz', 'deniz.korkmaz@example.com', '05555550004', 'Eğitmen', 'Yeni antrenör kim olacak?', 0),
  ('Elif Şahin', 'elif.sahin@example.com', '05555550005', 'Kampanya', 'Üyelik kampanyası devam ediyor mu?', 1);

-- --------------------------------------------------------
-- 8. SABİT SAYFALAR TABLOSU
-- --------------------------------------------------------
DROP TABLE IF EXISTS `static_pages`;
CREATE TABLE `static_pages` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `type_flag` ENUM('about', 'intro', 'contact', 'banner') NOT NULL UNIQUE,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `title` VARCHAR(150) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_type_flag` (`type_flag`),
  INDEX `idx_status_sort` (`status`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `static_pages` (`type_flag`, `slug`, `title`, `content`, `status`, `sort_order`) VALUES
  ('about', 'hakkinda', 'Hakkında', 'Kurumumuzun hikâyesi, misyonu ve değerleri burada yer alır. Bu içerik yönetim panelinden güncellenebilir.', 1, 1),
  ('intro', 'tanitim', 'Tanıtım', 'Tanıtım sayfası, kurumun tanıtım metni ve misyon bildirimi için kullanılır. Yeni sayfalar aynı yapı ile kolayca genişletilebilir.', 1, 2),
  ('contact', 'iletisim', 'İletişim', 'İletişim sayfası, iletişim bilgileri ve yönetsel iletişim alanları için hazırlanmıştır.', 1, 3),
  ('banner', 'banner', 'Banner', 'Banner alanı, ana sayfa görseli ve kampanya başlıkları için kullanılabilir.', 1, 4);

-- --------------------------------------------------------
-- 9. DUYURULAR TABLOSU
-- --------------------------------------------------------
DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `author_id` INT UNSIGNED DEFAULT NULL COMMENT 'Duyuruyu yayınlayan admin (users.id)',
  `title` VARCHAR(200) NOT NULL,
  `content` TEXT NOT NULL,
  `target_role` ENUM('all', 'trainer', 'athlete') NOT NULL DEFAULT 'all',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_target_active` (`target_role`, `is_active`),
  CONSTRAINT `fk_announcements_authors` 
    FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Örnek duyuru verileri (demo seed)
INSERT INTO `announcements` (`author_id`, `title`, `content`, `target_role`, `is_active`, `created_at`) VALUES
 (NULL, 'Yaz Kursları Başlıyor', 'Yaz dönemi kurs kayıtlarımız başladı. Erken kayıt fırsatlarını kaçırmayın!', 'all', 1, '2026-06-01 09:00:00'),
 (NULL, 'Havuz Bakımı', 'Havuz bakımı nedeniyle 10 Temmuz tarihinde yüzme dersleri iptal edilecektir.', 'all', 1, '2026-06-15 12:00:00'),
 (NULL, 'Yeni Eğitmen Duyurusu', 'Ağırlık çalışmaları için yeni eğitmenimiz Ekrem Arslan aramıza katıldı.', 'trainer', 1, '2026-07-01 08:00:00'),
 (NULL, 'Hafta Sonu Seansları', 'Hafta sonu yoğunluğu nedeniyle ek seanslar açılmıştır. Detaylar takvimde.', 'athlete', 1, '2026-07-05 10:30:00'),
 (NULL, 'Üyelik Kampanyası', 'Bu ay yeni üyelere özel %20 indirim uygulanacaktır. Kayıt masasıyla iletişime geçin.', 'all', 1, '2026-07-10 14:00:00'),
 (NULL, 'Tenis Kort Yenileme', 'Tenis kortu yenilenme çalışması tamamlandı. Kortlar kullanıma açıktır.', 'all', 1, '2026-07-15 09:30:00'),
 (NULL, 'Fitness Programı Güncellemesi', 'Fitness kurslarımızda yeni seans takvimiyle devam ediyoruz.', 'all', 1, '2026-07-18 11:00:00'),
 (NULL, 'Çocuk Yüzme Sınıfları', 'Çocuklar için yaz yüzme sınıfları kaydı açıldı.', 'all', 1, '2026-07-20 09:00:00'),
 (NULL, 'Bireysel Antrenman', 'Bireysel antrenman paketi için özel saatler eklendi.', 'trainer', 1, '2026-07-21 12:00:00'),
 (NULL, 'Kurs İçeriği Güncellemesi', 'Masa tenisi kurs içerikleri yeni tekniklerle güncellendi.', 'trainer', 1, '2026-07-22 10:30:00'),
 (NULL, 'Sporcu Sağlığı Bilgilendirmesi', 'Tüm sporcular için beslenme semineri düzenlenecektir.', 'athlete', 1, '2026-07-23 15:00:00'),
 (NULL, 'Yaz Dönemi Kampı', 'Yaz tatili döneminde kamp programları planlandı.', 'all', 1, '2026-07-24 09:20:00'),
 (NULL, 'Kayıt Yenileme Hatırlatması', 'Mevcut üyeler için kayıt yenileme dönemi başladı.', 'all', 1, '2026-07-25 08:45:00'),
 (NULL, 'Yeni Salon Açılışı', 'Ağırlık kaldırma salonumuz yeni ekipmanlarla açıldı.', 'all', 1, '2026-07-26 14:15:00'),
 (NULL, 'Voleybol Takım Seçmeleri', 'Voleybol seçmeleri hafta sonunda yapılacaktır.', 'athlete', 1, '2026-07-27 10:00:00'),
 (NULL, 'Salon Kuralları Hatırlatma', 'Tüm üyelerin salon kurallarına uyması önemlidir.', 'all', 1, '2026-07-28 09:00:00'),
 (NULL, 'Kış Dönemi Ön Kayıt', 'Kış dönemi kursları için ön kayıt süreci başlıyor.', 'all', 1, '2026-07-29 08:30:00'),
 (NULL, 'Sporcu Performans Testi', 'Sporcular için performans testleri düzenlenecektir.', 'athlete', 1, '2026-07-30 11:45:00'),
 (NULL, 'Webinar Duyurusu', 'Online spor ve beslenme webinarımıza kayıt olun.', 'all', 1, '2026-07-31 16:00:00'),
 (NULL, 'Eğitmen Toplantısı', 'Eğitmenler toplantısı pazar sabahı yapılacaktır.', 'trainer', 1, '2026-08-01 09:30:00');

-- Foreign Key Kontrollerini Tekrar Aç
SET FOREIGN_KEY_CHECKS = 1;