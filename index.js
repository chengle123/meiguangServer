const mysql = require('mysql');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
const account = require('./models/account');
var cron = require('node-cron');
const Sequelize= require('sequelize');

// 本地服务======================================================================================

var app = express();
app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({ limit:'50mb', extended: false }));
app.use(express.static(path.join(__dirname, 'app')));
var server = app.listen(8787, function() {
	console.log('Ready');
});

// 注册
router.post('/signin', function(req, res) {
    var name = req.body.name;
    var password = req.body.password;
    var equipmentId = req.body.equipmentId;
    try{
        try{
            account.find({where:{name: name}}).then(function(rows){
                if(rows){

                    res.json({
                        result: 'error',
                        data: '',
                        msg: '账户已存在'
                    })
                }else{
                    try{
                        account.find({where:{equipmentId: equipmentId}}).then(function(rows){
                            if(rows){
                                res.json({
                                    result: 'error',
                                    data: '',
                                    msg: '此设备已经与其他账号绑定'
                                })
                            }else{
                                account.create({
                                    name: name,
                                    password: password,
                                    equipmentId: equipmentId
                                }).then(rows => {
                                    res.json({
                                        result: 'success',
                                        data: '',
                                        msg: '注册成功，请登录'
                                    })
                                });
                            }
                        })
                    }catch(e) {
                        res.json({
                            result: 'error',
                            data: '',
                            msg: '注册失败，请联系管理员,ERROR:003'
                        })
                    }
                }
            })
        }catch(e) {
            res.json({
                result: 'error',
                data: '',
                msg: '注册失败，请联系管理员,ERROR:001'
            })
        }
	}catch(e) {
        res.json({
            result: 'error',
            data: '',
            msg: '注册失败，请联系管理员,ERROR:002'
        })
	}
})

// 登录
router.post('/login', function(req, res) {
    var name = req.body.name;
    var password = req.body.password;
    var equipmentId = req.body.equipmentId;
    try{
        try{
            account.find({where:{name: name}}).then(function(rows){
                if(rows){
                    if(rows.dataValues.equipmentId != equipmentId){
                        res.json({
                            result: 'error',
                            data: '',
                            msg: '此设备已经与其他账号绑定'
                        })
                    }else{
                        if(rows.dataValues.remainderDays > 0){
                            res.json({
                                result: 'success',
                                data: '',
                                msg: rows.dataValues.remainderDays < 500 ? '登录成功，剩余天数为：' + rows.dataValues.remainderDays + '天' : '登录成功，剩余天数为：永久'
                            })
                        }else{
                            res.json({
                                result: 'error',
                                data: '',
                                msg: '账户已到期'
                            })
                        }
                    }
                }else{
                    res.json({
                        result: 'error',
                        data: '',
                        msg: '用户名或密码错误'
                    })
                }
            })
        }catch(e) {
            res.json({
                result: 'error',
                data: '',
                msg: '登录失败，请联系管理员,ERROR:001'
            })
        }
	}catch(e) {
        res.json({
            result: 'error',
            data: '',
            msg: '登录失败，请联系管理员,ERROR:002'
        })
	}
})


app.use('/', router);

// 定时更新任务
cron.schedule('1 0 0 * * *', function() {
    account.update({remainderDays: Sequelize.literal('`remainderDays` -1')}, {where:{remainderDays:{$gt:0}}}).then(rows => {
        console.log('数据更新')
    })
});
 