-- ============================================================
-- 数字藏品后台 V3 升级包
-- 新增：签到体系 / 邀请分销体系 / 转赠审核执行权限
-- 导入：mysql -u root -p fastadmin < upgrade_v3.sql
-- ============================================================
SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- 1. 签到记录
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fa_nft_sign_log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户ID',
  `days` int(10) unsigned NOT NULL DEFAULT '1' COMMENT '连续签到天数',
  `score` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '奖励积分',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '签到时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `createtime` (`createtime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='签到记录';

-- ------------------------------------------------------------
-- 2. 邀请记录
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fa_nft_invite_log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '邀请人ID',
  `invitee_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '被邀请人ID',
  `score` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '邀请人奖励积分',
  `status` enum('normal','invalid') NOT NULL DEFAULT 'normal' COMMENT '记录状态',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '邀请时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `invitee_id` (`invitee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='邀请记录';

-- ============================================================
-- 菜单与权限节点
-- ============================================================
SET @nft_pid = (SELECT id FROM (SELECT id FROM fa_auth_rule WHERE name='nft' AND pid=0 LIMIT 1) t);

-- 签到管理
INSERT INTO `fa_auth_rule` (`type`, `pid`, `name`, `title`, `icon`, `ismenu`, `weigh`, `status`) VALUES
('file', @nft_pid, 'nft/sign', '签到管理', 'fa fa-calendar-check-o', 1, 83, 'normal'),
('file', @nft_pid, 'nft/sign/index', '查看', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/sign/config', '签到配置', '', 0, 0, 'normal');

-- 邀请管理
INSERT INTO `fa_auth_rule` (`type`, `pid`, `name`, `title`, `icon`, `ismenu`, `weigh`, `status`) VALUES
('file', @nft_pid, 'nft/invite', '邀请管理', 'fa fa-share-alt', 1, 82, 'normal'),
('file', @nft_pid, 'nft/invite/index', '查看', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/invite/ranking', '邀请排行榜', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/invite/config', '邀请配置', '', 0, 0, 'normal');

-- 转赠审核执行节点
INSERT INTO `fa_auth_rule` (`type`, `pid`, `name`, `title`, `icon`, `ismenu`, `weigh`, `status`) VALUES
('file', @nft_pid, 'nft/transfer/approve', '通过转赠', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/transfer/reject', '拒绝转赠', '', 0, 0, 'normal');
