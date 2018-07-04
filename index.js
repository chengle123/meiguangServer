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
const webshot = require('webshot');


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
    console.log(url)
    try{
        goodsQrCodeImg.qrCode(url,(qrImg)=>{
            try{
                goodsQrCodeImg.composite(qrImg, data, res);
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
        var qr_png = qr.image(url, { type: 'png', margin: 0, size: 8});
        var dateName = new Date().getTime();
        var imgName = `./images/${dateName}.png`;
        var qr_pipe = qr_png.pipe(fs.createWriteStream(imgName));
        qr_pipe.on('error', function(err){
            console.log(err);
            return;
        })
        qr_pipe.on('finish', function(){
            fn(dateName);
        })
    },
    composite: (dateName, data, res) => {
        var downUrl = goodsQrCodeImg.imgDispose(data.Pic);
        var imgName = `${dateName}.png`;
        var isTmall = data.IsTmall == 1 ? './template/tmall.png' : './template/tao.png';
        var html = `<html>
                    <body>
                        <div style="width:750px;height:1192px;position: relative;font-family:sans-serif, 'Microsoft YaHei';">
                            <div style="font-size:32px;position: absolute;left: 44px;top:894px;">
                                <div style="position: absolute; width: 350px; top: -6px; left: 45px;">${data.ShowTitle}</div>
                            </div>
                            <div style="color:#fff;text-align: center;width:292px;height:354px;position:absolute;left:445px;top:610px;">
                                <div style="font-size:76px;position: relative;top: 105px;">${(data.ShowPrice - data.QuanAmount) * 100 / 10000}</div>
                                <div style="font-size:45px;position: relative;top:135px">${data.QuanAmount * 100 / 10000}元券</div>
                            </div>
                            <div style="color:#d70b50;font-size: 60px; position: absolute; top: 1000px; left: 40px;">
                                ${(data.ShowPrice - data.QuanAmount) * 100 / 10000}<span style="font-size:40px;">RMB</span>
                                <span style="text-decoration: line-through;color:#919191;font-size:30px;">
                                    ${data.ShowPrice * 100 / 10000}RMB
                                </span>
                            </div>
                            <div style="color:#919191;font-size:18px;position: absolute; top: 1105px; left: 50px;">
                                ${data.SealCount}人购买
                            </div>
                        </div>
                    </body>
                    </html>`;
        webshot(html, `./images/${dateName}text.png`, {siteType:'html',screenSize: {width: 750, height: 1192}, shotSize: {width: 750, height: 1192}}, function(err) {
            Jimp.read('./template/spfxdtnew.png', (err,bgImg) => {
                Jimp.read(downUrl, function (err, lennaIMG) {
                    lennaIMG.resize(701, 701);
                    Jimp.read('./template/dunpai.png', function (err, dunpai) {
                        dunpai.resize(292, 354);
                        Jimp.read(isTmall, function (err, isTmallImg) {
                            isTmallImg.resize(33, 33);
                            Jimp.read(`./images/${dateName}.png`, function (err, lennaQR) {
                                lennaQR.resize(130, 130);
                                Jimp.read(`./images/${dateName}text.png`, function (err, textImg) {
                                    bgImg.composite(lennaIMG, 26, 151)
                                            .composite(lennaQR, 529, 981)
                                            .composite(dunpai, 445, 610)
                                            .composite(isTmallImg, 44, 894)
                                            .composite(textImg, 0, 0)
                                            .write(`./images/${imgName}`);
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
                        });
                    });
                });
            });
        });
    },
    imgDispose: url => {
        if(url.indexOf('_.webp')>-1){
            return url.split('_.webp')[0];
        }else{
            return url;
        }
    }
};

// var goodsQrCodeImg = {
//     qrCode : (url,fn)=>{
//         var qr_png = qr.image(url, { type: 'png', margin: 2, size: 8});
//         var imgName = `./images/${new Date().getTime()}.png`;
//         var qr_pipe = qr_png.pipe(fs.createWriteStream(imgName));
//         qr_pipe.on('error', function(err){
//             console.log(err);
//             return;
//         })
//         qr_pipe.on('finish', function(){
//             // console.log(imgName);
//             fn(imgName);
//         })
//     },
//     composite: (qrImg, url, res) => {
//         var downUrl = imgDispose(url);
//         Jimp.read(qrImg, function (err, lennaQR) {
//         lennaQR.resize(232, 232).write(qrImg);
//         Jimp.read(downUrl, function (err, lennaIMG) {
//             if (err) throw err;
//             var imgName = qrImg.split('images/')[1];
//             var top = lennaIMG.bitmap.height - 242, left = lennaIMG.bitmap.width - 242;
//             lennaIMG.composite(lennaQR, left, top).write(`./images/${imgName}`);
//             return res.json({
//                 result: 'success',
//                 data: {
//                     imgUrl: 'http://meiguang.emym.top/images/'+imgName,
//                     imgName: imgName
//                 },
//                 msg: '获取图片地址成功'
//             })
//         });
//         });
//     }
// }
  
// function imgDispose(url){
//   if(url.indexOf('_.webp')>-1){
//     return url.split('_.webp')[0];
//   }else{
//     return url;
//   }
// }

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
 