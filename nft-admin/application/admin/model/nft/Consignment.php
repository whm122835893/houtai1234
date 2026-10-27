<?php

namespace app\admin\model\nft;

use think\Model;

class Consignment extends Model
{
    protected $name = 'nft_consignment';
    protected $autoWriteTimestamp = 'int';
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $append = [
        'status_text',
        'audit_time_text',
        'sale_time_text',
    ];

    public function getStatusList()
    {
        return [
            'pending'   => '待审核',
            'onsale'    => '寄售中',
            'sold'      => '已售出',
            'offline'   => '已下架',
            'cancelled' => '已取消',
        ];
    }

    public function getStatusTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['status']) ? $data['status'] : '');
        $list = $this->getStatusList();
        return isset($list[$value]) ? $list[$value] : '';
    }

    public function getAuditTimeTextAttr($value, $data)
    {
        $value = isset($data['audit_time']) ? $data['audit_time'] : 0;
        return $value ? date('Y-m-d H:i:s', $value) : '';
    }

    public function getSaleTimeTextAttr($value, $data)
    {
        $value = isset($data['sale_time']) ? $data['sale_time'] : 0;
        return $value ? date('Y-m-d H:i:s', $value) : '';
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
     * 生成寄售单号
     */
    public static function generateSn()
    {
        return 'CS' . date('YmdHis') . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
    }
}
