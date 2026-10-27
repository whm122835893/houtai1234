-- 数字藏品菜单与权限节点
SET NAMES utf8mb4;

-- 注意：以下 id 使用自增，实际安装时请根据现有 fa_auth_rule 最大 id 调整
-- 一级菜单
INSERT INTO `fa_auth_rule` (`type`, `pid`, `name`, `title`, `icon`, `condition`, `remark`, `ismenu`, `weigh`, `status`) VALUES
('file', 0, 'nft', '数字藏品', 'fa fa-diamond', '', '', 1, 100, 'normal');

-- 一级菜单的 id 假设为 @parent_id，下面的子菜单 pid 使用此 id
-- 但由于不知道具体 id，这里使用变量说明，实际导入时请替换

-- ========================================================
-- 以下为标准安装 SQL，使用 SET 变量方式
-- ========================================================
-- 先查出刚插入的一级菜单 ID
SET @nft_pid = (SELECT id FROM fa_auth_rule WHERE name = 'nft' AND pid = 0 LIMIT 1);

-- 子菜单与权限节点
INSERT INTO `fa_auth_rule` (`type`, `pid`, `name`, `title`, `icon`, `ismenu`, `weigh`, `status`) VALUES
-- 藏品分类
('file', @nft_pid, 'nft/category', '藏品分类', 'fa fa-list', 1, 99, 'normal'),
('file', @nft_pid, 'nft/category/index', '查看', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/category/add', '添加', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/category/edit', '编辑', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/category/del', '删除', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/category/multi', '批量更新', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/category/selectpage', 'Selectpage', '', 0, 0, 'normal'),

-- 藏品系列
('file', @nft_pid, 'nft/series', '藏品系列', 'fa fa-cubes', 1, 98, 'normal'),
('file', @nft_pid, 'nft/series/index', '查看', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/series/add', '添加', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/series/edit', '编辑', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/series/del', '删除', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/series/multi', '批量更新', '', 0, 0, 'normal'),

-- 藏品
('file', @nft_pid, 'nft/collection', '藏品管理', 'fa fa-gem', 1, 97, 'normal'),
('file', @nft_pid, 'nft/collection/index', '查看', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/collection/add', '添加', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/collection/edit', '编辑', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/collection/del', '删除', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/collection/multi', '批量更新', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/collection/onsale', '发售', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/collection/offline', '下架', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/collection/mint', '铸造', '', 0, 0, 'normal'),

-- 用户藏品
('file', @nft_pid, 'nft/usercollection', '用户藏品', 'fa fa-user-circle-o', 1, 96, 'normal'),
('file', @nft_pid, 'nft/usercollection/index', '查看', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/usercollection/transfer', '转移', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/usercollection/burn', '销毁', '', 0, 0, 'normal'),

-- 订单管理
('file', @nft_pid, 'nft/order', '订单管理', 'fa fa-shopping-cart', 1, 95, 'normal'),
('file', @nft_pid, 'nft/order/index', '查看', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/order/detail', '详情', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/order/refund', '退款', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/order/complete', '完成', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/order/cancel', '取消', '', 0, 0, 'normal'),

-- 空投活动
('file', @nft_pid, 'nft/airdrop', '空投活动', 'fa fa-gift', 1, 94, 'normal'),
('file', @nft_pid, 'nft/airdrop/index', '查看', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/airdrop/add', '添加', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/airdrop/edit', '编辑', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/airdrop/del', '删除', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/airdrop/execute', '执行空投', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/airdrop/log', '空投记录', '', 0, 0, 'normal'),

-- 合成管理
('file', @nft_pid, 'nft/merge', '合成管理', 'fa fa-random', 1, 93, 'normal'),
('file', @nft_pid, 'nft/merge/index', '查看', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/merge/add', '添加', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/merge/edit', '编辑', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/merge/del', '删除', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/merge/log', '合成记录', '', 0, 0, 'normal'),

-- 链上记录
('file', @nft_pid, 'nft/chain', '链上记录', 'fa fa-link', 1, 92, 'normal'),
('file', @nft_pid, 'nft/chain/index', '查看', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/chain/retry', '重试上链', '', 0, 0, 'normal'),

-- 公告管理
('file', @nft_pid, 'nft/announcement', '公告管理', 'fa fa-bullhorn', 1, 91, 'normal'),
('file', @nft_pid, 'nft/announcement/index', '查看', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/announcement/add', '添加', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/announcement/edit', '编辑', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/announcement/del', '删除', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/announcement/multi', '批量更新', '', 0, 0, 'normal'),

-- 轮播图管理
('file', @nft_pid, 'nft/banner', '轮播图管理', 'fa fa-picture-o', 1, 90, 'normal'),
('file', @nft_pid, 'nft/banner/index', '查看', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/banner/add', '添加', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/banner/edit', '编辑', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/banner/del', '删除', '', 0, 0, 'normal'),
('file', @nft_pid, 'nft/banner/multi', '批量更新', '', 0, 0, 'normal');
