<?php

namespace app\admin\model\nft;

use think\Model;

class Transfer extends Model
{
    protected $name = 'nft_transfer';
    protected $autoWriteTimestamp = 'int';
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $append = [
        'status_text',
    ];

    public function getStatusList()
    {
        return [
            'pending'   => '待处理',
            'success'   => '转赠成功',
            'rejected'  => '已拒绝',
            'cancelled' => '已取消',
        ];
    }

    public function getStatusTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['status']) ? $data['status'] : '');
        $list = $this->getStatusList();
        return isset($list[$value]) ? $list[$value] : '';
    }

    public function fromUser()
    {
        return $this->belongsTo('app\admin\model\User', 'from_user_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }

    public function toUser()
    {
        return $this->belongsTo('app\admin\model\User', 'to_user_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }

    public function userCollection()
    {
        return $this->belongsTo('app\admin\model\nft\UserCollection', 'user_collection_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }

    /**
     * 生成转赠单号
     */
    public static function generateSn()
    {
        return 'TF' . date('YmdHis') . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
    }
}
