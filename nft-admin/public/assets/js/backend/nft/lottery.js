define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'nft/lottery/index' + location.search,
                    add_url: 'nft/lottery/add',
                    edit_url: 'nft/lottery/edit',
                    del_url: 'nft/lottery/del',
                    multi_url: 'nft/lottery/multi',
                    table: 'nft_lottery',
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
                        {field: 'title', title: '活动标题', align: 'left', operate: 'LIKE'},
                        {field: 'collection.name', title: '申购藏品', operate: 'LIKE'},
                        {field: 'total_number', title: '申购份数', operate: false},
                        {field: 'win_number', title: '中签份数', operate: false},
                        {field: 'start_time_text', title: '开始时间', operate: false},
                        {field: 'end_time_text', title: '截止时间', operate: false},
                        {field: 'open_time_text', title: '开奖时间', operate: false},
                        {field: 'status', title: '状态', searchList: {draft: '草稿', not_started: '申购中', drawing: '已开奖', finished: '已结束'}, formatter: Table.api.formatter.label},
                        {field: 'operate', title: __('Operate'), table: table,
                            buttons: [
                                {
                                    name: 'draw',
                                    text: '开奖',
                                    classname: 'btn btn-xs btn-warning btn-ajax',
                                    icon: 'fa fa-random',
                                    url: 'nft/lottery/draw',
                                    confirm: '确认立即开奖？将随机抽取中签用户，操作不可撤销！',
                                    visible: function (row) {
                                        return row.status == 'draft' || row.status == 'not_started';
                                    },
                                    success: function (data, ret) {
                                        table.bootstrapTable('refresh');
                                        if (ret && ret.msg) {
                                            Toastr.success(ret.msg);
                                        }
                                    }
                                }
                            ],
                            events: Table.api.events.operate, formatter: Table.api.formatter.operate}
                    ]
                ]
            });

            Table.api.bindevent(table);
        },
        log: function () {
            Table.api.init({
                extend: {
                    index_url: 'nft/lottery/log' + location.search,
                    table: 'nft_lottery_log',
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
                        {field: 'lottery.title', title: '活动', operate: 'LIKE'},
                        {field: 'user.nickname', title: '用户', operate: 'LIKE'},
                        {field: 'user.mobile', title: '手机号', operate: 'LIKE'},
                        {field: 'is_win_text', title: '是否中签', operate: false, formatter: function (value) { return value == '是' ? '<span class="label label-success">中签</span>' : '<span class="label label-default">未中</span>'; }},
                        {field: 'status', title: '状态', searchList: {pending: '待开奖', win: '已中签', missed: '未中签'}, formatter: Table.api.formatter.label},
                        {field: 'createtime', title: '申购时间', operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime}
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
