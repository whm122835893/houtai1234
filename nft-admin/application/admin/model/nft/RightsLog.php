<?php

namespace app\admin\model\nft;

use think\Model;

class RightsLog extends Model
{
    protected $name = 'nft_rights_log';
    protected $autoWriteTimestamp = 'int';
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $append = [
        'status_text',
        'usetime_text',
    ];

    public function getStatusList()
    {
        return ['unused' => '未核销', 'used' => '已核销', 'expired' => '已过期'];
    }

    public function getStatusTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['status']) ? $data['status'] : '');
        $list = $this->getStatusList();
        return isset($list[$value]) ? $list[$value] : '';
    }

    public function getUsetimeTextAttr($value, $data)
    {
        $value = isset($data['usetime']) ? $data['usetime'] : 0;
        return $value ? date('Y-m-d H:i:s', $value) : '';
    }

    public function rights()
    {
        return $this->belongsTo('app\admin\model\nft\Rights', 'rights_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }

    public function user()
    {
        return $this->belongsTo('app\admin\model\User', 'user_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }

    /**
     * 生成核销码
     */
    public static function generateCode()
    {
        return 'RY' . strtoupper(dechex(time())) . str_pad(mt_rand(1, 46655), 3, '0', STR_PAD_LEFT);
    }
}
