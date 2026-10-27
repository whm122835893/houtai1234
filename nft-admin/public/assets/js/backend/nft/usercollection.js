define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'nft/usercollection/index' + location.search,
                    add_url: 'nft/usercollection/add',
                    edit_url: 'nft/usercollection/edit',
                    del_url: 'nft/usercollection/del',
                    transfer_url: 'nft/usercollection/transfer',
                    burn_url: 'nft/usercollection/burn',
                    table: 'nft_user_collection',
                }
            });

            var table = $("#table");

            $('.btn-transfer').on('click', function () {
                var ids = Table.api.selectedids(table);
                if (!ids) {
                    Toastr.error('请先选择');
                    return;
                }
                var targetUserId = prompt('请输入目标用户ID：');
                if (!targetUserId) return;
                Fast.api.ajax({url: Config.moduleurl + '/nft/usercollection/transfer', data: {ids: ids, target_user_id: targetUserId}}, function () {
                    table.bootstrapTable('refresh');
                });
            });

            $('.btn-burn').on('click', function () {
                var ids = Table.api.selectedids(table);
                if (!ids) {
                    Toastr.error('请先选择');
                    return;
                }
                Fast.api.ajax({url: Config.moduleurl + '/nft/usercollection/burn', data: {ids: ids}}, function () {
                    table.bootstrapTable('refresh');
                });
            });

            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                columns: [
                    [
                        {checkbox: true},
                        {field: 'id', title: __('Id')},
                        {field: 'user_id', title: __('User_id')},
                        {field: 'user.nickname', title: __('Nickname'), operate: 'LIKE'},
                        {field: 'collection.name', title: __('Collection_id'), operate: 'LIKE'},
                        {field: 'token_id', title: __('Token_id'), operate: 'LIKE'},
                        {field: 'source', title: __('Source'), searchList: {purchase: '购买', airdrop: '空投', merge: '合成', transfer: '转移'}, formatter: Table.api.formatter.label},
                        {field: 'purchase_price', title: __('Purchase_price'), operate: false},
                        {field: 'quantity', title: __('Quantity'), operate: false},
                        {field: 'status', title: __('Status'), searchList: {normal: '正常', locked: '锁定', burned: '已销毁', transferred: '已转移'}, formatter: Table.api.formatter.status},
                        {field: 'createtime', title: __('Createtime'), operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime},
                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate}
                    ]
                ]
            });

            Table.api.bindevent(table);
        },
        add: function () {
            Controller.api.bindevent();
        },
        edit: function () {
            Controller.api.bindevent();
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        }
    };
    return Controller;
});
