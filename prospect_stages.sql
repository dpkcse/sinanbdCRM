-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 16, 2025 at 06:16 AM
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
-- Table structure for table `prospect_stages`
--

CREATE TABLE `prospect_stages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `color` varchar(7) NOT NULL DEFAULT '#000000',
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `prospect_stages`
--

INSERT INTO `prospect_stages` (`id`, `name`, `color`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES
(2, 'Initial Contact', '#C89632', 10, 1, '2025-11-13 10:38:44', NULL),
(3, 'Low Potential', '#000000', 11, 1, '2025-11-13 10:38:44', NULL),
(4, 'On Followup', '#802051', 20, 1, '2025-11-13 10:38:44', NULL),
(5, 'Visit Scheduled', '#000000', 21, 1, '2025-11-13 10:38:44', NULL),
(6, 'Visit Done', '#F3E15A', 22, 1, '2025-11-13 10:38:44', NULL),
(7, 'Lead Created', '#F3E15A', 80, 1, '2025-11-13 10:38:44', NULL),
(8, 'Already Client', '#40C463', 90, 1, '2025-11-13 10:38:44', NULL),
(9, 'Junk Prospect', '#D93025', 100, 1, '2025-11-13 10:38:44', NULL),
(10, 'New Prospect', '#ff0000', 0, 1, '2025-11-13 11:42:22', '2025-11-13 11:47:58');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `prospect_stages`
--
ALTER TABLE `prospect_stages`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `prospect_stages`
--
ALTER TABLE `prospect_stages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
