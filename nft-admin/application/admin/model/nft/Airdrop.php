<?php

namespace app\admin\model\nft;

use think\Model;

class Airdrop extends Model
{
    protected $name = 'nft_airdrop';
    protected $autoWriteTimestamp = 'int';
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $append = [
        'status_text',
        'condition_type_text',
        'start_time_text',
        'end_time_text',
    ];

    public function getStatusList()
    {
        return ['normal' => '正常', 'hidden' => '隐藏'];
    }

    public function getConditionTypeList()
    {
        return [
            'all'       => '全部用户',
            'new_user'  => '新用户',
            'vip'       => 'VIP用户',
            'specified' => '指定用户',
        ];
    }

    public function getStatusTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['status']) ? $data['status'] : '');
        $list = $this->getStatusList();
        return isset($list[$value]) ? $list[$value] : '';
    }

    public function getConditionTypeTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['condition_type']) ? $data['condition_type'] : '');
        $list = $this->getConditionTypeList();
        return isset($list[$value]) ? $list[$value] : '';
    }

    public function getStartTimeTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['start_time']) ? $data['start_time'] : '');
        return is_numeric($value) ? date('Y-m-d H:i:s', $value) : $value;
    }

    public function getEndTimeTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['end_time']) ? $data['end_time'] : '');
        return is_numeric($value) ? date('Y-m-d H:i:s', $value) : $value;
    }

    public function setStartTimeAttr($value)
    {
        return $value === '' ? null : ($value && !is_numeric($value) ? strtotime($value) : $value);
    }

    public function setEndTimeAttr($value)
    {
        return $value === '' ? null : ($value && !is_numeric($value) ? strtotime($value) : $value);
    }

    public function collection()
    {
        return $this->belongsTo('app\admin\model\nft\Collection', 'collection_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }
}
