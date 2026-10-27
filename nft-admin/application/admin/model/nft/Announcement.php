<?php

namespace app\admin\model\nft;

use think\Model;

class Announcement extends Model
{
    protected $name = 'nft_announcement';
    protected $autoWriteTimestamp = 'int';
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $append = [
        'status_text',
        'type_text',
    ];

    public function getStatusList()
    {
        return ['normal' => '正常', 'hidden' => '隐藏'];
    }

    public function getTypeList()
    {
        return [
            'notice'   => '公告',
            'activity' => '活动',
            'update'   => '更新',
        ];
    }

    public function getIsTopList()
    {
        return ['0' => '否', '1' => '是'];
    }

    public function getStatusTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['status']) ? $data['status'] : '');
        $list = $this->getStatusList();
        return isset($list[$value]) ? $list[$value] : '';
    }

    public function getTypeTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['type']) ? $data['type'] : '');
        $list = $this->getTypeList();
        return isset($list[$value]) ? $list[$value] : '';
    }
}
