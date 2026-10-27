define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'nft/whitelist/index' + location.search,
                    add_url: 'nft/whitelist/add',
                    edit_url: 'nft/whitelist/edit',
                    del_url: 'nft/whitelist/del',
                    multi_url: 'nft/whitelist/multi',
                    table: 'nft_whitelist',
                }
            });

            var table = $("#table");
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                columns: [
                    [
                        {checkbox: true},
                        {field: 'id', title: 'ID'},
                        {field: 'user.nickname', title: '用户昵称', operate: 'LIKE'},
                        {field: 'user.mobile', title: '手机号', operate: 'LIKE'},
                        {field: 'collection_id', title: '关联藏品ID', operate: false},
                        {field: 'collection.name', title: '藏品名称', operate: 'LIKE'},
                        {field: 'remark', title: '备注', operate: 'LIKE'},
                        {field: 'status', title: '状态', searchList: {normal: '正常', hidden: '隐藏'}, formatter: Table.api.formatter.status},
                        {field: 'createtime', title: '创建时间', operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime},
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
