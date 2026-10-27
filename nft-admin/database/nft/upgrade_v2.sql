-- ============================================================
-- 数字藏品后台 V2 升级包
-- 新增：实名认证 / 白名单 / 转赠 / 寄售市场 / 权益 / 抽签申购
-- 导入：mysql -u root -p fastadmin < upgrade_v2.sql
-- ============================================================
SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- 1. 实名认证 (KYC)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fa_nft_kyc` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户ID',
  `real_name` varchar(50) NOT NULL DEFAULT '' COMMENT '真实姓名',
  `idcard` varchar(64) NOT NULL DEFAULT '' COMMENT '身份证号',
  `idcard_front` varchar(255) NOT NULL DEFAULT '' COMMENT '身份证人像面',
  `idcard_back` varchar(255) NOT NULL DEFAULT '' COMMENT '身份证国徽面',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending' COMMENT '审核状态',
  `reject_reason` varchar(255) NOT NULL DEFAULT '' COMMENT '拒绝原因',
  `audit_time` int(10) unsigned DEFAULT NULL COMMENT '审核时间',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '提交时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='实名认证';

-- ------------------------------------------------------------
-- 2. 白名单（优先购）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fa_nft_whitelist` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户ID',
  `collection_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '藏品ID(0=全部藏品)',
  `remark` varchar(255) NOT NULL DEFAULT '' COMMENT '备注',
  `status` enum('normal','hidden') NOT NULL DEFAULT 'normal' COMMENT '状态',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `collection_id` (`collection_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优先购白名单';

-- ------------------------------------------------------------
-- 3. 转赠记录
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fa_nft_transfer` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `sn` varchar(32) NOT NULL DEFAULT '' COMMENT '转赠单号',
  `user_collection_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户藏品ID',
  `from_user_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '转赠人',
  `to_user_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '受赠人',
  `status` enum('pending','success','rejected','cancelled') NOT NULL DEFAULT 'pending' COMMENT '转赠状态',
  `chain_tx_hash` varchar(128) NOT NULL DEFAULT '' COMMENT '链上交易哈希',
  `remark` varchar(255) NOT NULL DEFAULT '' COMMENT '备注',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '申请时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `sn` (`sn`),
  KEY `from_user_id` (`from_user_id`),
  KEY `to_user_id` (`to_user_id`),
  KEY `user_collection_id` (`user_collection_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='转赠记录';

-- ------------------------------------------------------------
-- 4. 寄售市场
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fa_nft_consignment` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `sn` varchar(32) NOT NULL DEFAULT '' COMMENT '寄售单号',
  `user_collection_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户藏品ID',
  `user_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '寄售人',
  `collection_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '藏品ID',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '寄售价',
  `status` enum('pending','onsale','sold','offline','cancelled') NOT NULL DEFAULT 'pending' COMMENT '寄售状态',
  `audit_time` int(10) unsigned DEFAULT NULL COMMENT '审核时间',
  `sale_time` int(10) unsigned DEFAULT NULL COMMENT '售出时间',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `sn` (`sn`),
  KEY `user_id` (`user_id`),
  KEY `collection_id` (`collection_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='寄售市场';

-- ------------------------------------------------------------
-- 5. 藏品权益
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fa_nft_rights` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL DEFAULT '' COMMENT '权益名称',
  `type` enum('physical','coupon','offline','virtual') NOT NULL DEFAULT 'virtual' COMMENT '权益类型',
  `description` text COMMENT '权益说明',
  `image` varchar(255) NOT NULL DEFAULT '' COMMENT '权益图片',
  `collection_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '关联藏品(0=通用)',
  `stock` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '库存',
  `status` enum('normal','hidden') NOT NULL DEFAULT 'normal' COMMENT '状态',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `collection_id` (`collection_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='藏品权益';

-- ------------------------------------------------------------
-- 6. 权益核销记录
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fa_nft_rights_log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `rights_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '权益ID',
  `user_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户ID',
  `user_collection_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户藏品ID',
  `code` varchar(32) NOT NULL DEFAULT '' COMMENT '核销码',
  `status` enum('unused','used','expired') NOT NULL DEFAULT 'unused' COMMENT '核销状态',
  `usetime` int(10) unsigned DEFAULT NULL COMMENT '核销时间',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '领取时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `rights_id` (`rights_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权益核销记录';

-- ------------------------------------------------------------
-- 7. 抽签申购
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fa_nft_lottery` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL DEFAULT '' COMMENT '活动标题',
  `collection_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '藏品ID',
  `total_number` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '申购份数',
  `win_number` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '中签份数',
  `start_time` int(10) unsigned DEFAULT NULL COMMENT '开始时间',
  `end_time` int(10) unsigned DEFAULT NULL COMMENT '截止时间',
  `open_time` int(10) unsigned DEFAULT NULL COMMENT '开奖时间',
  `status` enum('draft','not_started','drawing','finished') NOT NULL DEFAULT 'draft' COMMENT '活动状态',
  `remark` varchar(255) NOT NULL DEFAULT '' COMMENT '备注',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `collection_id` (`collection_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='抽签申购';

-- ------------------------------------------------------------
-- 8. 申购记录
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fa_nft_lottery_log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `lottery_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '活动ID',
  `user_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户ID',
  `is_win` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否中签',
  `status` enum('pending','win','missed') NOT NULL DEFAULT 'pending' COMMENT '结果状态',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '申购时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `lottery_id` (`lottery_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='申购记录';

-- ============================================================
-- 菜单与权限节点
-- ============================================================

-- 实名认证
INSERT INTO `fa_auth_rule` (`type`, `pid`, `name`, `title`, `icon`, `ismenu`, `weigh`, `status`) VALUES
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/kyc', '实名认证', 'fa fa-id-card', 1, 89, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/kyc/index', '查看', '', 0, 0, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/kyc/audit', '审核', '', 0, 0, 'normal');

-- 白名单
INSERT INTO `fa_auth_rule` (`type`, `pid`, `name`, `title`, `icon`, `ismenu`, `weigh`, `status`) VALUES
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/whitelist', '优先购白名单', 'fa fa-check-square-o', 1, 88, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/whitelist/index', '查看', '', 0, 0, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/whitelist/add', '添加', '', 0, 0, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/whitelist/edit', '编辑', '', 0, 0, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/whitelist/del', '删除', '', 0, 0, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/whitelist/multi', '批量更新', '', 0, 0, 'normal');

-- 转赠管理
INSERT INTO `fa_auth_rule` (`type`, `pid`, `name`, `title`, `icon`, `ismenu`, `weigh`, `status`) VALUES
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/transfer', '转赠管理', 'fa fa-exchange', 1, 87, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/transfer/index', '查看', '', 0, 0, 'normal');

-- 寄售市场
INSERT INTO `fa_auth_rule` (`type`, `pid`, `name`, `title`, `icon`, `ismenu`, `weigh`, `status`) VALUES
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/consignment', '寄售市场', 'fa fa-tags', 1, 86, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/consignment/index', '查看', '', 0, 0, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/consignment/audit', '审核', '', 0, 0, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/consignment/offline', '下架', '', 0, 0, 'normal');

-- 权益管理
INSERT INTO `fa_auth_rule` (`type`, `pid`, `name`, `title`, `icon`, `ismenu`, `weigh`, `status`) VALUES
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/rights', '权益管理', 'fa fa-trophy', 1, 85, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/rights/index', '查看', '', 0, 0, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/rights/add', '添加', '', 0, 0, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/rights/edit', '编辑', '', 0, 0, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/rights/del', '删除', '', 0, 0, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/rights/multi', '批量更新', '', 0, 0, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/rights/log', '核销记录', '', 0, 0, 'normal');

-- 抽签申购
INSERT INTO `fa_auth_rule` (`type`, `pid`, `name`, `title`, `icon`, `ismenu`, `weigh`, `status`) VALUES
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/lottery', '抽签申购', 'fa fa-ticket', 1, 84, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/lottery/index', '查看', '', 0, 0, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/lottery/add', '添加', '', 0, 0, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/lottery/edit', '编辑', '', 0, 0, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/lottery/del', '删除', '', 0, 0, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/lottery/multi', '批量更新', '', 0, 0, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/lottery/draw', '开奖', '', 0, 0, 'normal'),
('file', (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t), 'nft/lottery/log', '申购记录', '', 0, 0, 'normal');

-- 数据看板：把主菜单 Dashboard 指向 NFT 数据看板
UPDATE `fa_auth_rule` SET `name`='nft/dashboard', `title`='数据看板', `icon`='fa fa-diamond' WHERE `name`='dashboard' AND `pid`=0;
SET @dash_pid = (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft/dashboard' AND pid=0 LIMIT 1) t);
INSERT INTO `fa_auth_rule` (`type`, `pid`, `name`, `title`, `icon`, `ismenu`, `weigh`, `status`) VALUES
('file', @dash_pid, 'nft/dashboard/index', '查看', '', 0, 0, 'normal'),
('file', @dash_pid, 'nft/dashboard/stats', '统计数据', '', 0, 0, 'normal'),
('file', @dash_pid, 'nft/dashboard/trend', '趋势数据', '', 0, 0, 'normal'),
('file', @dash_pid, 'nft/dashboard/recent', '最新动态', '', 0, 0, 'normal');
