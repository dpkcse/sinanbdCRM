-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 16, 2025 at 06:40 PM
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
-- Table structure for table `email_verification_tokens`
--

CREATE TABLE `email_verification_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `email_verification_tokens`
--

INSERT INTO `email_verification_tokens` (`id`, `user_id`, `token`, `expires_at`, `used_at`, `created_at`) VALUES
(1, 3, '3c54288b7bd770218e76b8d86561d60b2821d117a4c13dd7c9de59ef13a05810', '2025-11-17 20:33:02', NULL, '2025-11-16 20:33:02'),
(2, 4, '5ce81a29d953e4d8f97207de4a10b485c342b0304fadfc5346a0daeced1f06e7', '2025-11-17 20:50:39', NULL, '2025-11-16 20:50:39'),
(3, 5, '4bb3b1edb14802b6f244a5db10b7da83d0cc85c51a53b2651ac038f74a8da2aa', '2025-11-17 20:59:13', NULL, '2025-11-16 20:59:13'),
(4, 6, '1d16851bc6d26e5c99de6502cd1a380f1283639c1ee6a5be65106f4b671633a1', '2025-11-17 22:05:19', NULL, '2025-11-16 22:05:19'),
(5, 7, '14e79886924e4ab325b03fdbd22ab5760a94945d443912a61415c95cf57160e4', '2025-11-17 22:06:47', '2025-11-16 22:07:14', '2025-11-16 22:06:47'),
(6, 8, 'dde99a120d76a3146810f02da4fb6eb1a6d7030d237a96d7e77f0f51c7032bba', '2025-11-17 22:56:56', NULL, '2025-11-16 22:56:56'),
(7, 9, '5f888443f8c83a64d93144eee5c1e55eaa1a52fdb5475a04aab31874c6bf86f1', '2025-11-17 23:32:36', NULL, '2025-11-16 23:32:36');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_code` varchar(20) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `full_name` varchar(200) NOT NULL,
  `email` varchar(191) NOT NULL,
  `profile_photo` varchar(255) DEFAULT NULL,
  `mobile` varchar(30) NOT NULL,
  `alt_mobile` varchar(30) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `join_date` date DEFAULT NULL,
  `status` enum('active','inactive','on_leave','left') NOT NULL DEFAULT 'active',
  `photo_path` varchar(255) DEFAULT NULL,
  `cv_path` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `employee_code`, `first_name`, `last_name`, `full_name`, `email`, `profile_photo`, `mobile`, `alt_mobile`, `designation`, `department`, `join_date`, `status`, `photo_path`, `cv_path`, `user_id`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(5, 'EMP0001', 'Dipak', 'Chakraborty', 'Dipak Chakraborty', 'devsflock@gmail.com', NULL, '01827885295', '01827885295', 'HR Manager', 'HR', '2025-11-16', 'active', NULL, NULL, 6, 1, NULL, '2025-11-16 22:05:14', '2025-11-16 22:05:19'),
(6, 'EMP0002', 'MD', 'IMRAN KHAN', 'MD IMRAN KHAN', 'wesixgtllc@gmail.com', NULL, '01827885295', NULL, 'HR Manager', 'HR', '2025-11-06', 'active', NULL, NULL, 7, 1, 1, '2025-11-16 22:06:38', '2025-11-16 22:17:16'),
(7, 'EMP0003', 'DIPAK', 'CHAKRABORTY', 'DIPAK CHAKRABORTY', 'littlerockllc007@gmail.com', NULL, '01969299340', '01827885295', 'HR Manager', 'HR', NULL, 'active', NULL, NULL, 8, 1, 1, '2025-11-16 22:56:46', '2025-11-16 22:57:30'),
(8, 'EMP0004', 'Imran', 'Khan', 'Imran Khan', 'dipokchakraborty+1@gmail.com', NULL, '01611330040', '01844224393', 'Stuff', 'HR', '2025-11-29', 'active', NULL, NULL, 9, 1, NULL, '2025-11-16 23:32:21', '2025-11-16 23:32:36');

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
  `alternative_mobile` varchar(30) DEFAULT NULL,
  `project_name` varchar(150) DEFAULT NULL,
  `project_type` varchar(100) DEFAULT NULL,
  `project_size` varchar(100) DEFAULT NULL,
  `project_details` text DEFAULT NULL,
  `already_client` tinyint(1) NOT NULL DEFAULT 0,
  `priority` enum('Low','Normal','High') DEFAULT 'Normal',
  `interested_item` varchar(255) DEFAULT NULL,
  `zone` varchar(150) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `thana` varchar(100) DEFAULT NULL,
  `area` varchar(150) DEFAULT NULL,
  `street_details` varchar(255) DEFAULT NULL,
  `status` enum('New','In Progress','Converted','Lost','On Hold') DEFAULT 'New',
  `prospect_stage_id` bigint(20) UNSIGNED DEFAULT NULL,
  `campaign` varchar(150) DEFAULT NULL,
  `contacted_by` varchar(150) DEFAULT NULL,
  `info_source` varchar(150) DEFAULT NULL,
  `important_note` text DEFAULT NULL,
  `owner_id` bigint(20) DEFAULT NULL,
  `additional_owner_ids` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `leads`
--

INSERT INTO `leads` (`id`, `prospect_type`, `prospect_name`, `primary_email`, `primary_mobile`, `alternative_mobile`, `project_name`, `project_type`, `project_size`, `project_details`, `already_client`, `priority`, `interested_item`, `zone`, `district`, `thana`, `area`, `street_details`, `status`, `prospect_stage_id`, `campaign`, `contacted_by`, `info_source`, `important_note`, `owner_id`, `additional_owner_ids`, `created_at`, `updated_at`) VALUES
(1, 'Individual', 'asd', 'nizamuddin.chowdhury@tripegate.com', 'asd', NULL, 'ad', NULL, NULL, NULL, 0, 'Normal', NULL, NULL, NULL, NULL, NULL, NULL, 'New', 3, NULL, NULL, NULL, NULL, 1, NULL, '2025-10-31 07:22:27', '2025-11-15 09:10:23'),
(3, 'Individual', 'Test', 'dipokchakraborty@gmail.com', '123', '123', NULL, 'ada', '1232', 'sadasdas', 0, 'High', NULL, NULL, 'asda', 'asd', 'asd', 'asd', 'New', 2, 'asd', NULL, 'asd', NULL, 1, NULL, '2025-11-15 08:05:23', '2025-11-15 09:10:08'),
(4, 'Individual', 'Test', 'devsflock@gmail.com', 'Test', '123456789', NULL, 'Home', '1500SFT', '1500SFT', 0, 'High', NULL, NULL, '1500SFT', '1500SFT', '1500SFT', '1500SFT', 'New', NULL, '1500SFT', NULL, NULL, NULL, 1, NULL, '2025-11-15 11:36:35', '2025-11-16 16:55:58');

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
(4, 2, 0, '2025-11-16 16:55:58'),
(4, 7, 0, '2025-11-16 16:55:58');

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
(1, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `lead_followups`
--

CREATE TABLE `lead_followups` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lead_id` bigint(20) UNSIGNED NOT NULL,
  `activity_type` enum('call','sms','email','visit','meeting','other') NOT NULL,
  `activity_note` text DEFAULT NULL,
  `activity_at` datetime NOT NULL DEFAULT current_timestamp(),
  `next_followup_at` datetime DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `lead_followups`
--

INSERT INTO `lead_followups` (`id`, `lead_id`, `activity_type`, `activity_note`, `activity_at`, `next_followup_at`, `created_by`, `created_at`) VALUES
(1, 3, 'sms', 'ssa', '2025-11-15 16:46:18', '2025-11-15 16:46:00', 1, '2025-11-15 16:46:18'),
(2, 1, 'meeting', 'আসাসাশ', '2025-11-15 16:46:51', '2025-11-15 16:46:00', 1, '2025-11-15 16:46:51'),
(3, 3, 'email', 'SSSS', '2025-11-15 16:47:14', '2025-11-22 16:47:00', 1, '2025-11-15 16:47:14'),
(4, 1, 'sms', 'আশডাশড', '2025-11-15 16:48:01', '2025-11-30 16:47:00', 1, '2025-11-15 16:48:01'),
(5, 3, 'visit', 'যেতে হবে', '2025-11-15 17:06:11', '2025-11-29 21:06:00', 1, '2025-11-15 17:06:11'),
(6, 3, 'call', 'যেতে হবে', '2025-11-15 17:06:28', '2025-11-29 17:06:00', 1, '2025-11-15 17:06:28'),
(7, 4, 'call', 'Need call', '2025-11-15 17:37:14', '2025-11-16 17:37:00', 1, '2025-11-15 17:37:14'),
(8, 4, 'call', 'CCa', '2025-11-15 17:37:32', '2025-11-22 17:37:00', 1, '2025-11-15 17:37:32'),
(9, 4, 'email', 'sd', '2025-11-15 17:37:43', '2025-11-22 17:37:00', 1, '2025-11-15 17:37:43'),
(10, 4, 'visit', 'ddd', '2025-11-15 17:38:01', '2025-11-30 17:37:00', 1, '2025-11-15 17:38:01'),
(11, 4, 'call', NULL, '2025-11-15 17:45:21', '2025-12-27 05:46:00', 1, '2025-11-15 17:45:21'),
(12, 4, 'call', NULL, '2025-11-15 17:47:19', '2025-11-28 17:47:00', 1, '2025-11-15 17:47:19'),
(13, 4, 'sms', NULL, '2025-11-16 22:56:13', '2025-11-16 22:56:00', 1, '2025-11-16 22:56:13');

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
(1, 0, NULL, NULL, NULL, NULL);

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
(1, NULL, NULL, NULL, NULL);

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
(1, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(150) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `code`, `description`) VALUES
(1, 'employees.view', 'View employee list'),
(2, 'employees.manage', 'Create & update employees'),
(3, 'employees.createUser', 'Create login account from employee'),
(4, 'leads.view', 'View leads'),
(5, 'leads.manage', 'Create & update leads'),
(6, 'users.view', 'List and view users'),
(7, 'users.manage', 'Create/edit users & assign roles'),
(8, 'roles.view', 'List and view roles'),
(9, 'roles.manage', 'Create/edit roles'),
(10, 'permissions.view', 'List and view permissions'),
(11, 'permissions.manage', 'Create/edit permissions');

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
(11, '0068d247-6679-40fe-96c0-02c83b71bd76', '$2b$10$IFk2Gelx7mgKR1w/kwXyBOe3jb99mVH1V7ob83r2faseD7F90Y.sm', 1, 1, '2025-11-08 12:29:27', '2025-11-01 06:29:27'),
(12, '428e47f4-f5e3-4963-9d70-3d31d86b809e', '$2b$10$epT3vvkl.N0W1/PHdGSFK.9kWHyreG8.nYjdPYvqXcubpXwnM4iMa', 1, 1, '2025-11-20 16:31:42', '2025-11-13 10:31:42'),
(13, '2a811eed-20f9-4f84-9fe6-48a19072c462', '$2b$10$T2voTm64PsdCxNuSNDZ85uDwbGvLxRHXccT3RWeXHKMlwFj4lxR0W', 1, 1, '2025-11-20 16:47:41', '2025-11-13 10:47:41'),
(14, '4da3c77f-2dc2-4fe3-abf1-680cf940670d', '$2b$10$n5soDB0nrB1EkgEyscM.DOF/NIqRBf4iW5ZkDEK.jJdfmWUw1WdLC', 1, 1, '2025-11-20 16:47:54', '2025-11-13 10:47:54'),
(15, 'f20c4323-99b1-464e-a844-3a9970fb994b', '$2b$10$vZRZD8WpucQlR8ev8t2LmOScTIQ6fW9hdy0eDORoDdatewG5IdaGm', 1, 1, '2025-11-20 17:08:31', '2025-11-13 11:08:31'),
(16, '86b36920-1793-4ec2-975f-e133d18e0f65', '$2b$10$QQXoPz3NA3JnV3GZMj.4GubRQ03/wSc8MZLAWWs84kw1u5VSe/6O6', 1, 1, '2025-11-20 17:32:22', '2025-11-13 11:32:22'),
(17, '55ffec7a-d488-4e79-b24d-210404e5d9c7', '$2b$10$eeXzhMwKUTeOItTwouUsW.Zl118qxfnc6R94h8P3x/oVEh7GcEas2', 1, 1, '2025-11-20 17:47:37', '2025-11-13 11:47:37'),
(18, 'd3978618-81dd-4bef-81c0-0345aaa0031a', '$2b$10$YA3w1ulm.Q6.vqNgSLSmUO.54gwi4KtUwE9ftAahIrh34GPhQPUhO', 1, 1, '2025-11-20 18:10:45', '2025-11-13 12:10:45'),
(19, '1fe1d187-d5d8-415d-9df6-0aa4e8331f52', '$2b$10$xgKYBAPgnU5.0hYFKA//r.BtVWidLAxosxpev26FKXUjZv6goY/fO', 1, 1, '2025-11-20 21:55:39', '2025-11-13 15:55:39'),
(20, '824fe7ca-825b-403f-84e5-d8c57aec169b', '$2b$10$lY6YjjpZZ10pDJe3uzQJ2OCofw/pJbdgFl/XN5A5Z.l.0KxWvk4tG', 1, 1, '2025-11-20 22:45:01', '2025-11-13 16:45:01'),
(21, '7b67aafe-1615-48b6-a6bc-da649f39bdc2', '$2b$10$VIGJ24c4jCuXoI/In1tEF.d1QIJf.ty36XStWkSTdVM5QkOtIk0cK', 1, 1, '2025-11-20 22:45:01', '2025-11-13 16:45:01'),
(22, '54e97db0-401a-48f1-afab-9a80f855f23a', '$2b$10$R7KclJCvVPyeKHQMn0kaQurABumUHPr4GgROTh3OM6sjibDgHEmBy', 1, 1, '2025-11-20 23:23:44', '2025-11-13 17:23:44'),
(23, '4a63d711-33e2-43a3-8506-061563ba2526', '$2b$10$BDaDW56m0oydHoGoOuuGouzURL9SZqp8.DzHQCuH.SYvxryIzHdea', 1, 1, '2025-11-20 23:23:45', '2025-11-13 17:23:45'),
(24, '0ad2c2ae-d88b-4aa5-bd7b-2915021139d9', '$2b$10$hq9A/y2PASiiXkGmS1ClKOcAzLEClSG9upknlOaDehCxAFQ8ET.mW', 1, 1, '2025-11-21 00:46:28', '2025-11-13 18:46:28'),
(25, '13ad0dd2-0a82-4cc1-94fc-6d2712e622a5', '$2b$10$/j2sRglxtlq8mD.ewnEK7e/mFIQSYJ55F0QkrUJF86oNN81WXak32', 1, 1, '2025-11-21 00:46:29', '2025-11-13 18:46:29'),
(26, '86b6172b-fb26-4d33-a97e-c1c649d9f899', '$2b$10$gwSRroUyI6fLJ9dzRCFbFu8lceAlsPpm/Mk00sJM1cex0ABE2b5me', 1, 1, '2025-11-21 00:53:36', '2025-11-13 18:53:36'),
(27, '433a90ce-f4b7-44cd-91c5-4bcb1a4e2b02', '$2b$10$OTxkNQPJrYjwha.Ag.F8S.1rGZThzfNzsTXqqp0WqElivqYoETKLS', 1, 1, '2025-11-21 21:01:01', '2025-11-14 15:01:01'),
(28, 'de967b95-0bf2-4de7-9083-e9a89a94b6f1', '$2b$10$y7QmEz8QsQOWURaEO2rJt.x77G5fM4hffje0W6DhK1P6YNCL99M0q', 1, 1, '2025-11-21 21:17:04', '2025-11-14 15:17:04'),
(29, '75f6d923-41be-4ed4-9c29-afe17441870a', '$2b$10$/.7AOdAFkA/mHMd5ivPkw.abSsEohOR2Y68amH5jZXgBjuojIaCBa', 1, 1, '2025-11-21 21:17:04', '2025-11-14 15:17:04'),
(30, 'aee58ed5-8596-4a99-9464-f60f66e94f5f', '$2b$10$jJb7Qhd8HD0fLatWIRYcXO8YczzdrFwMV87ODY8.fufI6as/ZXR/6', 1, 1, '2025-11-21 21:41:20', '2025-11-14 15:41:20'),
(31, '647c3cc1-33fa-4df3-91e8-82544582ce19', '$2b$10$kw4S07A3vmHFVdw.V7RQmODboEwXmV3KlSekIn/ZQDuN8XaFNc8BW', 1, 1, '2025-11-21 21:41:20', '2025-11-14 15:41:20'),
(32, 'af9d7c92-83fd-49e1-9c4f-a344445a5faf', '$2b$10$zemyqYXh4mmmfOPQUzic9OLeFZ6d9EpJ57ja29kywIgtpikTnLpga', 1, 1, '2025-11-21 22:11:40', '2025-11-14 16:11:40'),
(33, '20a1dab7-8e3c-44cc-8293-1bc04c5814b2', '$2b$10$wcBDz15x2SdhP0Ejx14g/eufEW/oSnG57eLCSVLBY/o1K4w/Xia0y', 1, 1, '2025-11-21 22:11:40', '2025-11-14 16:11:40'),
(34, 'e4e3246b-b24f-47e2-93ce-ec42362382f4', '$2b$10$WAhoMLEbPrXQxUQw9Q5e/elADNqAGWPdOKonaxo563.c3YWl8tuKy', 1, 1, '2025-11-21 22:27:38', '2025-11-14 16:27:38'),
(35, '5fc98972-a52c-45ca-b437-706f54cbd5e8', '$2b$10$TqlXp2PCbo19c8JwREb7e.fJuyw.e5Ck/su88f.290aNEVXx93woK', 1, 1, '2025-11-21 22:27:38', '2025-11-14 16:27:38'),
(36, '5ca54064-47fc-4ba8-b6ca-a8dd4a44e0da', '$2b$10$iuVCqkibVXztdjgDkK5Erejch4dwSQV1/Q0QvDP6XiXNtY1n8dQna', 1, 1, '2025-11-21 22:48:03', '2025-11-14 16:48:03'),
(37, '43241898-e577-4e60-b20b-00781b350185', '$2b$10$HltvyvY6BLCnRk8KoimOw.RMINLByVOBDTX4VSakeKD/Lr1LNRiQ6', 1, 1, '2025-11-21 22:51:59', '2025-11-14 16:51:59'),
(38, 'a625e2c7-8797-4453-b025-25ffcd938ee6', '$2b$10$aiM.RQFtcWzz9VKoGpWOcu2uJW9TQwOtVDS9m3XjLv.Z9SX7YlEBC', 1, 1, '2025-11-21 23:15:35', '2025-11-14 17:15:35'),
(39, '288ae71a-708a-4973-be0d-8f68c854efe8', '$2b$10$6/lh3nPFbVvOfy2YQ/OBUeESkAgcZLBWu2tihu/OYzz8FsnRHAxv.', 1, 1, '2025-11-21 23:15:35', '2025-11-14 17:15:35'),
(40, 'cfe809c5-3251-41ec-a8e0-839bf32c8b98', '$2b$10$u6iFIk3qDoA8VHyijXHbqeOkzX9fR.6cWfc1S/MLBxZd07WCVzpUe', 1, 1, '2025-11-21 23:37:13', '2025-11-14 17:37:13'),
(41, 'bf904923-d226-4dd1-88d3-a5a75bc57c7b', '$2b$10$y7pTNHLWcRt5D8y1TMMFAuYVSluEH0AcxaR8xGZGmTPyKZvqql1wC', 1, 1, '2025-11-21 23:44:36', '2025-11-14 17:44:36'),
(42, 'e91bbfb4-801e-48bc-acf8-6d554300f36a', '$2b$10$OtORjsslWsspYiLrFCWxTubBpbKmN3KGR3HiQQMCxd8Ea1Uo6o9va', 1, 1, '2025-11-22 12:55:33', '2025-11-15 06:55:33'),
(43, '83bad734-2b0a-4fcc-ba05-fb8b2eb58dab', '$2b$10$L.atKwlQmgaBsWT3psSTE.N5YHNTfY2Jb.O9smfKj1cp0EFKu8.Ba', 1, 1, '2025-11-22 12:55:33', '2025-11-15 06:55:33'),
(44, '09d4a3a7-6462-41ec-b7f3-6e1ea0850f81', '$2b$10$s3D76yNbBbzUAY49TKcXjeNqUKqLploNfoWFCbStO1IkX/E.7ZgqS', 1, 1, '2025-11-22 12:57:49', '2025-11-15 06:57:49'),
(45, '12627067-5923-43e0-a202-f46f17210594', '$2b$10$tjzJV.dqFZOTlaoFYFTaK.6HFg//PHrgJ6XLjufkJrk.qS22VY5bC', 1, 1, '2025-11-22 13:49:05', '2025-11-15 07:49:05'),
(46, 'f8b4d05b-88b8-40f4-bb35-1e49e32effee', '$2b$10$4nyIgp.gBuGAlQfkbYa1rOoihhra.tlXOVLTW/c9LsvEP/1k5lHP2', 1, 1, '2025-11-22 13:49:05', '2025-11-15 07:49:05'),
(47, 'f82eec8a-4e4c-4c1b-b0bd-988e2c342723', '$2b$10$5Tln.qo7.9yopA6nxmmVFOVZzeH8Q9DtfaECOR4SBXuyIJnQgzFm2', 1, 1, '2025-11-22 14:04:26', '2025-11-15 08:04:26'),
(48, 'cfc3e160-c7ca-46da-be34-262360522248', '$2b$10$yHTkjOzrLq4cGn6yOTdlWOrUySU3TRDOtaoaDvBVLIIzpVQPnR5Py', 1, 1, '2025-11-22 14:04:33', '2025-11-15 08:04:33'),
(49, '98c3756c-ef2a-47c6-846e-13c1d94da721', '$2b$10$ZSzUbK63HVnOTZj9U.a4f.Ggoe5k/PHyHQ7KZOs5bD9zZcwsKS8Fi', 1, 1, '2025-11-22 14:25:25', '2025-11-15 08:25:25'),
(50, 'f12c5144-a0d2-4137-a859-d0bcb68f8ea1', '$2b$10$3EEendPe/23icqsXNerWGu8Mo/3AyIAu4B1g.BosE.E/yjFsuobDS', 1, 1, '2025-11-22 14:35:36', '2025-11-15 08:35:36'),
(51, '9c872853-3d7b-4628-a7f3-82a1bfe4fa6f', '$2b$10$Hs4qUbhUdxlnOwbiWfhq0.7QZCCvIjRpruq42hX5YSSEpoKT4qo3y', 1, 1, '2025-11-22 14:50:24', '2025-11-15 08:50:24'),
(52, '530bfb89-2308-453a-be5c-681f1fd20bf6', '$2b$10$nlMjcbBzHvBWYCOkmwQX5u5fgLYyshdCJ1MBa162C7HgMvFFnWfq2', 1, 1, '2025-11-22 15:09:24', '2025-11-15 09:09:24'),
(53, 'c2d32bb1-7f6e-43a8-a216-133ad32fd8f4', '$2b$10$r74nLwB096hy0YfKYSvKleykB5yRYYjitNY03YZamotb1KA6OxPzi', 1, 1, '2025-11-22 15:17:23', '2025-11-15 09:17:23'),
(54, '471bb7fb-dedd-4db8-9694-fdfe797647eb', '$2b$10$2L6.dA5zviN5a4vsFKsY1.9.mlEaTPpiV.BNY5/TPKWNVNMzPO39C', 1, 1, '2025-11-22 15:48:04', '2025-11-15 09:48:04'),
(55, '668fba1a-ac67-47a5-9030-15839826bdc4', '$2b$10$RcVg.a1GiWPQW//CdtK1VeOUFUA8SAN5o4B8ayBJJPYwYHCheR442', 1, 1, '2025-11-22 15:48:04', '2025-11-15 09:48:04'),
(56, '5d627fc6-4ac9-474c-85ce-1ebe8f22f1b4', '$2b$10$Szn7UWjgTwT04Rm52Oq49.HfMYf1TtpGFTDR72z2BOLJGV16KE90i', 1, 1, '2025-11-22 16:03:14', '2025-11-15 10:03:14'),
(57, '9ae2e0a1-40bc-4262-94d4-41316aaf9485', '$2b$10$Jd9xMJA8gDgu/r3bdZx18.B4NTAFppUHTIcSmz4kwDQBf4HmvoPqS', 1, 1, '2025-11-22 16:29:34', '2025-11-15 10:29:34'),
(58, '801439de-d6a5-4964-8eab-2ed10b780cb3', '$2b$10$MxhDDzmDv0JqcmbeVmkFp.GT4Ctqujtdh3SDSlklRUo.7mDivLWJi', 1, 1, '2025-11-22 16:29:34', '2025-11-15 10:29:34'),
(59, '9e52519e-c66f-4103-8224-cd0b6c992154', '$2b$10$Zi/aIUk80adiEsPYqu4ISubTMdMw4Mtu/86DqQARkRT1oN1cFIAeq', 1, 1, '2025-11-22 16:29:52', '2025-11-15 10:29:52'),
(60, 'da3fe61a-ff18-4a07-8fa9-43050c870ddf', '$2b$10$2eNhJ5ZojZBV3Z./UBc4F.Ec6bBGvet30UNx.X/P2NyTPUHvIuO1.', 1, 1, '2025-11-22 16:46:18', '2025-11-15 10:46:18'),
(61, 'ddd7d8dc-1036-4dfb-8be6-c3958984879f', '$2b$10$2wwUjCIi0V6xUuXi9AcJj.c1H82wmWT54h/uZW2gFUJ1gy0NmSww2', 1, 1, '2025-11-22 17:02:43', '2025-11-15 11:02:43'),
(62, 'b68786dc-6fb6-4f8e-93d8-3cce4ba09b2d', '$2b$10$.GLLwqIh4G5iw.dC5F0dKeLFIet1Tjpl8dUKkIKvoSyNOxN5vx0DG', 1, 1, '2025-11-22 17:02:43', '2025-11-15 11:02:43'),
(63, 'e9c04307-85f3-4c6f-b712-4fb9b819c202', '$2b$10$KZmi8mZv5g5e.ARW91MjXO9aJoNA3HVivAiqCmNGtVzr6nnb2hBU2', 1, 1, '2025-11-22 17:23:26', '2025-11-15 11:23:26'),
(64, '480e115c-27d5-48e1-9ec6-f1df34cc1831', '$2b$10$zxCQIqGYbAaHNqEAG3zS.Oc/TiXST418QIcqr0Tni5EziGzyt4Or2', 1, 1, '2025-11-22 17:23:26', '2025-11-15 11:23:26'),
(65, '9957acea-09f0-47a8-874f-fb0e838cb1b6', '$2b$10$sXEUxxVH3zH7TQlF.TFXv.3JQ38CHxZI0m7nY0UYrO8LmXbVT5HlS', 1, 1, '2025-11-22 17:35:41', '2025-11-15 11:35:41'),
(66, '9dbbca59-3fbb-4a0d-98b6-e53c362acd2e', '$2b$10$nkY4v7qfF7iFy.xaePizIOQ2GoXpwLJIu1032mo2qTuGfFlNIZwxO', 1, 1, '2025-11-22 19:47:30', '2025-11-15 13:47:30'),
(67, 'ad4fa2bb-fcf5-40b6-bfc8-9ec122917297', '$2b$10$5nLCC393abJnqeMWQGNF1eYomFb4GHQBANNXKwt7dJ6nr.qGOnvbi', 1, 1, '2025-11-22 19:47:30', '2025-11-15 13:47:30'),
(68, 'a8e22a28-4025-4fcd-a1cb-c362907f2c34', '$2b$10$ivpeNHJez.8KysLJTwQOSO3iclUSsmlXOI4.3KV9QByxP/cOaTvaa', 1, 1, '2025-11-22 20:06:46', '2025-11-15 14:06:46'),
(69, '340d917a-76ef-4cbb-a287-1926588aef5c', '$2b$10$qrEo/gg/t2TK7ikV5aGaEOL/iXEfTcgK1FTBzIkb/FgK8oHvDy7eG', 1, 1, '2025-11-22 20:06:46', '2025-11-15 14:06:46'),
(70, 'c279f88e-b961-4f11-bffd-76d3c8a1507e', '$2b$10$.TJyHgVGY5Ym/WTdS5Siy.6mN77CbR0paFxh13I4bLSn4bbZb9p2S', 1, 1, '2025-11-22 20:22:22', '2025-11-15 14:22:22'),
(71, '1c853a7f-906f-4075-aed3-421651c5f8af', '$2b$10$2bbNsWo4NXUnbY69sOrn1eaPmsnmw2e92MOSpS8WL2LPiguOgoigC', 1, 1, '2025-11-22 21:14:27', '2025-11-15 15:14:27'),
(72, 'c52126fa-4d51-4413-b9e5-17de57e0fb75', '$2b$10$4gwy5S0V.DqSkvKrhEDCrOh2eH3MukO4aL4e7KHRdRB6LUusuePim', 1, 1, '2025-11-22 21:57:56', '2025-11-15 15:57:56'),
(73, '9e8c7953-4130-4778-b66c-2afa02b53dc5', '$2b$10$FRNFd0HDNpWGtHEX0bDPTOe6TCczds1yNISwcomlMt7wn7Po1uVZq', 1, 1, '2025-11-22 21:57:56', '2025-11-15 15:57:56'),
(74, 'fd009d8e-cbc2-4425-a698-ce1c0c233c7d', '$2b$10$12DuEcQmqmR18A7xW48uCuPqhLgT027hRoigO2OzcJ5AXaQ752jQ6', 1, 1, '2025-11-22 22:23:34', '2025-11-15 16:23:34'),
(75, 'e05755fc-c85d-4c3c-a6c3-4a6b9e669d60', '$2b$10$aPtFmc4jQ5hx14.KyYzr6O25RLpHy.mGD.qtYxeVIhF9nWQVnsB9y', 1, 1, '2025-11-22 22:42:30', '2025-11-15 16:42:30'),
(76, 'de43b707-2676-41e3-8852-9dbf5b39ce31', '$2b$10$5OgvZ/Exg1k1xNNx0gKL/u76txLzJmtVKjcV/H0j/u/XxXowbiQF2', 1, 1, '2025-11-22 23:07:23', '2025-11-15 17:07:23'),
(77, '0477691e-a780-404f-bfff-416b278974c2', '$2b$10$HU72m.hxkiVhHO1hueo/nuFsc3kSncDv7iWsk4UQqGAA.CENn0OjC', 1, 1, '2025-11-22 23:24:09', '2025-11-15 17:24:09'),
(78, 'fc0b4860-4358-4546-96b7-f40a01e9d830', '$2b$10$W8iWRCdbk22B3xDc4X2Lne0EvYnx4wi3m3puftT7NKtp7EwyW0saa', 1, 1, '2025-11-23 10:53:16', '2025-11-16 04:53:16'),
(79, '2d84a989-5d33-44af-92a2-bfb205b58ffd', '$2b$10$93EFRf0O880.4c4ALRfV2.irKRBhWr1W294iPnIOOO2MSnK8DOWkO', 1, 1, '2025-11-23 11:24:52', '2025-11-16 05:24:52'),
(80, '53ecefe2-553c-403c-8210-7577004f6ae2', '$2b$10$doofUbNjQV0bpDxoR9p1e.fKDMkAGOlf4I/lZ.ytIcj2O9MmH.OGS', 1, 1, '2025-11-23 11:50:28', '2025-11-16 05:50:28'),
(81, '549362a5-d633-4c1a-a3e8-43d3395793aa', '$2b$10$Cg0pqxYTpQzerRsoYipO5ua90gegcMFu/t2JXg0ctnDiVxJHPYah2', 1, 1, '2025-11-23 12:12:07', '2025-11-16 06:12:07'),
(82, '5aba25a2-5651-471b-97d1-ab1f6aeb3ba4', '$2b$10$Uvh1VUyuYnNgOWy3y997ZeutQwxlyl9FLscJEfW0fgqeL6fi45OHu', 1, 1, '2025-11-23 12:12:31', '2025-11-16 06:12:31'),
(83, '46180264-7b9e-4c2d-bae1-f94d8ace4c83', '$2b$10$xp7DN5JORyPbE29ON4fr2uRdK1kUM3lbb5fCaP9wt1IvejPXOAT42', 1, 1, '2025-11-23 13:11:19', '2025-11-16 07:11:19'),
(84, '550fe327-9954-4d24-8905-8cece363f4f3', '$2b$10$X1BATe79EnS5TMNtPsurYO0Gqp5jdMmJnE8SnABTiwl4AWLRFiWoq', 1, 1, '2025-11-23 13:22:40', '2025-11-16 07:22:40'),
(85, '3e220cfb-c983-4b3e-ac5a-81c73e7d4755', '$2b$10$zEB8H6vna6ej5ZrwJQzbueEx4/NGsd4/JSXrxFyTUu1u1TlC4YMEK', 1, 1, '2025-11-23 16:09:18', '2025-11-16 10:09:18'),
(86, '881d5749-4ea1-4702-8fda-d6c9355b6c29', '$2b$10$wFQXFE5lNBTIzjMY001gaOmYF8idINmGLZRDQxZgnJwBmEuxBjEha', 2, 1, '2025-11-23 16:54:01', '2025-11-16 10:54:01'),
(87, '7a945fd6-de2c-43c5-8074-afd11448a383', '$2b$10$h93xy4wbNk7ePZGs/myGwe1lCcEtN5FrUKaqCgmb4fL7MzWyLnZ4S', 1, 1, '2025-11-23 16:54:55', '2025-11-16 10:54:55'),
(88, 'c22ec0ec-2c5a-4ebb-ab59-ccccc0edb278', '$2b$10$N6IJTcmF1eIQoyKTvB483.r2xBm.D7ZCTeLYx8NzMCiwHaVbABpkC', 1, 1, '2025-11-23 17:16:13', '2025-11-16 11:16:13'),
(89, '33a0c6da-c8b9-4b4e-b345-3240cb96c9be', '$2b$10$wLdlYTWWYmXAtK1zLNalQO.KAoaFgaC9Z4aD8.zI5iDzNqa2Of9tC', 1, 1, '2025-11-23 20:26:43', '2025-11-16 14:26:43'),
(90, 'ed941632-2951-4d3d-8aec-bbdb68ecad3e', '$2b$10$ohNMKxVQFkviEOPX1clnDupvPQ7yWzf0eQWDFfBoggYfTVbNOlx.C', 1, 1, '2025-11-23 22:54:18', '2025-11-16 16:54:18'),
(91, 'ea77faa9-2d19-4922-ba45-26787f427fd6', '$2b$10$xbVDaptCwOaNma5KrGyk/u196o2apzpBN..rI0DB0HQ50M/62OfzW', 1, 1, '2025-11-23 22:55:17', '2025-11-16 16:55:17'),
(92, '11955751-b746-4fda-bf9f-f7cc04a3feb6', '$2b$10$b0aNOmrj/qDzvIQPKxZvnOV.s2fQFkotzMkIE8pPPwZSUCpTdrche', 1, 0, '2025-11-23 23:30:16', '2025-11-16 17:30:16');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `slug`, `description`) VALUES
(1, 'Administrator', 'admin', 'Full system access'),
(2, 'HR Manager', 'hr_manager', 'Manage employees & attendance'),
(3, 'CRM Manager', 'crm_manager', 'Manage leads & prospects'),
(4, 'Staff', 'staff', 'Limited access'),
(5, 'Manager', 'MANAGER', 'Team / CRM manager'),
(6, 'Sales', 'SALES', 'Sales user'),
(7, 'Viewer', 'VIEWER', 'Read only user');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `permission_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(2, 1),
(2, 2),
(2, 3),
(3, 4),
(3, 5);

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
(1, 'admin@example.com', 'Admin', '$2b$10$fqy3z8spDi8x2QUXqHARYeyi/dYNVbFNeMyg5mfxtjFS8w3Zxg.ty', 'ADMIN', 1, '2025-10-29 16:40:04', '2025-11-16 16:51:57'),
(2, 'dipokchakraborty@gmail.comw', 'Dipok Chakraborty', '$2b$10$TfzeZahxl95gg3xuceFapel8Bh9A94t34SdSiNBvLu5Fv9d7TOsda', 'SALES', 1, '2025-11-16 07:59:43', '2025-11-16 16:04:35'),
(3, 'devsflock@gmail.comq', 'MD IMRAN KHAN', '$2b$10$sDuyym9ikUozaDy8AgSVreNMqmmd4p50Q.UlRTFKs9g6Pof86MpKW', 'SALES', 0, '2025-11-16 14:33:02', '2025-11-16 16:04:32'),
(4, 'littlerockllc007@gmail.comw', 'DIPAK CHAKRABORTY', '$2b$10$hUJiwBv5D0tgLibc9vuaKOA6cNkA9EE9THFJebuVMp8tWGm3mGsq.', 'SALES', 0, '2025-11-16 14:50:39', '2025-11-16 16:04:30'),
(5, 'wesixgtllc@gmail.comq', 'MD IMRAN KHAN', '$2b$10$xrwdWLT1q0p0/FN6VHy/YeN3ixSc2GU/54Rik01bJYJBOpn8XID22', 'SALES', 0, '2025-11-16 14:59:13', '2025-11-16 16:04:25'),
(6, 'devsflock@gmail.com', 'Dipak Chakraborty', '$2b$10$g1xNHGgEPmyG9IdigqUV5uKwFbYrTz4o54W9Bun3mIdkMPV4YwlqG', 'SALES', 0, '2025-11-16 16:05:19', '2025-11-16 16:05:19'),
(7, 'wesixgtllc@gmail.com', 'MD IMRAN KHAN', '$2b$10$tykgHI8Q46Xk5eQXQfu9LeMy08Ey4VY6QX5FqVStQmjBaYmYyPLSW', 'SALES', 1, '2025-11-16 16:06:47', '2025-11-16 16:07:14'),
(8, 'littlerockllc007@gmail.com', 'DIPAK CHAKRABORTY', '$2b$10$n8kSTEuPY7X9F8IT3E8xEuuB1fHr05fUeDlxgGC9000HFAtHLsHwW', 'SALES', 0, '2025-11-16 16:56:55', '2025-11-16 16:56:55'),
(9, 'dipokchakraborty+1@gmail.com', 'Imran Khan', '$2b$10$m.vpmfciOxL.uYHsQyxTK.ay.L./p95z0T/8XIv.R./gZy8Q/8s0K', 'SALES', 0, '2025-11-16 17:32:36', '2025-11-16 17:32:36');

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `user_id` int(11) NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 1),
(2, 3),
(3, 2),
(4, 2),
(5, 4),
(6, 4),
(7, 4),
(8, 3),
(9, 3);

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
-- Indexes for table `email_verification_tokens`
--
ALTER TABLE `email_verification_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email_verify_token` (`token`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employee_code` (`employee_code`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_employees_email` (`email`),
  ADD KEY `idx_employees_status` (`status`),
  ADD KEY `fk_employees_user` (`user_id`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_leads_search` (`prospect_name`,`primary_email`,`primary_mobile`,`project_name`,`interested_item`,`zone`),
  ADD KEY `fk_leads_prospect_stage` (`prospect_stage_id`);

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
-- Indexes for table `lead_followups`
--
ALTER TABLE `lead_followups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_followups_lead` (`lead_id`),
  ADD KEY `idx_followups_next` (`next_followup_at`),
  ADD KEY `fk_followups_user` (`created_by`);

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
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `prospect_stages`
--
ALTER TABLE `prospect_stages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `jti` (`jti`),
  ADD KEY `fk_rt_user` (`user_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `email_verification_tokens`
--
ALTER TABLE `email_verification_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `lead_followups`
--
ALTER TABLE `lead_followups`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `prospect_stages`
--
ALTER TABLE `prospect_stages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `contacts`
--
ALTER TABLE `contacts`
  ADD CONSTRAINT `fk_contacts_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `email_verification_tokens`
--
ALTER TABLE `email_verification_tokens`
  ADD CONSTRAINT `email_verification_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `fk_employees_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `leads`
--
ALTER TABLE `leads`
  ADD CONSTRAINT `fk_leads_prospect_stage` FOREIGN KEY (`prospect_stage_id`) REFERENCES `prospect_stages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
-- Constraints for table `lead_followups`
--
ALTER TABLE `lead_followups`
  ADD CONSTRAINT `fk_followups_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_followups_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

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

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`);

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
