const mysql = require('mysql');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const account = require('./models/account');
const cron = require('node-cron');
const Sequelize= require('sequelize');
const qr = require('qr-image');
const Jimp = require("jimp");
const fs = require('fs');

// 本地服务======================================================================================

var app = express();
app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({ limit:'50mb', extended: false }));
app.use(express.static(path.join(__dirname, './')));
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

// 请求图片
router.post('/getQrCodeImg', function(req, res) {
    var data = JSON.parse(req.body.data);
    var url = req.body.url;
    try{
        goodsQrCodeImg.qrCode(url,(qrImg)=>{
            try{
                goodsQrCodeImg.composite(qrImg, data.Pic, res);
            }catch(e) {
                res.json({
                    result: 'error',
                    data: '',
                    msg: '图片请求失败,ERROR:001'
                })
            }
        });
	}catch(e) {
        res.json({
            result: 'error',
            data: '',
            msg: '图片请求失败,ERROR:002'
        })
	}
})

app.use('/', router);

var goodsQrCodeImg = {
    qrCode : (url,fn)=>{
        var qr_png = qr.image(url, { type: 'png', margin: 2, size: 8});
        var imgName = `./images/${new Date().getTime()}.png`;
        var qr_pipe = qr_png.pipe(fs.createWriteStream(imgName));
        qr_pipe.on('error', function(err){
            console.log(err);
            return;
        })
        qr_pipe.on('finish', function(){
            // console.log(imgName);
            fn(imgName);
        })
    },
    composite: (qrImg, url, res) => {
        var downUrl = imgDispose(url);
        Jimp.read(qrImg, function (err, lennaQR) {
        lennaQR.resize(232, 232).write(qrImg);
        Jimp.read(downUrl, function (err, lennaIMG) {
            if (err) throw err;
            var imgName = qrImg.split('images/')[1];
            var top = lennaIMG.bitmap.height - 242, left = lennaIMG.bitmap.width - 242;
            lennaIMG.composite(lennaQR, left, top).write(`./images/${imgName}`);
            return res.json({
                result: 'success',
                data: {
                    imgUrl: 'http://meiguang.emym.top/images/'+imgName,
                    imgName: imgName
                },
                msg: '获取图片地址成功'
            })
        });
        });
    }
}
  
function imgDispose(url){
  if(url.indexOf('_.webp')>-1){
    return url.split('_.webp')[0];
  }else{
    return url;
  }
}

// 定时更新任务
cron.schedule('1 0 0 * * *', function() {
    account.update({remainderDays: Sequelize.literal('`remainderDays` -1')}, {where:{remainderDays:{$gt:0}}}).then(rows => {
        console.log('数据更新')
    });

    var dirList = fs.readdirSync('./images');
     dirList.forEach(function(fileName)
     {
         fs.unlinkSync('./images/' + fileName);
        //  console.log(`删除${fileName}`)
     });
});
 