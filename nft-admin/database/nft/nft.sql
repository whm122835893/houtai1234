-- 数字藏品业务表
-- 数据库: utf8mb4
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 藏品分类
-- ----------------------------
DROP TABLE IF EXISTS `fa_nft_category`;
CREATE TABLE `fa_nft_category` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '父级ID',
  `name` varchar(100) NOT NULL DEFAULT '' COMMENT '分类名称',
  `image` varchar(255) NOT NULL DEFAULT '' COMMENT '分类图片',
  `keywords` varchar(255) NOT NULL DEFAULT '' COMMENT '关键词',
  `description` varchar(255) NOT NULL DEFAULT '' COMMENT '描述',
  `weigh` int(10) NOT NULL DEFAULT '0' COMMENT '权重',
  `status` enum('normal','hidden') NOT NULL DEFAULT 'normal' COMMENT '状态',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='藏品分类';

-- ----------------------------
-- 藏品系列
-- ----------------------------
DROP TABLE IF EXISTS `fa_nft_series`;
CREATE TABLE `fa_nft_series` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '分类ID',
  `name` varchar(100) NOT NULL DEFAULT '' COMMENT '系列名称',
  `cover` varchar(255) NOT NULL DEFAULT '' COMMENT '封面图',
  `banner` varchar(255) NOT NULL DEFAULT '' COMMENT '横幅图',
  `description` text COMMENT '描述',
  `is_box` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否盲盒',
  `box_price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '盲盒价格',
  `total_supply` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '总供应量',
  `sold_count` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '已售数量',
  `start_time` int(10) unsigned DEFAULT NULL COMMENT '开始时间',
  `end_time` int(10) unsigned DEFAULT NULL COMMENT '结束时间',
  `weigh` int(10) NOT NULL DEFAULT '0' COMMENT '权重',
  `status` enum('normal','hidden') NOT NULL DEFAULT 'normal' COMMENT '状态',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='藏品系列';

-- ----------------------------
-- 藏品
-- ----------------------------
DROP TABLE IF EXISTS `fa_nft_collection`;
CREATE TABLE `fa_nft_collection` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `series_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '系列ID',
  `category_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '分类ID',
  `name` varchar(150) NOT NULL DEFAULT '' COMMENT '藏品名称',
  `image` varchar(255) NOT NULL DEFAULT '' COMMENT '图片',
  `animation` varchar(255) NOT NULL DEFAULT '' COMMENT '动画/视频',
  `description` varchar(500) NOT NULL DEFAULT '' COMMENT '短描述',
  `detail` text COMMENT '详情',
  `attributes` json DEFAULT NULL COMMENT '属性(JSON)',
  `creator` varchar(100) NOT NULL DEFAULT '' COMMENT '创作者',
  `creator_address` varchar(100) NOT NULL DEFAULT '' COMMENT '创作者链地址',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '售价',
  `original_price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '原价',
  `stock` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '库存',
  `minted_count` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '已铸造数量',
  `max_per_user` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '每人限购数量',
  `chain_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '链ID',
  `chain_address` varchar(100) NOT NULL DEFAULT '' COMMENT '链合约地址',
  `token_id` varchar(100) NOT NULL DEFAULT '' COMMENT '链上TokenID',
  `start_time` int(10) unsigned DEFAULT NULL COMMENT '发售开始时间',
  `end_time` int(10) unsigned DEFAULT NULL COMMENT '发售结束时间',
  `sale_status` enum('not_started','on_sale','ended','sold_out') NOT NULL DEFAULT 'not_started' COMMENT '发售状态',
  `status` enum('normal','hidden') NOT NULL DEFAULT 'normal' COMMENT '状态',
  `weigh` int(10) NOT NULL DEFAULT '0' COMMENT '权重',
  `is_recommend` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否推荐',
  `consign_open` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否允许寄售',
  `consign_price_min` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '寄售限价下限(0不限)',
  `consign_price_max` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '寄售限价上限(0不限)',
  `views` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '浏览量',
  `likes` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '点赞数',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `series_id` (`series_id`),
  KEY `category_id` (`category_id`),
  KEY `sale_status` (`sale_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='藏品';

-- ----------------------------
-- 用户藏品
-- ----------------------------
DROP TABLE IF EXISTS `fa_nft_user_collection`;
CREATE TABLE `fa_nft_user_collection` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户ID',
  `collection_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '藏品ID',
  `series_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '系列ID',
  `token_id` varchar(100) NOT NULL DEFAULT '' COMMENT '链上TokenID',
  `chain_address` varchar(100) NOT NULL DEFAULT '' COMMENT '合约地址',
  `owner_address` varchar(100) NOT NULL DEFAULT '' COMMENT '持有人地址',
  `source` enum('purchase','airdrop','merge','transfer') NOT NULL DEFAULT 'purchase' COMMENT '来源',
  `source_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '来源ID(订单/空投/合成)',
  `purchase_price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '购入价格',
  `quantity` int(10) unsigned NOT NULL DEFAULT '1' COMMENT '数量',
  `is_locked` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否锁定',
  `lock_until` int(10) unsigned DEFAULT NULL COMMENT '锁定截止时间',
  `status` enum('normal','locked','burned','transferred') NOT NULL DEFAULT 'normal' COMMENT '状态',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `collection_id` (`collection_id`),
  KEY `token_id` (`token_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户藏品';

-- ----------------------------
-- 订单
-- ----------------------------
DROP TABLE IF EXISTS `fa_nft_order`;
CREATE TABLE `fa_nft_order` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `order_no` varchar(32) NOT NULL DEFAULT '' COMMENT '订单号',
  `user_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户ID',
  `collection_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '藏品ID',
  `series_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '系列ID',
  `user_collection_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户藏品ID',
  `quantity` int(10) unsigned NOT NULL DEFAULT '1' COMMENT '数量',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '单价',
  `total_price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '总价',
  `discount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '优惠',
  `pay_price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '实付金额',
  `pay_type` enum('balance','alipay','wechat','chain') NOT NULL DEFAULT 'balance' COMMENT '支付方式',
  `pay_status` enum('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid' COMMENT '支付状态',
  `pay_time` int(10) unsigned DEFAULT NULL COMMENT '支付时间',
  `transaction_id` varchar(100) NOT NULL DEFAULT '' COMMENT '支付交易号',
  `chain_tx_hash` varchar(100) NOT NULL DEFAULT '' COMMENT '链上交易哈希',
  `status` enum('pending','paid','cancelled','refunding','refunded','completed') NOT NULL DEFAULT 'pending' COMMENT '订单状态',
  `remark` varchar(255) NOT NULL DEFAULT '' COMMENT '备注',
  `ip` varchar(50) NOT NULL DEFAULT '' COMMENT 'IP',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  KEY `user_id` (`user_id`),
  KEY `collection_id` (`collection_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单';

-- ----------------------------
-- 空投活动
-- ----------------------------
DROP TABLE IF EXISTS `fa_nft_airdrop`;
CREATE TABLE `fa_nft_airdrop` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL DEFAULT '' COMMENT '活动标题',
  `collection_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '空投藏品ID',
  `total_count` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '空投总量',
  `sent_count` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '已发送数量',
  `condition_type` enum('all','new_user','vip','specified') NOT NULL DEFAULT 'all' COMMENT '条件类型',
  `condition_value` varchar(500) NOT NULL DEFAULT '' COMMENT '条件值',
  `start_time` int(10) unsigned DEFAULT NULL COMMENT '开始时间',
  `end_time` int(10) unsigned DEFAULT NULL COMMENT '结束时间',
  `description` text COMMENT '描述',
  `status` enum('normal','hidden') NOT NULL DEFAULT 'normal' COMMENT '状态',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `collection_id` (`collection_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='空投活动';

-- ----------------------------
-- 空投记录
-- ----------------------------
DROP TABLE IF EXISTS `fa_nft_airdrop_log`;
CREATE TABLE `fa_nft_airdrop_log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `airdrop_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '空投活动ID',
  `user_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户ID',
  `username` varchar(100) NOT NULL DEFAULT '' COMMENT '用户名',
  `user_collection_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户藏品ID',
  `quantity` int(10) unsigned NOT NULL DEFAULT '1' COMMENT '数量',
  `status` enum('success','fail','pending') NOT NULL DEFAULT 'pending' COMMENT '状态',
  `remark` varchar(255) NOT NULL DEFAULT '' COMMENT '备注',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `airdrop_id` (`airdrop_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='空投记录';

-- ----------------------------
-- 合成配方
-- ----------------------------
DROP TABLE IF EXISTS `fa_nft_merge`;
CREATE TABLE `fa_nft_merge` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL DEFAULT '' COMMENT '配方名称',
  `result_collection_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '产出藏品ID',
  `result_quantity` int(10) unsigned NOT NULL DEFAULT '1' COMMENT '产出数量',
  `cost_description` varchar(500) NOT NULL DEFAULT '' COMMENT '消耗描述',
  `cost_items` json DEFAULT NULL COMMENT '消耗明细JSON',
  `max_times` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '可合成总次数',
  `used_times` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '已合成次数',
  `start_time` int(10) unsigned DEFAULT NULL COMMENT '开始时间',
  `end_time` int(10) unsigned DEFAULT NULL COMMENT '结束时间',
  `description` text COMMENT '描述',
  `status` enum('normal','hidden') NOT NULL DEFAULT 'normal' COMMENT '状态',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `result_collection_id` (`result_collection_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合成配方';

-- ----------------------------
-- 合成记录
-- ----------------------------
DROP TABLE IF EXISTS `fa_nft_merge_log`;
CREATE TABLE `fa_nft_merge_log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `merge_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '合成配方ID',
  `user_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户ID',
  `username` varchar(100) NOT NULL DEFAULT '' COMMENT '用户名',
  `cost_detail` json DEFAULT NULL COMMENT '消耗明细',
  `result_collection_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '产出藏品ID',
  `user_collection_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '产出用户藏品ID',
  `status` enum('success','fail','pending') NOT NULL DEFAULT 'pending' COMMENT '状态',
  `remark` varchar(255) NOT NULL DEFAULT '' COMMENT '备注',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `merge_id` (`merge_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='合成记录';

-- ----------------------------
-- 链上记录
-- ----------------------------
DROP TABLE IF EXISTS `fa_nft_chain_log`;
CREATE TABLE `fa_nft_chain_log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type` enum('mint','transfer','merge','burn','airdrop') NOT NULL DEFAULT 'mint' COMMENT '类型',
  `collection_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '藏品ID',
  `user_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户ID',
  `token_id` varchar(100) NOT NULL DEFAULT '' COMMENT 'TokenID',
  `contract_address` varchar(100) NOT NULL DEFAULT '' COMMENT '合约地址',
  `from_address` varchar(100) NOT NULL DEFAULT '' COMMENT '发起地址',
  `to_address` varchar(100) NOT NULL DEFAULT '' COMMENT '目标地址',
  `tx_hash` varchar(100) NOT NULL DEFAULT '' COMMENT '交易哈希',
  `block_number` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '区块高度',
  `status` enum('pending','success','fail') NOT NULL DEFAULT 'pending' COMMENT '状态',
  `chain_response` json DEFAULT NULL COMMENT '链上响应',
  `remark` varchar(255) NOT NULL DEFAULT '' COMMENT '备注',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `type` (`type`),
  KEY `tx_hash` (`tx_hash`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='链上记录';

-- ----------------------------
-- 公告
-- ----------------------------
DROP TABLE IF EXISTS `fa_nft_announcement`;
CREATE TABLE `fa_nft_announcement` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL DEFAULT '' COMMENT '标题',
  `content` text COMMENT '内容',
  `type` enum('notice','activity','update') NOT NULL DEFAULT 'notice' COMMENT '类型',
  `is_top` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否置顶',
  `weigh` int(10) NOT NULL DEFAULT '0' COMMENT '权重',
  `status` enum('normal','hidden') NOT NULL DEFAULT 'normal' COMMENT '状态',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告';

-- ----------------------------
-- 轮播图
-- ----------------------------
DROP TABLE IF EXISTS `fa_nft_banner`;
CREATE TABLE `fa_nft_banner` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL DEFAULT '' COMMENT '标题',
  `image` varchar(255) NOT NULL DEFAULT '' COMMENT '图片',
  `link` varchar(255) NOT NULL DEFAULT '' COMMENT '链接',
  `target` enum('_self','_blank') NOT NULL DEFAULT '_self' COMMENT '打开方式',
  `group` varchar(50) NOT NULL DEFAULT 'default' COMMENT '分组',
  `weigh` int(10) NOT NULL DEFAULT '0' COMMENT '权重',
  `status` enum('normal','hidden') NOT NULL DEFAULT 'normal' COMMENT '状态',
  `createtime` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  `updatetime` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轮播图';

SET FOREIGN_KEY_CHECKS = 1;
