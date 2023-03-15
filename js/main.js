new Vue({
    el: '#app',
    data: function () {
        return {
            question: '',
            msgList: [],
            lockBtn: false,
            currentParentId: '',
            options: {},
        };
    },
    methods: {
        sendMsg() {
            if (this.question === '') {
                this.$message({
                    type: 'warning',
                    message: '请输入消息',
                    duration: 2000,
                });
                return;
            }
            // 关闭点击按钮
            this.lockBtn = true;

            this.msgList.push({
                id: 'person:' + new Date().getTime(),
                from: 'person',
                content: this.question,
                loading: false,
            });

            this.msgList.push({
                id: 'ai:' + new Date().getTime(),
                from: 'ai',
                content: '',
                loading: true,
            });
            this.$refs.bottomEmpty.scrollIntoView({
                behavior: 'smooth',
            });
            if (this.currentParentId) {
                this.options = {
                    parentMessageId: this.currentParentId,
                };
            } else {
                this.options = {};
            }

            this.getGptMsg();
        },
        getGptMsg() {
            axios
                .post('http://43.154.144.239:3002/api/chat-process', {
                    options: this.options,
                    prompt: this.question,
                })
                .then(res => {
                    if (res.data) {
                        let result = '';
                        if (res.data.id) {
                            result = res.data.text;
                            this.currentParentId = res.data.id;
                        } else {
                            let arr = res.data.split('\n');
                            result = JSON.parse(arr[arr.length - 1]).text;
                            this.currentParentId = JSON.parse(arr[arr.length - 1]).id;
                        }
                        this.msgList[this.msgList.length - 1].id = this.currentParentId;
                        this.msgList[this.msgList.length - 1].content = result;
                        this.msgList[this.msgList.length - 1].loading = false;
                    }
                })
                .catch(err => {
                    console.log(err);
                    this.msgList[this.msgList.length - 1] = {
                        id: this.currentParentId,
                        from: 'ai',
                        content: err,
                        loading: false,
                    };
                    this.$message({
                        type: 'danger',
                        message: err,
                        duration: 2000,
                    });
                })
                .finally(() => {
                    // 解锁点击按钮
                    this.lockBtn = false;
                    this.$refs.bottomEmpty.scrollIntoView({
                        behavior: 'smooth',
                    });
                    this.question = '';
                });
        },
        resetMsg() {
            this.currentParentId = '';
        },
        clearMsgRecord() {
            this.msgList = [];
        },
    },
});
