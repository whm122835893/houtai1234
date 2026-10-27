<?php

namespace app\common\service\chain;

/**
 * Mock 模拟驱动（不连接真实链）
 */
class MockDriver extends BaseDriver
{
    /**
     * 生成模拟交易哈希
     */
    private function genTxHash()
    {
        return '0x' . hash('sha256', uniqid(mt_rand(), true) . microtime(true));
    }

    /**
     * 生成模拟 TokenID
     */
    private function genTokenId()
    {
        return (string)mt_rand(1000000, 999999999);
    }

    /**
     * 生成模拟区块高度
     */
    private function genBlockNumber()
    {
        return mt_rand(10000000, 999999999);
    }

    public function mint($params = [])
    {
        return [
            'tx_hash' => $this->genTxHash(),
            'token_id' => !empty($params['token_id']) ? $params['token_id'] : $this->genTokenId(),
            'block_number' => $this->genBlockNumber(),
            'status' => 'success',
            'contract_address' => $params['contract_address'] ?? '',
            'to_address' => $params['to_address'] ?? '',
            'chain_driver' => 'mock',
            'timestamp' => time(),
        ];
    }

    public function transfer($params = [])
    {
        return [
            'tx_hash' => $this->genTxHash(),
            'token_id' => $params['token_id'] ?? '',
            'block_number' => $this->genBlockNumber(),
            'status' => 'success',
            'contract_address' => $params['contract_address'] ?? '',
            'from_address' => $params['from_address'] ?? '',
            'to_address' => $params['to_address'] ?? '',
            'chain_driver' => 'mock',
            'timestamp' => time(),
        ];
    }

    public function airdrop($params = [])
    {
        return [
            'tx_hash' => $this->genTxHash(),
            'token_ids' => $params['token_ids'] ?? [],
            'block_number' => $this->genBlockNumber(),
            'status' => 'success',
            'contract_address' => $params['contract_address'] ?? '',
            'to_address' => $params['to_address'] ?? '',
            'chain_driver' => 'mock',
            'timestamp' => time(),
        ];
    }

    public function burn($params = [])
    {
        return [
            'tx_hash' => $this->genTxHash(),
            'token_id' => $params['token_id'] ?? '',
            'block_number' => $this->genBlockNumber(),
            'status' => 'success',
            'contract_address' => $params['contract_address'] ?? '',
            'from_address' => $params['from_address'] ?? '',
            'chain_driver' => 'mock',
            'timestamp' => time(),
        ];
    }

    public function getTxStatus($txHash)
    {
        return [
            'tx_hash' => $txHash,
            'status' => 'success',
            'block_number' => $this->genBlockNumber(),
            'confirmations' => 10,
            'chain_driver' => 'mock',
        ];
    }
}
