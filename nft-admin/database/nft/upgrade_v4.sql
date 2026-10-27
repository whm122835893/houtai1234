-- ============================================================
-- 数字藏品后台 V4 升级包
-- 新增：藏品单品寄售开关（consign_open）+ 寄售限价（consign_price_min/max）
--       寄售审核强校验（开关 + 限价区间）
-- 导入：mysql -u root -p fastadmin < upgrade_v4.sql
-- ============================================================
SET NAMES utf8mb4;

-- 藏品表增加单品寄售开关与限价字段
ALTER TABLE `fa_nft_collection`
  ADD COLUMN `consign_open` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否允许寄售' AFTER `is_recommend`,
  ADD COLUMN `consign_price_min` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '寄售限价下限(0不限)' AFTER `consign_open`,
  ADD COLUMN `consign_price_max` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '寄售限价上限(0不限)' AFTER `consign_price_min`;

-- 演示：开启敦煌飞天的寄售并设置限价区间 10 ~ 99999
UPDATE `fa_nft_collection` SET `consign_open` = 1, `consign_price_min` = 10.00, `consign_price_max` = 99999.00 WHERE `id` = 1;
