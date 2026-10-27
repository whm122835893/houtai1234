<?php

namespace app\admin\model\nft;

use think\Model;

class Collection extends Model
{
    protected $name = 'nft_collection';
    protected $autoWriteTimestamp = 'int';
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $append = [
        'status_text',
        'sale_status_text',
        'start_time_text',
        'end_time_text',
    ];

    public function getStatusList()
    {
        return ['normal' => '正常', 'hidden' => '隐藏'];
    }

    public function getSaleStatusList()
    {
        return [
            'not_started' => '未开始',
            'on_sale'     => '发售中',
            'ended'       => '已结束',
            'sold_out'    => '已售罄',
        ];
    }

    public function getIsRecommendList()
    {
        return ['0' => '否', '1' => '是'];
    }

    public function getConsignOpenList()
    {
        return ['0' => '禁止寄售', '1' => '允许寄售'];
    }

    public function getStatusTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['status']) ? $data['status'] : '');
        $list = $this->getStatusList();
        return isset($list[$value]) ? $list[$value] : '';
    }

    public function getSaleStatusTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['sale_status']) ? $data['sale_status'] : '');
        $list = $this->getSaleStatusList();
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

    public function getAttributesAttr($value)
    {
        return json_decode($value, true) ?: [];
    }

    public function setAttributesAttr($value)
    {
        return is_array($value) ? json_encode($value, JSON_UNESCAPED_UNICODE) : $value;
    }

    public function category()
    {
        return $this->belongsTo('app\admin\model\nft\Category', 'category_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }

    public function series()
    {
        return $this->belongsTo('app\admin\model\nft\Series', 'series_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }
}
