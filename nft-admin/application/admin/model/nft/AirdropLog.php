<?php

namespace app\admin\model\nft;

use think\Model;

class AirdropLog extends Model
{
    protected $name = 'nft_airdrop_log';
    protected $autoWriteTimestamp = 'int';
    protected $createTime = 'createtime';
    protected $append = [
        'status_text',
    ];

    public function getStatusList()
    {
        return ['pending' => '待处理', 'success' => '成功', 'fail' => '失败'];
    }

    public function getStatusTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['status']) ? $data['status'] : '');
        $list = $this->getStatusList();
        return isset($list[$value]) ? $list[$value] : '';
    }

    public function airdrop()
    {
        return $this->belongsTo('app\admin\model\nft\Airdrop', 'airdrop_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }

    public function user()
    {
        return $this->belongsTo('app\admin\model\User', 'user_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }
}
