define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'nft/merge/index' + location.search,
                    add_url: 'nft/merge/add',
                    edit_url: 'nft/merge/edit',
                    del_url: 'nft/merge/del',
                    multi_url: 'nft/merge/multi',
                    log_url: 'nft/merge/log',
                    table: 'nft_merge',
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
                        {field: 'id', title: __('Id')},
                        {field: 'name', title: __('Name'), align: 'left', operate: 'LIKE'},
                        {field: 'resultCollection.name', title: __('Result_collection_id'), operate: 'LIKE'},
                        {field: 'result_quantity', title: __('Result_quantity'), operate: false},
                        {field: 'cost_description', title: __('Cost_description'), operate: 'LIKE'},
                        {field: 'max_times', title: __('Max_times'), operate: false},
                        {field: 'used_times', title: __('Used_times'), operate: false},
                        {field: 'start_time', title: __('Start_time'), operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime},
                        {field: 'end_time', title: __('End_time'), operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime},
                        {field: 'status', title: __('Status'), searchList: {normal: '正常', hidden: '隐藏'}, formatter: Table.api.formatter.status},
                        {
                            field: 'operate',
                            title: __('Operate'),
                            table: table,
                            events: Table.api.events.operate,
                            formatter: function (value, row, index) {
                                var html = Table.api.formatter.operate.call(this, value, row, index);
                                html += ' <a href="' + Config.moduleurl + '/nft/merge/log?ids=' + row.id + '" class="btn btn-xs btn-info" title="合成记录"><i class="fa fa-list"></i> 记录</a>';
                                return html;
                            }
                        }
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
        log: function () {
            Table.api.init({
                extend: {
                    index_url: 'nft/merge/log' + location.search,
                }
            });
            var table = $("#table");
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                columns: [
                    [
                        {field: 'id', title: __('Id')},
                        {field: 'user_id', title: __('User_id')},
                        {field: 'username', title: __('Username')},
                        {field: 'result_collection_id', title: __('Result_collection_id')},
                        {field: 'status', title: __('Status'), searchList: {pending: '待处理', success: '成功', fail: '失败'}, formatter: Table.api.formatter.status},
                        {field: 'remark', title: __('Remark')},
                        {field: 'createtime', title: __('Createtime'), operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime}
                    ]
                ]
            });
            Table.api.bindevent(table);
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        }
    };
    return Controller;
});
