-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 12, 2025 at 05:32 PM
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
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `company` varchar(191) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `owner_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `name`, `email`, `phone`, `company`, `address`, `notes`, `owner_id`, `created_at`, `updated_at`) VALUES
(1, 'Dipak Chakraborty', 'devsflock@gmail.com', '123456', 'Ascent Group', 'Fair Flora (3rd Floor), 302 Chandanpura', NULL, 1, '2025-10-31 04:55:44', '2025-10-31 04:55:44');

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `prospect_type` enum('Individual','Organization') NOT NULL DEFAULT 'Individual',
  `prospect_name` varchar(150) NOT NULL,
  `primary_email` varchar(190) DEFAULT NULL,
  `primary_mobile` varchar(30) NOT NULL,
  `project_name` varchar(150) DEFAULT NULL,
  `already_client` tinyint(1) NOT NULL DEFAULT 0,
  `priority` enum('Low','Normal','High') DEFAULT 'Normal',
  `interested_item` varchar(255) DEFAULT NULL,
  `zone` varchar(150) DEFAULT NULL,
  `status` enum('New','In Progress','Converted','Lost','On Hold') DEFAULT 'New',
  `campaign` varchar(150) DEFAULT NULL,
  `contacted_by` varchar(150) DEFAULT NULL,
  `info_source` varchar(150) DEFAULT NULL,
  `important_note` text DEFAULT NULL,
  `owner_id` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `leads`
--

INSERT INTO `leads` (`id`, `prospect_type`, `prospect_name`, `primary_email`, `primary_mobile`, `project_name`, `already_client`, `priority`, `interested_item`, `zone`, `status`, `campaign`, `contacted_by`, `info_source`, `important_note`, `owner_id`, `created_at`, `updated_at`) VALUES
(1, 'Individual', 'asd', 'nizamuddin.chowdhury@tripegate.com', 'asd', 'ad', 0, 'Normal', NULL, NULL, 'New', NULL, NULL, NULL, NULL, 1, '2025-10-31 07:22:27', NULL),
(2, 'Individual', 'Test', 'dipak.chakraborty@tripegate.com', '01723415344', NULL, 0, 'Normal', NULL, NULL, 'New', NULL, NULL, NULL, NULL, 1, '2025-10-31 17:40:05', NULL);

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

-- --------------------------------------------------------

--
-- Table structure for table `lead_communication`
--

CREATE TABLE `lead_communication` (
  `lead_id` bigint(20) UNSIGNED NOT NULL,
  `preferred_channel` enum('Phone','WhatsApp','Email','Facebook','SMS','In-person') DEFAULT NULL,
  `whatsapp` varchar(30) DEFAULT NULL,
  `facebook` varchar(120) DEFAULT NULL,
  `last_contact_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `lead_communication`
--

INSERT INTO `lead_communication` (`lead_id`, `preferred_channel`, `whatsapp`, `facebook`, `last_contact_at`, `notes`) VALUES
(1, NULL, NULL, NULL, NULL, NULL),
(2, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `lead_influencer`
--

CREATE TABLE `lead_influencer` (
  `lead_id` bigint(20) UNSIGNED NOT NULL,
  `is_influenced` tinyint(1) DEFAULT 0,
  `influencer_name` varchar(150) DEFAULT NULL,
  `influencer_contact` varchar(60) DEFAULT NULL,
  `relation` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `lead_influencer`
--

INSERT INTO `lead_influencer` (`lead_id`, `is_influenced`, `influencer_name`, `influencer_contact`, `relation`, `notes`) VALUES
(1, 0, NULL, NULL, NULL, NULL),
(2, 0, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `lead_job`
--

CREATE TABLE `lead_job` (
  `lead_id` bigint(20) UNSIGNED NOT NULL,
  `profession` varchar(150) DEFAULT NULL,
  `organization` varchar(150) DEFAULT NULL,
  `designation` varchar(150) DEFAULT NULL,
  `income` decimal(12,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `lead_job`
--

INSERT INTO `lead_job` (`lead_id`, `profession`, `organization`, `designation`, `income`) VALUES
(1, NULL, NULL, NULL, NULL),
(2, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `lead_personal`
--

CREATE TABLE `lead_personal` (
  `lead_id` bigint(20) UNSIGNED NOT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `nid` varchar(50) DEFAULT NULL,
  `address_line1` varchar(255) DEFAULT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(120) DEFAULT NULL,
  `postal_code` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `lead_personal`
--

INSERT INTO `lead_personal` (`lead_id`, `dob`, `gender`, `nid`, `address_line1`, `address_line2`, `city`, `postal_code`) VALUES
(1, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` int(11) NOT NULL,
  `jti` varchar(191) NOT NULL,
  `token_hash` varchar(191) NOT NULL,
  `user_id` int(11) NOT NULL,
  `revoked` tinyint(1) NOT NULL DEFAULT 0,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `jti`, `token_hash`, `user_id`, `revoked`, `expires_at`, `created_at`) VALUES
(1, '13799d3c-e38e-40d2-9852-e4551e8a9368', '$2b$10$71CKiYVvQzepat5jX9GWPO7nCEWHoYZw.z8EAHv2eAC/SHHbYLo0G', 1, 1, '2025-11-07 10:55:07', '2025-10-31 04:55:07'),
(2, '8dd82ee6-4ac9-4244-b5ae-43227125c56e', '$2b$10$R/3Tc3ZArxf5aW4PaEdXI.ceNwTeMeGgiJIt752nIpLQNVNgKq/T.', 1, 1, '2025-11-07 11:15:36', '2025-10-31 05:15:36'),
(3, '56ceba7c-083d-4749-8bf8-a74c802a4c68', '$2b$10$32wHezPAeCexlGKep.WWXuBUXOH9ciOjtpUCC7NCf96Q0dNLyv17C', 1, 1, '2025-11-07 11:36:38', '2025-10-31 05:36:38'),
(4, 'b3c83b78-8562-4032-aaed-47dc1f7d1a67', '$2b$10$fL/BDIAex15hgjfkNNSk8e9I2kw4di1v/T8G.lj6GO8QmlCIe9Lhm', 1, 1, '2025-11-07 12:07:02', '2025-10-31 06:07:02'),
(5, 'fbca6f8f-a0df-4800-86b0-bf1f39f221c4', '$2b$10$3vK5/MBho7OrUPGVKwJWu.BDFPWlf0gmNG1wESTkGvVq3ExknuNZu', 1, 1, '2025-11-07 12:21:36', '2025-10-31 06:21:36'),
(6, 'd8eeddbf-487f-4bbb-86ee-250cbb7aea1f', '$2b$10$C/ut.ECE6gjzDFQGPVQfFOpyephk7Lyybx8p43k4dZKFoYa4mXQj.', 1, 1, '2025-11-07 13:15:00', '2025-10-31 07:15:00'),
(7, 'cb41c18f-f341-4161-9be4-b00550efb926', '$2b$10$S1amm4i1ljIiac/JpZDlg.5sREzPXadLxdmpzvjkZF3ywn/gLYNtO', 1, 1, '2025-11-07 13:23:38', '2025-10-31 07:23:38'),
(8, 'd69490ef-a763-43e4-9e91-4f400ecd4bc4', '$2b$10$50mXUmnoNycvtp6f9kt7d.4B5YFzR5gfX3GX9dh7dGXAuvXcZ5uri', 1, 1, '2025-11-07 23:39:38', '2025-10-31 17:39:38'),
(9, '00564d1d-db08-49be-b394-3bcaec4d6ac3', '$2b$10$xZMkrzsudTzDWk3HFv5uweM2XQqebjSxDfDuBDuHDGt/fO6xyPDjy', 1, 1, '2025-11-08 11:32:10', '2025-11-01 05:32:10'),
(10, '0e2a3be1-7fb9-4d3a-8d59-63c656c91652', '$2b$10$9flx/VefiIJf/UyX951ROu2WjSSVvinXcFjDyJmMAznCGXZOhdMJK', 1, 1, '2025-11-08 11:32:22', '2025-11-01 05:32:22'),
(11, '0068d247-6679-40fe-96c0-02c83b71bd76', '$2b$10$IFk2Gelx7mgKR1w/kwXyBOe3jb99mVH1V7ob83r2faseD7F90Y.sm', 1, 0, '2025-11-08 12:29:27', '2025-11-01 06:29:27');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `password_hash` varchar(191) NOT NULL,
  `role` enum('ADMIN','MANAGER','SALES','VIEWER') NOT NULL DEFAULT 'SALES',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `name`, `password_hash`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'admin@example.com', 'Admin', '$2b$10$rXaPs8nONRblJXBaRu/adu2dYSVk2O3RivXpyyypcLVpRhY.ea9JO', 'ADMIN', 1, '2025-10-29 16:40:04', '2025-10-29 16:40:04');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_contacts_owner` (`owner_id`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_leads_search` (`prospect_name`,`primary_email`,`primary_mobile`,`project_name`,`interested_item`,`zone`);

--
-- Indexes for table `lead_assignments`
--
ALTER TABLE `lead_assignments`
  ADD PRIMARY KEY (`lead_id`,`user_id`);

--
-- Indexes for table `lead_communication`
--
ALTER TABLE `lead_communication`
  ADD PRIMARY KEY (`lead_id`);

--
-- Indexes for table `lead_influencer`
--
ALTER TABLE `lead_influencer`
  ADD PRIMARY KEY (`lead_id`);

--
-- Indexes for table `lead_job`
--
ALTER TABLE `lead_job`
  ADD PRIMARY KEY (`lead_id`);

--
-- Indexes for table `lead_personal`
--
ALTER TABLE `lead_personal`
  ADD PRIMARY KEY (`lead_id`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `jti` (`jti`),
  ADD KEY `fk_rt_user` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `contacts`
--
ALTER TABLE `contacts`
  ADD CONSTRAINT `fk_contacts_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `lead_assignments`
--
ALTER TABLE `lead_assignments`
  ADD CONSTRAINT `fk_la_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lead_communication`
--
ALTER TABLE `lead_communication`
  ADD CONSTRAINT `fk_lc_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lead_influencer`
--
ALTER TABLE `lead_influencer`
  ADD CONSTRAINT `fk_li_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lead_job`
--
ALTER TABLE `lead_job`
  ADD CONSTRAINT `fk_lj_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lead_personal`
--
ALTER TABLE `lead_personal`
  ADD CONSTRAINT `fk_lp_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `fk_rt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
