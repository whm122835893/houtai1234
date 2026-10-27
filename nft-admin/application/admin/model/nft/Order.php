<?php

namespace app\admin\model\nft;

use think\Model;

class Order extends Model
{
    protected $name = 'nft_order';
    protected $autoWriteTimestamp = 'int';
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $append = [
        'status_text',
        'pay_status_text',
        'pay_type_text',
        'pay_time_text',
    ];

    public function getStatusList()
    {
        return [
            'pending'   => '待支付',
            'paid'      => '已支付',
            'cancelled' => '已取消',
            'refunding' => '退款中',
            'refunded'  => '已退款',
            'completed' => '已完成',
        ];
    }

    public function getPayStatusList()
    {
        return [
            'unpaid'   => '未支付',
            'paid'     => '已支付',
            'refunded' => '已退款',
        ];
    }

    public function getPayTypeList()
    {
        return [
            'balance' => '余额',
            'alipay'  => '支付宝',
            'wechat'  => '微信',
            'chain'   => '链上支付',
        ];
    }

    public function getStatusTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['status']) ? $data['status'] : '');
        $list = $this->getStatusList();
        return isset($list[$value]) ? $list[$value] : '';
    }

    public function getPayStatusTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['pay_status']) ? $data['pay_status'] : '');
        $list = $this->getPayStatusList();
        return isset($list[$value]) ? $list[$value] : '';
    }

    public function getPayTypeTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['pay_type']) ? $data['pay_type'] : '');
        $list = $this->getPayTypeList();
        return isset($list[$value]) ? $list[$value] : '';
    }

    public function getPayTimeTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['pay_time']) ? $data['pay_time'] : '');
        return is_numeric($value) ? date('Y-m-d H:i:s', $value) : $value;
    }

    public function user()
    {
        return $this->belongsTo('app\admin\model\User', 'user_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }

    public function collection()
    {
        return $this->belongsTo('app\admin\model\nft\Collection', 'collection_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }

    /**
     * 生成订单号
     */
    public static function generateOrderNo()
    {
        return 'NFT' . date('YmdHis') . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
    }
}
