<?php

/**
 * 数字藏品配置文件
 */
return [
    // 链配置
    'chain' => [
        // 驱动类型: mock(模拟), ethereum(以太坊), polygon, bsc, solana
        'driver' => 'mock',
        // 默认链ID
        'chain_id' => 1,
        // RPC 地址
        'rpc_url' => 'https://rpc.example.com',
        // 合约地址
        'contract_address' => '0x0000000000000000000000000000000000000000',
        // 合约私钥(仅服务端签名)
        'contract_private_key' => '',
        // 区块链浏览器前缀
        'explorer_url' => 'https://etherscan.io/tx/',
        // gas 价格(gwei)
        'gas_price' => 30,
        // gas 限制
        'gas_limit' => 100000,
    ],

    // 支付配置
    'pay' => [
        // 支持的支付方式
        'types' => ['balance', 'alipay', 'wechat', 'chain'],
        // 支付宝配置
        'alipay' => [
            'app_id' => '',
            'private_key' => '',
            'public_key' => '',
            'notify_url' => '',
            'return_url' => '',
            'sandbox' => false,
        ],
        // 微信支付配置
        'wechat' => [
            'app_id' => '',
            'mch_id' => '',
            'api_key' => '',
            'notify_url' => '',
            'cert_path' => '',
            'key_path' => '',
        ],
        // 余额支付是否开启
        'balance_open' => true,
    ],

    // 空投配置
    'airdrop' => [
        // 是否开启链上空投
        'on_chain' => false,
        // 每批执行数量
        'batch_size' => 100,
        // 执行间隔(秒)
        'interval' => 1,
    ],

    // 合成配置
    'merge' => [
        // 是否开启链上合成
        'on_chain' => false,
        // 是否允许链上 burn+ Mint 模式
        'burn_mint_mode' => true,
    ],

    // 平台配置
    'platform' => [
        // 平台名称
        'name' => '数字藏品平台',
        // 平台服务费比例(小数)
        'service_fee_rate' => 0.05,
        // 创作者分成比例
        'creator_share_rate' => 0.95,
        // 是否开启盲盒模式
        'box_open' => true,
        // 是否开启二级转移
        'transfer_open' => true,
        // 订单过期时间(秒)
        'order_expire' => 1800,
        // 退款自动审核(超过多少天)
        'refund_auto_days' => 7,
        // 持有满多少天可转赠(0=不限制)
        'transfer_hold_days' => 0,
    ],

    // 签到配置
    'sign' => [
        // 是否开启签到
        'enabled' => true,
        // 每日签到基础积分
        'base_score' => 5,
        // 连续7天额外奖励
        'day7_bonus' => 20,
        // 连续30天额外奖励
        'day30_bonus' => 100,
    ],

    // 邀请配置
    'invite' => [
        // 是否开启邀请奖励
        'enabled' => true,
        // 邀请人奖励积分
        'inviter_score' => 100,
        // 被邀请人奖励积分
        'invitee_score' => 20,
    ],

    // 枚举值
    'enum' => [
        'sale_status' => [
            'not_started' => '未开始',
            'on_sale'     => '发售中',
            'ended'       => '已结束',
            'sold_out'    => '已售罄',
        ],
        'pay_type' => [
            'balance' => '余额',
            'alipay'  => '支付宝',
            'wechat'  => '微信',
            'chain'   => '链上支付',
        ],
        'pay_status' => [
            'unpaid'   => '未支付',
            'paid'     => '已支付',
            'refunded' => '已退款',
        ],
        'order_status' => [
            'pending'   => '待支付',
            'paid'      => '已支付',
            'cancelled' => '已取消',
            'refunding' => '退款中',
            'refunded'  => '已退款',
            'completed' => '已完成',
        ],
        'source' => [
            'purchase' => '购买',
            'airdrop'  => '空投',
            'merge'    => '合成',
            'transfer' => '转移',
        ],
        'airdrop_condition' => [
            'all'       => '全部用户',
            'new_user'  => '新用户',
            'vip'       => 'VIP用户',
            'specified' => '指定用户',
        ],
        'chain_log_type' => [
            'mint'    => '铸造',
            'transfer'=> '转移',
            'merge'   => '合成',
            'burn'    => '销毁',
            'airdrop' => '空投',
        ],
        'announcement_type' => [
            'notice'  => '公告',
            'activity'=> '活动',
            'update'  => '更新',
        ],
        'status' => [
            'normal' => '正常',
            'hidden' => '隐藏',
        ],
    ],
];
