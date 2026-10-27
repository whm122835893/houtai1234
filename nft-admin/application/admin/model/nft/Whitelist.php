<?php

namespace app\admin\model\nft;

use think\Model;

class Whitelist extends Model
{
    protected $name = 'nft_whitelist';
    protected $autoWriteTimestamp = 'int';
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $append = [
        'status_text',
    ];

    public function getStatusList()
    {
        return ['normal' => '正常', 'hidden' => '隐藏'];
    }

    public function getStatusTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['status']) ? $data['status'] : '');
        $list = $this->getStatusList();
        return isset($list[$value]) ? $list[$value] : '';
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
