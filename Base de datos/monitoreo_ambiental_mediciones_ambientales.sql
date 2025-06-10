-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: monitoreo_ambiental
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `mediciones_ambientales`
--

DROP TABLE IF EXISTS `mediciones_ambientales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mediciones_ambientales` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `estacion_id` int NOT NULL,
  `temperatura` float DEFAULT NULL,
  `humedad` float DEFAULT NULL,
  `pm2_5` float DEFAULT NULL,
  `pm10` float DEFAULT NULL,
  `fecha_registro` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `estacion_id` (`estacion_id`),
  CONSTRAINT `mediciones_ambientales_ibfk_1` FOREIGN KEY (`estacion_id`) REFERENCES `estaciones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mediciones_ambientales`
--

LOCK TABLES `mediciones_ambientales` WRITE;
/*!40000 ALTER TABLE `mediciones_ambientales` DISABLE KEYS */;
INSERT INTO `mediciones_ambientales` VALUES (1,1,12.2,52,60.4,100.2,'2025-06-10 14:02:39'),(2,1,12.4,52,60.5,100,'2025-06-10 14:08:14'),(3,1,12.8,51,69.3,117.3,'2025-06-10 14:19:26'),(4,1,13.1,51,70.1,122.4,'2025-06-10 14:25:01'),(5,1,13.8,50,88.8,162.6,'2025-06-10 14:41:49'),(6,1,13.9,50,90.4,155,'2025-06-10 14:47:24'),(7,1,13.9,50,90.8,160.3,'2025-06-10 14:53:10'),(8,1,14,50,93.4,164.6,'2025-06-10 14:58:46'),(9,1,14,50,88.6,154.1,'2025-06-10 15:04:21'),(10,1,13.9,51,84.7,150.6,'2025-06-10 15:09:58'),(11,1,13.9,52,92.9,160.4,'2025-06-10 15:22:04'),(12,1,13.9,52,86.6,154.1,'2025-06-10 15:27:39'),(13,1,13.9,52,78.8,136.4,'2025-06-10 15:33:25'),(14,1,13.9,52,74,130,'2025-06-10 15:39:00');
/*!40000 ALTER TABLE `mediciones_ambientales` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-10 16:02:37
