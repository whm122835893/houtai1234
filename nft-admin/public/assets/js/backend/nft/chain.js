define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'nft/chain/index' + location.search,
                    retry_url: 'nft/chain/retry',
                    table: 'nft_chain_log',
                }
            });

            var table = $("#table");
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                sortOrder: 'desc',
                columns: [
                    [
                        {checkbox: true},
                        {field: 'id', title: __('Id')},
                        {field: 'type', title: __('Type'), searchList: {mint: '铸造', transfer: '转移', merge: '合成', burn: '销毁', airdrop: '空投'}, formatter: Table.api.formatter.label},
                        {field: 'collection_id', title: __('Collection_id'), operate: '='},
                        {field: 'user_id', title: __('User_id'), operate: '='},
                        {field: 'token_id', title: __('Token_id'), operate: 'LIKE'},
                        {field: 'contract_address', title: __('Contract_address'), operate: 'LIKE'},
                        {field: 'tx_hash', title: __('Tx_hash'), operate: 'LIKE'},
                        {field: 'block_number', title: __('Block_number'), operate: false},
                        {field: 'status', title: __('Status'), searchList: {pending: '待确认', success: '成功', fail: '失败'}, formatter: Table.api.formatter.status},
                        {field: 'createtime', title: __('Createtime'), operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime},
                        {
                            field: 'operate',
                            title: __('Operate'),
                            table: table,
                            events: Table.api.events.operate,
                            formatter: function (value, row, index) {
                                var html = '';
                                if (row.status === 'fail') {
                                    html += '<a href="javascript:;" class="btn btn-xs btn-warning btn-retry" data-id="' + row.id + '"><i class="fa fa-refresh"></i> 重试</a>';
                                }
                                return html;
                            }
                        }
                    ]
                ]
            });

            Table.api.bindevent(table);

            $(document).on('click', '.btn-retry', function () {
                var id = $(this).data('id');
                Layer.confirm('确定重试上链吗？', function (index) {
                    Fast.api.ajax({url: Config.moduleurl + '/nft/chain/retry', data: {ids: id}}, function () {
                        table.bootstrapTable('refresh');
                        Layer.close(index);
                    });
                });
            });
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        }
    };
    return Controller;
});
