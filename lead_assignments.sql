-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 15, 2025 at 09:39 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `interior_crm_ejs`
--

-- --------------------------------------------------------

--
-- Table structure for table `lead_assignments`
--

CREATE TABLE `lead_assignments` (
  `lead_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `lead_assignments`
--

INSERT INTO `lead_assignments` (`lead_id`, `user_id`, `is_primary`, `created_at`) VALUES
(1, 1, 1, '2025-10-31 07:22:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `lead_assignments`
--
ALTER TABLE `lead_assignments`
  ADD PRIMARY KEY (`lead_id`,`user_id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `lead_assignments`
--
ALTER TABLE `lead_assignments`
  ADD CONSTRAINT `fk_la_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
