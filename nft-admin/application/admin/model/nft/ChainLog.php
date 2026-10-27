<?php

namespace app\admin\model\nft;

use think\Model;

class ChainLog extends Model
{
    protected $name = 'nft_chain_log';
    protected $autoWriteTimestamp = 'int';
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $append = [
        'status_text',
        'type_text',
    ];

    public function getStatusList()
    {
        return ['pending' => '待确认', 'success' => '成功', 'fail' => '失败'];
    }

    public function getTypeList()
    {
        return [
            'mint'     => '铸造',
            'transfer' => '转移',
            'merge'    => '合成',
            'burn'     => '销毁',
            'airdrop'  => '空投',
        ];
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

    public function getChainResponseAttr($value)
    {
        return json_decode($value, true) ?: [];
    }

    public function setChainResponseAttr($value)
    {
        return is_array($value) ? json_encode($value, JSON_UNESCAPED_UNICODE) : $value;
    }
}
