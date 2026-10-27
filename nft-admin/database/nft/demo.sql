-- 演示数据（可在环境重置后重新导入）
-- 用法: mysql -u root fastadmin < database/nft/demo.sql
SET NAMES utf8mb4;

DELETE FROM fa_nft_category;
DELETE FROM fa_nft_series;
DELETE FROM fa_nft_collection;
DELETE FROM fa_nft_user_collection;
DELETE FROM fa_nft_order;
DELETE FROM fa_nft_sign_log;
DELETE FROM fa_nft_invite_log;
DELETE FROM fa_nft_transfer;
DELETE FROM fa_nft_consignment;
DELETE FROM fa_nft_announcement;
DELETE FROM fa_nft_banner;

INSERT INTO fa_nft_category (id,pid,name,image,keywords,description,weigh,status,createtime,updatetime) VALUES
(1,0,'数字艺术','/assets/img/avatar.png','艺术,数字','数字艺术类藏品',99,'normal',UNIX_TIMESTAMP(),UNIX_TIMESTAMP()),
(2,0,'潮流潮玩','/assets/img/avatar.png','潮玩,IP','潮流IP衍生藏品',98,'normal',UNIX_TIMESTAMP(),UNIX_TIMESTAMP());

INSERT INTO fa_nft_series (id,category_id,name,cover,banner,description,is_box,box_price,total_supply,sold_count,start_time,end_time,weigh,status,createtime,updatetime) VALUES
(1,1,'星辰宇宙','/assets/img/avatar.png','/assets/img/avatar.png','星辰宇宙系列数字艺术品',0,0.00,1000,320,UNIX_TIMESTAMP(),UNIX_TIMESTAMP()+86400*30,99,'normal',UNIX_TIMESTAMP(),UNIX_TIMESTAMP()),
(2,2,'赛博熊猫','/assets/img/avatar.png','/assets/img/avatar.png','赛博朋克风格熊猫IP',1,99.00,500,180,UNIX_TIMESTAMP(),UNIX_TIMESTAMP()+86400*30,98,'normal',UNIX_TIMESTAMP(),UNIX_TIMESTAMP());

INSERT INTO fa_nft_collection (id,series_id,category_id,name,image,description,detail,attributes,price,original_price,stock,minted_count,max_per_user,chain_id,sale_status,status,weigh,is_recommend,consign_open,views,likes,createtime,updatetime) VALUES
(1,1,1,'星辰一号','/assets/img/avatar.png','星辰系列首款藏品','<p>星辰一号详细介绍</p>','{"rarity":"稀有","color":"蓝"}',299.00,399.00,1000,320,2,1,'on_sale','normal',99,1,1,1280,86,UNIX_TIMESTAMP(),UNIX_TIMESTAMP()),
(2,2,2,'赛博熊猫·霓虹','/assets/img/avatar.png','赛博熊猫霓虹限定','<p>霓虹限定款</p>','{"rarity":"史诗","color":"紫"}',199.00,299.00,500,180,1,1,'on_sale','normal',98,1,1,960,152,UNIX_TIMESTAMP(),UNIX_TIMESTAMP()),
(3,1,1,'星辰二号','/assets/img/avatar.png','星辰系列第二款','<p>星辰二号</p>','{"rarity":"普通","color":"白"}',99.00,129.00,2000,540,5,1,'on_sale','normal',97,0,1,640,45,UNIX_TIMESTAMP(),UNIX_TIMESTAMP()),
(4,2,2,'赛博熊猫·经典','/assets/img/avatar.png','经典款熊猫','<p>经典款</p>','{"rarity":"传说","color":"金"}',888.00,999.00,100,42,1,1,'sold_out','normal',96,1,0,2200,310,UNIX_TIMESTAMP(),UNIX_TIMESTAMP());

INSERT IGNORE INTO fa_user (id,group_id,username,nickname,password,salt,email,mobile,avatar,level,score,money,status,createtime,updatetime) VALUES
(2,1,'user002','收藏家小王','','','u2@test.com','13800138002','/assets/img/avatar.png',1,120.00,1000.00,'normal',UNIX_TIMESTAMP(),UNIX_TIMESTAMP());
UPDATE fa_user SET nickname='收藏家小李', mobile='13800138001', level=2, score=260.00, money=2500.00 WHERE id=1;

INSERT INTO fa_nft_user_collection (id,user_id,collection_id,series_id,token_id,source,quantity,status,createtime,updatetime) VALUES
(1,1,1,1,'TOKEN-000001','purchase',1,'normal',UNIX_TIMESTAMP()-86400*5,UNIX_TIMESTAMP()),
(2,2,2,2,'TOKEN-000002','purchase',1,'normal',UNIX_TIMESTAMP()-86400*3,UNIX_TIMESTAMP()),
(3,1,3,1,'TOKEN-000003','airdrop',1,'normal',UNIX_TIMESTAMP()-86400*2,UNIX_TIMESTAMP());

INSERT INTO fa_nft_order (order_no,user_id,collection_id,series_id,user_collection_id,quantity,price,total_price,pay_price,pay_type,pay_status,pay_time,status,createtime,updatetime) VALUES
('NO20261027001',1,1,1,1,1,299.00,299.00,299.00,'wechat','paid',UNIX_TIMESTAMP()-86400*5,'completed',UNIX_TIMESTAMP()-86400*5,UNIX_TIMESTAMP()),
('NO20261027002',2,2,2,2,1,199.00,199.00,199.00,'alipay','paid',UNIX_TIMESTAMP()-86400*3,'completed',UNIX_TIMESTAMP()-86400*3,UNIX_TIMESTAMP()),
('NO20261027003',1,3,1,3,1,99.00,99.00,0.00,'balance','paid',UNIX_TIMESTAMP()-86400*2,'completed',UNIX_TIMESTAMP()-86400*2,UNIX_TIMESTAMP());

INSERT INTO fa_nft_sign_log (user_id,days,score,createtime,updatetime) VALUES
(1,1,5,UNIX_TIMESTAMP()-172800,UNIX_TIMESTAMP()-172800),
(1,2,10,UNIX_TIMESTAMP()-86400,UNIX_TIMESTAMP()-86400),
(1,3,15,UNIX_TIMESTAMP(),UNIX_TIMESTAMP()),
(2,1,5,UNIX_TIMESTAMP()-86400,UNIX_TIMESTAMP()-86400),
(2,2,10,UNIX_TIMESTAMP(),UNIX_TIMESTAMP());

INSERT INTO fa_nft_invite_log (user_id,invitee_id,score,status,createtime,updatetime) VALUES
(1,2,50,'normal',UNIX_TIMESTAMP()-86400*3,UNIX_TIMESTAMP()-86400*3);

INSERT INTO fa_nft_transfer (sn,user_collection_id,from_user_id,to_user_id,status,remark,createtime,updatetime) VALUES
('TR20261027001',2,2,1,'pending','转赠给好友',UNIX_TIMESTAMP()-3600,UNIX_TIMESTAMP()-3600),
('TR20261027002',1,1,2,'success','收藏纪念转赠',UNIX_TIMESTAMP()-86400*2,UNIX_TIMESTAMP()-86400*2);

INSERT INTO fa_nft_consignment (sn,user_collection_id,user_id,collection_id,price,status,audit_time,sale_time,createtime,updatetime) VALUES
('CS20261027001',1,1,1,350.00,'onsale',UNIX_TIMESTAMP()-86400,0,UNIX_TIMESTAMP()-86400*2,UNIX_TIMESTAMP()),
('CS20261027002',2,2,2,399.00,'pending',0,0,UNIX_TIMESTAMP()-3600,UNIX_TIMESTAMP()),
('CS20261027003',3,1,3,888.00,'sold',UNIX_TIMESTAMP()-86400*3,UNIX_TIMESTAMP()-86400,UNIX_TIMESTAMP()-86400*4,UNIX_TIMESTAMP());

INSERT INTO fa_nft_announcement (title,content,type,is_top,weigh,status,createtime,updatetime) VALUES
('平台上线公告','<p>欢迎使用数字藏品平台，<strong>首批藏品已上线</strong>！</p><ul><li>每日签到赢积分</li><li>邀请好友得奖励</li></ul>',1,1,10,'normal',UNIX_TIMESTAMP()-86400*2,UNIX_TIMESTAMP()),
('中秋节活动公告','<p>中秋限时活动：<em>签到双倍积分</em></p>',2,0,5,'normal',UNIX_TIMESTAMP()-86400,UNIX_TIMESTAMP());

INSERT INTO fa_nft_banner (title,image,link,target,`group`,weigh,status,createtime,updatetime) VALUES
('星辰宇宙首发','/assets/img/avatar.png','/nft/series/1','_blank','index',99,'normal',UNIX_TIMESTAMP(),UNIX_TIMESTAMP()),
('赛博熊猫上新','/assets/img/avatar.png','/nft/series/2','_blank','index',98,'normal',UNIX_TIMESTAMP(),UNIX_TIMESTAMP());
