define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'nft/airdrop/index' + location.search,
                    add_url: 'nft/airdrop/add',
                    edit_url: 'nft/airdrop/edit',
                    del_url: 'nft/airdrop/del',
                    execute_url: 'nft/airdrop/execute',
                    log_url: 'nft/airdrop/log',
                    table: 'nft_airdrop',
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
                        {field: 'title', title: __('Title'), align: 'left', operate: 'LIKE'},
                        {field: 'collection.name', title: __('Collection_id'), operate: 'LIKE'},
                        {field: 'total_count', title: __('Total_count'), operate: false},
                        {field: 'sent_count', title: __('Sent_count'), operate: false},
                        {field: 'condition_type', title: __('Condition_type'), searchList: {all: '全部用户', new_user: '新用户', vip: 'VIP用户', specified: '指定用户'}, formatter: Table.api.formatter.label},
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
                                html += ' <a href="javascript:;" class="btn btn-xs btn-success btn-execute" data-id="' + row.id + '"><i class="fa fa-play"></i> 执行</a>';
                                html += ' <a href="' + Config.moduleurl + '/nft/airdrop/log?ids=' + row.id + '" class="btn btn-xs btn-info btn-log" title="空投记录"><i class="fa fa-list"></i> 记录</a>';
                                return html;
                            }
                        }
                    ]
                ]
            });

            Table.api.bindevent(table);

            $(document).on('click', '.btn-execute', function () {
                var id = $(this).data('id');
                Layer.confirm('确定执行该空投吗？', function (index) {
                    Fast.api.ajax({url: Config.moduleurl + '/nft/airdrop/execute', data: {ids: id}}, function () {
                        table.bootstrapTable('refresh');
                        Layer.close(index);
                    });
                });
            });
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
                    index_url: 'nft/airdrop/log' + location.search,
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
                        {field: 'quantity', title: __('Quantity')},
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
