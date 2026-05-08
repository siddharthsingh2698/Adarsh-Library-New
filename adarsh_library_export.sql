mysqldump : mysqldump: [Warning] Using a password on the command line 
interface can be insecure.
At line:1 char:1
+ mysqldump -u root "-pSidd@!2698" adarsh_library --no-tablespaces 
--sk ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (mysqldump: [War...an be i 
   nsecure.:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: adarsh_library
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT  IGNORE INTO `admins` VALUES ('677bfd0d-489b-11f1-9b20-98bd802ca29e','Admin','admin@adarsh.library','$2b$10$M9VWgWbOt3aqPSjd1coinuTU72mqTM1kwZSwWRMQaGuBVRL3MNUyS','2026-05-05 15:59:31');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `checkins`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `checkins` (
  `id` varchar(36) NOT NULL,
  `student_id` varchar(36) NOT NULL,
  `seat_id` varchar(36) DEFAULT NULL,
  `slot_id` varchar(36) DEFAULT NULL,
  `check_in_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `check_out_at` timestamp NULL DEFAULT NULL,
  `method` enum('manual','qr','self') DEFAULT 'manual',
  `flagged` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `overtime_notified` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `checkins_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `checkins`
--

LOCK TABLES `checkins` WRITE;
/*!40000 ALTER TABLE `checkins` DISABLE KEYS */;
INSERT  IGNORE INTO `checkins` VALUES ('0d51f5c7-49e6-11f1-9b20-98bd802ca29e','61e7a760-49da-11f1-9b20-98bd802ca29e',NULL,NULL,'2026-05-07 07:26:23','2026-05-07 07:28:40','qr',0,'2026-05-07 07:26:23',0),('95598b23-49de-11f1-9b20-98bd802ca29e','3756b4f5-490d-11f1-9b20-98bd802ca29e','76b95881-4908-11f1-9b20-98bd802ca29e','677f7118-489b-11f1-9b20-98bd802ca29e','2026-05-07 06:32:56','2026-05-07 07:18:24','qr',0,'2026-05-07 06:32:56',0);
/*!40000 ALTER TABLE `checkins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fees`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fees` (
  `id` varchar(36) NOT NULL,
  `student_id` varchar(36) NOT NULL,
  `slot_id` varchar(36) DEFAULT NULL,
  `locker_id` varchar(36) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `due_date` date NOT NULL,
  `paid_date` date DEFAULT NULL,
  `payment_mode` enum('cash','upi','bank','waiver') DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `status` enum('paid','pending','overdue','waived') DEFAULT 'pending',
  `receipt_url` varchar(500) DEFAULT NULL,
  `notes` text,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `fees_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fees`
--

LOCK TABLES `fees` WRITE;
/*!40000 ALTER TABLE `fees` DISABLE KEYS */;
INSERT  IGNORE INTO `fees` VALUES ('0f5dd80e-49de-11f1-9b20-98bd802ca29e','06f690e8-4909-11f1-9b20-98bd802ca29e','677ea283-489b-11f1-9b20-98bd802ca29e',NULL,800.00,'2026-06-07',NULL,NULL,NULL,'pending',NULL,NULL,NULL,'2026-05-07 06:29:11'),('86a809e0-49da-11f1-9b20-98bd802ca29e','3756b4f5-490d-11f1-9b20-98bd802ca29e','677f7118-489b-11f1-9b20-98bd802ca29e',NULL,2500.00,'2026-06-07',NULL,NULL,NULL,'pending',NULL,NULL,NULL,'2026-05-07 06:03:53'),('d2fc9061-490b-11f1-9b20-98bd802ca29e','06f690e8-4909-11f1-9b20-98bd802ca29e','677f7118-489b-11f1-9b20-98bd802ca29e',NULL,800.00,'2026-06-06','2026-05-06','cash','sidd57165@oksbi','paid',NULL,'Null',NULL,'2026-05-06 05:24:15');
/*!40000 ALTER TABLE `fees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `library_config`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `library_config` (
  `id` varchar(36) NOT NULL,
  `library_name` varchar(100) DEFAULT 'Adarsh Library',
  `logo_url` varchar(500) DEFAULT NULL,
  `open_time` time DEFAULT '06:00:00',
  `close_time` time DEFAULT '22:00:00',
  `open_days` json DEFAULT NULL,
  `fee_reminder_days` json DEFAULT NULL,
  `notification_channel` varchar(10) DEFAULT 'email',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `library_config`
--

LOCK TABLES `library_config` WRITE;
/*!40000 ALTER TABLE `library_config` DISABLE KEYS */;
INSERT  IGNORE INTO `library_config` VALUES ('677ce29c-489b-11f1-9b20-98bd802ca29e','Adarsh Library',NULL,'06:00:00','22:00:00','[\"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\", \"Sat\", \"Sun\"]','[7, 3, 1]','email','2026-05-06 04:56:08');
/*!40000 ALTER TABLE `library_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `locker_allotments`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `locker_allotments` (
  `id` varchar(36) NOT NULL,
  `student_id` varchar(36) NOT NULL,
  `locker_id` varchar(36) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `key_given` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `locker_id` (`locker_id`),
  CONSTRAINT `locker_allotments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `locker_allotments_ibfk_2` FOREIGN KEY (`locker_id`) REFERENCES `lockers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `locker_allotments`
--

LOCK TABLES `locker_allotments` WRITE;
/*!40000 ALTER TABLE `locker_allotments` DISABLE KEYS */;
/*!40000 ALTER TABLE `locker_allotments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lockers`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lockers` (
  `id` varchar(36) NOT NULL,
  `locker_number` varchar(20) NOT NULL,
  `status` enum('available','assigned','maintenance') DEFAULT 'available',
  `monthly_fee` decimal(10,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `locker_number` (`locker_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lockers`
--

LOCK TABLES `lockers` WRITE;
/*!40000 ALTER TABLE `lockers` DISABLE KEYS */;
INSERT  IGNORE INTO `lockers` VALUES ('6793a1aa-489b-11f1-9b20-98bd802ca29e','L01','available',200.00,'2026-05-05 15:59:32'),('6793fa9c-489b-11f1-9b20-98bd802ca29e','L02','available',200.00,'2026-05-05 15:59:32'),('67945cfd-489b-11f1-9b20-98bd802ca29e','L03','available',200.00,'2026-05-05 15:59:32'),('6794a628-489b-11f1-9b20-98bd802ca29e','L04','available',200.00,'2026-05-05 15:59:32'),('6794f913-489b-11f1-9b20-98bd802ca29e','L05','available',200.00,'2026-05-05 15:59:32'),('67954894-489b-11f1-9b20-98bd802ca29e','L06','available',200.00,'2026-05-05 15:59:32'),('67958fea-489b-11f1-9b20-98bd802ca29e','L07','available',200.00,'2026-05-05 15:59:32'),('6795cf42-489b-11f1-9b20-98bd802ca29e','L08','available',200.00,'2026-05-05 15:59:32'),('67962072-489b-11f1-9b20-98bd802ca29e','L09','available',200.00,'2026-05-05 15:59:32'),('67966b7a-489b-11f1-9b20-98bd802ca29e','L10','available',200.00,'2026-05-05 15:59:32'),('6796af1f-489b-11f1-9b20-98bd802ca29e','L11','available',200.00,'2026-05-05 15:59:32'),('6796ef05-489b-11f1-9b20-98bd802ca29e','L12','available',200.00,'2026-05-05 15:59:32'),('67975d60-489b-11f1-9b20-98bd802ca29e','L13','available',200.00,'2026-05-05 15:59:32'),('6797a671-489b-11f1-9b20-98bd802ca29e','L14','available',200.00,'2026-05-05 15:59:32'),('6797ec2a-489b-11f1-9b20-98bd802ca29e','L15','available',200.00,'2026-05-05 15:59:32'),('67984a6a-489b-11f1-9b20-98bd802ca29e','L16','available',200.00,'2026-05-05 15:59:32'),('679895d5-489b-11f1-9b20-98bd802ca29e','L17','available',200.00,'2026-05-05 15:59:32'),('6798d6f9-489b-11f1-9b20-98bd802ca29e','L18','available',200.00,'2026-05-05 15:59:32'),('67991e22-489b-11f1-9b20-98bd802ca29e','L19','available',200.00,'2026-05-05 15:59:32'),('67997210-489b-11f1-9b20-98bd802ca29e','L20','available',200.00,'2026-05-05 15:59:32');
/*!40000 ALTER TABLE `lockers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` varchar(36) NOT NULL,
  `student_id` varchar(36) DEFAULT NULL,
  `type` enum('fee_reminder','overdue','slot_expiry','seat_alarm','broadcast') DEFAULT NULL,
  `channel` enum('email','sms','both') DEFAULT NULL,
  `message` text NOT NULL,
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('sent','failed','pending') DEFAULT 'pending',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seat_allotments`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seat_allotments` (
  `id` varchar(36) NOT NULL,
  `student_id` varchar(36) NOT NULL,
  `seat_id` varchar(36) NOT NULL,
  `slot_id` varchar(36) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `seat_id` (`seat_id`),
  KEY `slot_id` (`slot_id`),
  CONSTRAINT `seat_allotments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `seat_allotments_ibfk_2` FOREIGN KEY (`seat_id`) REFERENCES `seats` (`id`),
  CONSTRAINT `seat_allotments_ibfk_3` FOREIGN KEY (`slot_id`) REFERENCES `time_slots` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seat_allotments`
--

LOCK TABLES `seat_allotments` WRITE;
/*!40000 ALTER TABLE `seat_allotments` DISABLE KEYS */;
INSERT  IGNORE INTO `seat_allotments` VALUES ('0f5b1079-49de-11f1-9b20-98bd802ca29e','06f690e8-4909-11f1-9b20-98bd802ca29e','76b8d543-4908-11f1-9b20-98bd802ca29e','677ea283-489b-11f1-9b20-98bd802ca29e','2026-05-07','2026-06-07',1,'2026-05-07 06:29:11'),('86a54b2d-49da-11f1-9b20-98bd802ca29e','3756b4f5-490d-11f1-9b20-98bd802ca29e','76b95881-4908-11f1-9b20-98bd802ca29e','677f7118-489b-11f1-9b20-98bd802ca29e','2026-05-07','2026-06-07',1,'2026-05-07 06:03:53');
/*!40000 ALTER TABLE `seat_allotments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seats`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seats` (
  `id` varchar(36) NOT NULL,
  `seat_number` varchar(20) NOT NULL,
  `row_num` int NOT NULL,
  `col_num` int NOT NULL,
  `zone` varchar(50) DEFAULT NULL,
  `status` enum('available','occupied','reserved','maintenance') DEFAULT 'available',
  `has_power` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `has_locker` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `seat_number` (`seat_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seats`
--

LOCK TABLES `seats` WRITE;
/*!40000 ALTER TABLE `seats` DISABLE KEYS */;
INSERT  IGNORE INTO `seats` VALUES ('76b45466-4908-11f1-9b20-98bd802ca29e','1',1,1,'Zone A','available',0,'2026-05-06 05:00:12',0),('76b5564f-4908-11f1-9b20-98bd802ca29e','2',1,2,'Zone A','available',0,'2026-05-06 05:00:12',0),('76b5fe44-4908-11f1-9b20-98bd802ca29e','3',1,3,'Zone A','available',0,'2026-05-06 05:00:12',0),('76b69a26-4908-11f1-9b20-98bd802ca29e','4',1,4,'Zone A','available',1,'2026-05-06 05:00:12',0),('76b7300b-4908-11f1-9b20-98bd802ca29e','5',1,5,'Zone A','available',0,'2026-05-06 05:00:12',0),('76b7b078-4908-11f1-9b20-98bd802ca29e','6',1,6,'Zone A','available',0,'2026-05-06 05:00:12',0),('76b8473d-4908-11f1-9b20-98bd802ca29e','7',1,7,'Zone A','available',0,'2026-05-06 05:00:12',0),('76b8d543-4908-11f1-9b20-98bd802ca29e','8',1,8,'Zone A','occupied',1,'2026-05-06 05:00:12',0),('76b95881-4908-11f1-9b20-98bd802ca29e','9',1,9,'Zone A','occupied',0,'2026-05-06 05:00:12',1),('76b9e6f4-4908-11f1-9b20-98bd802ca29e','10',1,10,'Zone A','available',0,'2026-05-06 05:00:12',1),('76ba79a4-4908-11f1-9b20-98bd802ca29e','11',1,11,'Zone A','available',0,'2026-05-06 05:00:12',1),('76bb0445-4908-11f1-9b20-98bd802ca29e','12',1,12,'Zone A','available',1,'2026-05-06 05:00:12',1),('76bb7cc1-4908-11f1-9b20-98bd802ca29e','13',2,1,'Zone A','available',0,'2026-05-06 05:00:12',1),('76bc08f0-4908-11f1-9b20-98bd802ca29e','14',2,2,'Zone A','available',0,'2026-05-06 05:00:12',1),('76bc8d1e-4908-11f1-9b20-98bd802ca29e','15',2,3,'Zone A','available',0,'2026-05-06 05:00:12',1),('76bd0716-4908-11f1-9b20-98bd802ca29e','16',2,4,'Zone A','available',1,'2026-05-06 05:00:12',1),('76bd8de3-4908-11f1-9b20-98bd802ca29e','17',2,5,'Zone A','available',0,'2026-05-06 05:00:12',1),('76be08b4-4908-11f1-9b20-98bd802ca29e','18',2,6,'Zone A','available',0,'2026-05-06 05:00:12',1),('76be8951-4908-11f1-9b20-98bd802ca29e','19',2,7,'Zone A','available',0,'2026-05-06 05:00:12',1),('76bef6c5-4908-11f1-9b20-98bd802ca29e','20',2,8,'Zone A','available',1,'2026-05-06 05:00:12',1),('76bf873c-4908-11f1-9b20-98bd802ca29e','21',2,9,'Zone A','available',0,'2026-05-06 05:00:12',1),('76c01bc5-4908-11f1-9b20-98bd802ca29e','22',2,10,'Zone A','available',0,'2026-05-06 05:00:12',1),('76c0ac2f-4908-11f1-9b20-98bd802ca29e','23',2,11,'Zone A','available',0,'2026-05-06 05:00:12',1),('76c14532-4908-11f1-9b20-98bd802ca29e','24',2,12,'Zone A','available',1,'2026-05-06 05:00:12',1),('76c1f2db-4908-11f1-9b20-98bd802ca29e','25',3,1,'Zone A','available',0,'2026-05-06 05:00:12',1),('76c28cc4-4908-11f1-9b20-98bd802ca29e','26',3,2,'Zone A','available',0,'2026-05-06 05:00:12',1),('76c33483-4908-11f1-9b20-98bd802ca29e','27',3,3,'Zone A','available',0,'2026-05-06 05:00:12',1),('76c3c18e-4908-11f1-9b20-98bd802ca29e','28',3,4,'Zone A','available',1,'2026-05-06 05:00:12',0),('76c4331b-4908-11f1-9b20-98bd802ca29e','29',3,5,'Zone A','available',0,'2026-05-06 05:00:12',0),('76c4b63d-4908-11f1-9b20-98bd802ca29e','30',3,6,'Zone A','available',0,'2026-05-06 05:00:12',0),('76c5493d-4908-11f1-9b20-98bd802ca29e','31',3,7,'Zone A','available',0,'2026-05-06 05:00:12',0),('76c5c2cc-4908-11f1-9b20-98bd802ca29e','32',3,8,'Zone A','available',1,'2026-05-06 05:00:12',0),('76c643bf-4908-11f1-9b20-98bd802ca29e','33',3,9,'Zone A','available',0,'2026-05-06 05:00:12',0),('76c6ba06-4908-11f1-9b20-98bd802ca29e','34',3,10,'Zone A','available',0,'2026-05-06 05:00:12',0),('76c74085-4908-11f1-9b20-98bd802ca29e','35',3,11,'Zone A','available',0,'2026-05-06 05:00:12',0),('76c7b068-4908-11f1-9b20-98bd802ca29e','36',3,12,'Zone A','available',1,'2026-05-06 05:00:12',0),('76c82483-4908-11f1-9b20-98bd802ca29e','37',4,1,'Zone A','available',0,'2026-05-06 05:00:12',0),('76c88f7a-4908-11f1-9b20-98bd802ca29e','38',4,2,'Zone A','available',0,'2026-05-06 05:00:12',0),('76c90891-4908-11f1-9b20-98bd802ca29e','39',4,3,'Zone A','available',0,'2026-05-06 05:00:12',0),('76c980d5-4908-11f1-9b20-98bd802ca29e','40',4,4,'Zone A','available',1,'2026-05-06 05:00:12',0),('76c9fb74-4908-11f1-9b20-98bd802ca29e','41',4,5,'Zone A','available',0,'2026-05-06 05:00:12',0),('76ca9116-4908-11f1-9b20-98bd802ca29e','42',4,6,'Zone A','available',0,'2026-05-06 05:00:12',0),('76cb3123-4908-11f1-9b20-98bd802ca29e','43',4,7,'Zone A','available',0,'2026-05-06 05:00:12',0),('76cbc2f4-4908-11f1-9b20-98bd802ca29e','44',4,8,'Zone A','available',1,'2026-05-06 05:00:12',0),('76cc3b23-4908-11f1-9b20-98bd802ca29e','45',4,9,'Zone A','available',0,'2026-05-06 05:00:12',0),('76ccb13f-4908-11f1-9b20-98bd802ca29e','46',4,10,'Zone A','available',0,'2026-05-06 05:00:12',0),('76cd43cd-4908-11f1-9b20-98bd802ca29e','47',4,11,'Zone A','available',0,'2026-05-06 05:00:12',0),('76cdcb3c-4908-11f1-9b20-98bd802ca29e','48',4,12,'Zone A','available',1,'2026-05-06 05:00:12',0),('76ce4fd3-4908-11f1-9b20-98bd802ca29e','49',5,1,'Zone B','available',0,'2026-05-06 05:00:12',0),('76ced632-4908-11f1-9b20-98bd802ca29e','50',5,2,'Zone B','available',0,'2026-05-06 05:00:12',0),('76cf624b-4908-11f1-9b20-98bd802ca29e','51',5,3,'Zone B','available',0,'2026-05-06 05:00:12',0),('76cffb56-4908-11f1-9b20-98bd802ca29e','52',5,4,'Zone B','available',1,'2026-05-06 05:00:12',0),('76d0c26c-4908-11f1-9b20-98bd802ca29e','53',5,5,'Zone B','available',0,'2026-05-06 05:00:12',0),('76d169f2-4908-11f1-9b20-98bd802ca29e','54',5,6,'Zone B','available',0,'2026-05-06 05:00:12',0),('76d1ee75-4908-11f1-9b20-98bd802ca29e','55',5,7,'Zone B','available',0,'2026-05-06 05:00:12',0),('76d29982-4908-11f1-9b20-98bd802ca29e','56',5,8,'Zone B','available',1,'2026-05-06 05:00:12',0),('76d32596-4908-11f1-9b20-98bd802ca29e','57',5,9,'Zone B','available',0,'2026-05-06 05:00:12',0),('76d3af70-4908-11f1-9b20-98bd802ca29e','58',5,10,'Zone B','available',0,'2026-05-06 05:00:12',0),('76d43bb5-4908-11f1-9b20-98bd802ca29e','59',5,11,'Zone B','available',0,'2026-05-06 05:00:12',0),('76d4b66e-4908-11f1-9b20-98bd802ca29e','60',5,12,'Zone B','available',1,'2026-05-06 05:00:12',0),('76d53b9b-4908-11f1-9b20-98bd802ca29e','61',6,1,'Zone B','available',0,'2026-05-06 05:00:12',0),('76d5ad92-4908-11f1-9b20-98bd802ca29e','62',6,2,'Zone B','available',0,'2026-05-06 05:00:12',0),('76d61e0a-4908-11f1-9b20-98bd802ca29e','63',6,3,'Zone B','available',0,'2026-05-06 05:00:12',0),('76d684ac-4908-11f1-9b20-98bd802ca29e','64',6,4,'Zone B','available',1,'2026-05-06 05:00:12',0),('76d71d76-4908-11f1-9b20-98bd802ca29e','65',6,5,'Zone B','available',0,'2026-05-06 05:00:12',0),('76d79e46-4908-11f1-9b20-98bd802ca29e','66',6,6,'Zone B','available',0,'2026-05-06 05:00:12',0),('76d81708-4908-11f1-9b20-98bd802ca29e','67',6,7,'Zone B','available',0,'2026-05-06 05:00:12',0),('76d8846d-4908-11f1-9b20-98bd802ca29e','68',6,8,'Zone B','available',1,'2026-05-06 05:00:12',0),('76d8f0e3-4908-11f1-9b20-98bd802ca29e','69',6,9,'Zone B','available',0,'2026-05-06 05:00:12',0),('76d969eb-4908-11f1-9b20-98bd802ca29e','70',6,10,'Zone B','available',0,'2026-05-06 05:00:12',0),('76d9dc9d-4908-11f1-9b20-98bd802ca29e','71',6,11,'Zone B','available',0,'2026-05-06 05:00:12',0),('76da5171-4908-11f1-9b20-98bd802ca29e','72',6,12,'Zone B','available',1,'2026-05-06 05:00:12',0),('76dad905-4908-11f1-9b20-98bd802ca29e','73',7,1,'Zone B','available',0,'2026-05-06 05:00:12',0),('76db587f-4908-11f1-9b20-98bd802ca29e','74',7,2,'Zone B','available',0,'2026-05-06 05:00:12',0),('76dbf421-4908-11f1-9b20-98bd802ca29e','75',7,3,'Zone B','available',0,'2026-05-06 05:00:12',0),('76dc8b87-4908-11f1-9b20-98bd802ca29e','76',7,4,'Zone B','available',1,'2026-05-06 05:00:12',0),('76dd1c8e-4908-11f1-9b20-98bd802ca29e','77',7,5,'Zone B','available',0,'2026-05-06 05:00:12',0),('76ddae98-4908-11f1-9b20-98bd802ca29e','78',7,6,'Zone B','available',0,'2026-05-06 05:00:12',0),('76de6777-4908-11f1-9b20-98bd802ca29e','79',7,7,'Zone B','available',0,'2026-05-06 05:00:12',0),('76defea7-4908-11f1-9b20-98bd802ca29e','80',7,8,'Zone B','available',1,'2026-05-06 05:00:12',0),('76df9363-4908-11f1-9b20-98bd802ca29e','81',7,9,'Zone B','available',0,'2026-05-06 05:00:12',0),('76e0307c-4908-11f1-9b20-98bd802ca29e','82',7,10,'Zone B','available',0,'2026-05-06 05:00:12',0),('76e0f172-4908-11f1-9b20-98bd802ca29e','83',7,11,'Zone B','available',0,'2026-05-06 05:00:12',0),('76e1810e-4908-11f1-9b20-98bd802ca29e','84',7,12,'Zone B','available',1,'2026-05-06 05:00:12',0),('76e20a7d-4908-11f1-9b20-98bd802ca29e','85',8,1,'Zone B','available',0,'2026-05-06 05:00:12',0),('76e2b12c-4908-11f1-9b20-98bd802ca29e','86',8,2,'Zone B','available',0,'2026-05-06 05:00:12',0),('76e36f64-4908-11f1-9b20-98bd802ca29e','87',8,3,'Zone B','available',0,'2026-05-06 05:00:12',0),('76e41657-4908-11f1-9b20-98bd802ca29e','88',8,4,'Zone B','available',1,'2026-05-06 05:00:12',0),('76e4bc75-4908-11f1-9b20-98bd802ca29e','89',8,5,'Zone B','available',0,'2026-05-06 05:00:12',0),('76e570fd-4908-11f1-9b20-98bd802ca29e','90',8,6,'Zone B','available',0,'2026-05-06 05:00:12',0),('76e62611-4908-11f1-9b20-98bd802ca29e','91',8,7,'Zone B','available',0,'2026-05-06 05:00:12',0),('76e6bbfa-4908-11f1-9b20-98bd802ca29e','92',8,8,'Zone B','available',1,'2026-05-06 05:00:12',0),('76e754b9-4908-11f1-9b20-98bd802ca29e','93',8,9,'Zone B','available',0,'2026-05-06 05:00:12',0),('76e80ab9-4908-11f1-9b20-98bd802ca29e','94',8,10,'Zone B','available',0,'2026-05-06 05:00:12',0),('76e8ae85-4908-11f1-9b20-98bd802ca29e','95',8,11,'Zone B','available',0,'2026-05-06 05:00:12',0),('76e94ce2-4908-11f1-9b20-98bd802ca29e','96',8,12,'Zone B','available',1,'2026-05-06 05:00:12',0);
/*!40000 ALTER TABLE `seats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `address` text,
  `id_proof_url` varchar(500) DEFAULT NULL,
  `qr_code` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `notification_channel` varchar(10) DEFAULT 'email',
  `joined_at` date NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT  IGNORE INTO `students` VALUES ('06f690e8-4909-11f1-9b20-98bd802ca29e','Siddharth Singh','07307000615','sidd57165@gmail.com',NULL,'Village - Madan , Post - Kothwa , District - Basti',NULL,'ALMS-06f690e8-4909-11f1-9b20-98bd802ca29e','active','sms','2026-05-06',NULL,'2026-05-06 05:04:14'),('3756b4f5-490d-11f1-9b20-98bd802ca29e','Ayush','9336444245','ayush@gmail.com',NULL,'lucknow',NULL,'ALMS-3756b4f5-490d-11f1-9b20-98bd802ca29e','active','both','2026-05-06',NULL,'2026-05-06 05:34:13'),('61e7a760-49da-11f1-9b20-98bd802ca29e','Shreyansh','7788994455','shreyansh@gmail.com',NULL,'somewhere',NULL,'ALMS-61e7a760-49da-11f1-9b20-98bd802ca29e','active','email','2026-05-07',NULL,'2026-05-07 06:02:51');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `time_slots`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `time_slots` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `monthly_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `capacity` int NOT NULL DEFAULT '50',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `time_slots`
--

LOCK TABLES `time_slots` WRITE;
/*!40000 ALTER TABLE `time_slots` DISABLE KEYS */;
INSERT  IGNORE INTO `time_slots` VALUES ('677db6b5-489b-11f1-9b20-98bd802ca29e','Morning','06:00:00','10:00:00',800.00,60,1,'2026-05-05 15:59:31'),('677e210f-489b-11f1-9b20-98bd802ca29e','Afternoon','10:00:00','14:00:00',800.00,60,1,'2026-05-05 15:59:31'),('677ea283-489b-11f1-9b20-98bd802ca29e','Evening','14:00:00','18:00:00',800.00,60,1,'2026-05-05 15:59:31'),('677f7118-489b-11f1-9b20-98bd802ca29e','Full Day','06:00:00','22:00:00',2500.00,30,1,'2026-05-05 15:59:31');
/*!40000 ALTER TABLE `time_slots` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-08 11:05:32
