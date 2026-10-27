<?php

namespace app\admin\model\nft;

use think\Model;

class Lottery extends Model
{
    protected $name = 'nft_lottery';
    protected $autoWriteTimestamp = 'int';
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $append = [
        'status_text',
        'start_time_text',
        'end_time_text',
        'open_time_text',
    ];

    public function getStatusList()
    {
        return [
            'draft'       => '草稿',
            'not_started' => '申购中',
            'drawing'     => '已开奖',
            'finished'    => '已结束',
        ];
    }

    public function getStatusTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['status']) ? $data['status'] : '');
        $list = $this->getStatusList();
        return isset($list[$value]) ? $list[$value] : '';
    }

    public function getStartTimeTextAttr($value, $data)
    {
        $value = isset($data['start_time']) ? $data['start_time'] : 0;
        return $value ? date('Y-m-d H:i:s', $value) : '';
    }

    public function getEndTimeTextAttr($value, $data)
    {
        $value = isset($data['end_time']) ? $data['end_time'] : 0;
        return $value ? date('Y-m-d H:i:s', $value) : '';
    }

    public function getOpenTimeTextAttr($value, $data)
    {
        $value = isset($data['open_time']) ? $data['open_time'] : 0;
        return $value ? date('Y-m-d H:i:s', $value) : '';
    }

    public function setStartTimeAttr($value)
    {
        return $value && !is_numeric($value) ? strtotime($value) : ($value ?: null);
    }

    public function setEndTimeAttr($value)
    {
        return $value && !is_numeric($value) ? strtotime($value) : ($value ?: null);
    }

    public function setOpenTimeAttr($value)
    {
        return $value && !is_numeric($value) ? strtotime($value) : ($value ?: null);
    }

    public function collection()
    {
        return $this->belongsTo('app\admin\model\nft\Collection', 'collection_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }
}
