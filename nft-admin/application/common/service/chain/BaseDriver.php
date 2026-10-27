<?php

namespace app\common\service\chain;

/**
 * 链驱动抽象基类
 */
abstract class BaseDriver
{
    /**
     * @var array
     */
    protected $config = [];

    public function __construct($config = [])
    {
        $this->config = $config;
    }

    /**
     * 铸造 NFT
     * @param array $params ['collection_id','contract_address','to_address','token_id?']
     * @return array ['tx_hash','token_id','block_number','status']
     */
    abstract public function mint($params = []);

    /**
     * 转移 NFT
     * @param array $params ['contract_address','token_id','from_address','to_address']
     * @return array
     */
    abstract public function transfer($params = []);

    /**
     * 空投
     * @param array $params ['contract_address','token_ids','to_address']
     * @return array
     */
    abstract public function airdrop($params = []);

    /**
     * 销毁
     * @param array $params ['contract_address','token_id','from_address']
     * @return array
     */
    abstract public function burn($params = []);

    /**
     * 查询交易状态
     * @param string $txHash
     * @return array ['tx_hash','status','block_number']
     */
    abstract public function getTxStatus($txHash);
}
