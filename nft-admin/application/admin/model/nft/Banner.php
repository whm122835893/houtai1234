<?php

namespace app\admin\model\nft;

use think\Model;

class Banner extends Model
{
    protected $name = 'nft_banner';
    protected $autoWriteTimestamp = 'int';
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $append = [
        'status_text',
        'target_text',
    ];

    public function getStatusList()
    {
        return ['normal' => '正常', 'hidden' => '隐藏'];
    }

    public function getTargetList()
    {
        return ['_self' => '当前窗口', '_blank' => '新窗口'];
    }

    public function getStatusTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['status']) ? $data['status'] : '');
        $list = $this->getStatusList();
        return isset($list[$value]) ? $list[$value] : '';
    }

    public function getTargetTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['target']) ? $data['target'] : '');
        $list = $this->getTargetList();
        return isset($list[$value]) ? $list[$value] : '';
    }
}
