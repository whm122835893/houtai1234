define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'nft/announcement/index' + location.search,
                    add_url: 'nft/announcement/add',
                    edit_url: 'nft/announcement/edit',
                    del_url: 'nft/announcement/del',
                    multi_url: 'nft/announcement/multi',
                    table: 'nft_announcement',
                }
            });

            var table = $("#table");
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'weigh',
                columns: [
                    [
                        {checkbox: true},
                        {field: 'id', title: __('Id')},
                        {field: 'title', title: __('Title'), align: 'left', operate: 'LIKE'},
                        {field: 'type', title: __('Type'), searchList: {notice: '公告', activity: '活动', update: '更新'}, formatter: Table.api.formatter.label},
                        {field: 'is_top', title: __('Is_top'), searchList: {'0': '否', '1': '是'}, formatter: Table.api.formatter.toggle},
                        {field: 'weigh', title: __('Weigh'), operate: false},
                        {field: 'status', title: __('Status'), searchList: {normal: '正常', hidden: '隐藏'}, formatter: Table.api.formatter.status},
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
