<?php

namespace app\admin\model\nft;

use think\Model;

class Kyc extends Model
{
    protected $name = 'nft_kyc';
    protected $autoWriteTimestamp = 'int';
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    protected $append = [
        'status_text',
        'audit_time_text',
        'idcard_mask',
    ];

    public function getStatusList()
    {
        return ['pending' => '待审核', 'approved' => '已通过', 'rejected' => '已拒绝'];
    }

    public function getStatusTextAttr($value, $data)
    {
        $value = $value ? $value : (isset($data['status']) ? $data['status'] : '');
        $list = $this->getStatusList();
        return isset($list[$value]) ? $list[$value] : '';
    }

    public function getAuditTimeTextAttr($value, $data)
    {
        $value = isset($data['audit_time']) ? $data['audit_time'] : 0;
        return $value ? date('Y-m-d H:i:s', $value) : '';
    }

    /**
     * 身份证号脱敏
     */
    public function getIdcardMaskAttr($value, $data)
    {
        $idcard = isset($data['idcard']) ? $data['idcard'] : '';
        if (strlen($idcard) < 11) {
            return $idcard;
        }
        return substr($idcard, 0, 4) . '**********' . substr($idcard, -4);
    }

    public function user()
    {
        return $this->belongsTo('app\admin\model\User', 'user_id', 'id', [], 'LEFT')->setEagerlyType(0);
    }
}
