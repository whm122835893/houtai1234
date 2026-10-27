<?php

namespace app\admin\model\nft;

use think\Model;

class InviteLog extends Model
{
    protected $name = 'nft_invite_log';
    protected $autoWriteTimestamp = 'int';
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $append = [
        'status_text',
    ];

    public function getStatusList()
    {
        return ['normal' => '有效', 'invalid' => '无效'];
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

    public function invitee()
    {
        return $this->belongsTo('app\admin\model\User', 'invitee_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }
}
