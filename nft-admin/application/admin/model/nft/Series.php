<?php

namespace app\admin\model\nft;

use think\Model;

class Series extends Model
{
    protected $name = 'nft_series';
    protected $autoWriteTimestamp = 'int';
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $append = [
        'status_text',
        'start_time_text',
        'end_time_text',
    ];

    public function getStatusList()
    {
        return ['normal' => '正常', 'hidden' => '隐藏'];
    }

    public function getIsBoxList()
    {
        return ['0' => '否', '1' => '是'];
    }

    public function getStatusTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['status']) ? $data['status'] : '');
        $list = $this->getStatusList();
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

    public function category()
    {
        return $this->belongsTo('app\admin\model\nft\Category', 'category_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }
}
