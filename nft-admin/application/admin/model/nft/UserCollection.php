<?php

namespace app\admin\model\nft;

use think\Model;

class UserCollection extends Model
{
    protected $name = 'nft_user_collection';
    protected $autoWriteTimestamp = 'int';
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $append = [
        'status_text',
        'source_text',
        'lock_until_text',
    ];

    public function getStatusList()
    {
        return [
            'normal'      => '正常',
            'locked'      => '锁定',
            'burned'      => '已销毁',
            'transferred' => '已转移',
        ];
    }

    public function getSourceList()
    {
        return [
            'purchase' => '购买',
            'airdrop'  => '空投',
            'merge'    => '合成',
            'transfer' => '转移',
        ];
    }

    public function getSourceTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['source']) ? $data['source'] : '');
        $list = $this->getSourceList();
        return isset($list[$value]) ? $list[$value] : '';
    }

    public function getStatusTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['status']) ? $data['status'] : '');
        $list = $this->getStatusList();
        return isset($list[$value]) ? $list[$value] : '';
    }

    public function getLockUntilTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['lock_until']) ? $data['lock_until'] : '');
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
}
