<?php

namespace app\admin\model\nft;

use think\Model;

class LotteryLog extends Model
{
    protected $name = 'nft_lottery_log';
    protected $autoWriteTimestamp = 'int';
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $append = [
        'status_text',
        'is_win_text',
    ];

    public function getStatusList()
    {
        return ['pending' => '待开奖', 'win' => '已中签', 'missed' => '未中签'];
    }

    public function getStatusTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['status']) ? $data['status'] : '');
        $list = $this->getStatusList();
        return isset($list[$value]) ? $list[$value] : '';
    }

    public function getIsWinTextAttr($value, $data)
    {
        return !empty($data['is_win']) ? '是' : '否';
    }

    public function lottery()
    {
        return $this->belongsTo('app\admin\model\nft\Lottery', 'lottery_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }

    public function user()
    {
        return $this->belongsTo('app\admin\model\User', 'user_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }
}
