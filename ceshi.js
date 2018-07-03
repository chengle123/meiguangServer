// const qr = require('qr-image');
// const Jimp = require("jimp");
// const fs = require('fs');


// var data = {
//             "Id": 5474765,
//             "ItemId": 562102736768,
//             "ShowTitle": "美好羊肉汤312g",
//             "Recommend": "超值特惠，比聚划算还便宜，前4小时送2个卤蛋，买2减5，买3减10，满98送羊肉汤。精选新鲜劲道羊肉，鲜香可口，不膻不燥，10分钟速享美味~想想都流口水，上市公司，食品卫生安全！\n",
//             "Pic": "http://img.alicdn.com/imgextra/i3/1749303397/TB24HOTjZLJ8KJjy0FnXXcFDpXa_!!1749303397.jpg_600x600.jpg_.webp",
//             "ShowPrice": 2480,
//             "EHYPrice": 2480,
//             "SealCount": 2150,
//             "IsJHS": 1,
//             "IsTmall": 1,
//             "IsTQG": 0,
//             "IsPinPai": 0,
//             "ItemLevel": 3,
//             "QuanStartFee": 2400,
//             "QuanAmount": 500,
//             "QuanActivityId": "95b759d855ad48f0bfce5e230f426d57",
//             "JumpType": 0,
//             "TgUrl": null,
//             "CreateTime": "2018/7/2 9:11:53",
//             "RateType": 0,
//             "SellerId": 1749303397,
//             "ExtId": 0,
//             "Rate": 3000,
//             "IsGYD": 0,
//             "QuanStartTime": "2018-07-02 00:00:00",
//             "IsBaoKuan": 1,
//             "IsBaiChuanJump": 0,
//             "FixId": 36,
//             "SealStartTime": "2018-07-02 00:00:00",
//             "SealEndTime": null,
//             "QuanEndTime": "2018-07-05 23:59:59",
//             "VedioUrl": "",
//             "SellerName": "美好食品旗舰店",
//             "ScoreMiaoShu": 482,
//             "ScoreFuWu": 482,
//             "ScoreFaHuo": 482,
//             "TgPic": "http://img.alicdn.com/imgextra/i3/1749303397/TB24HOTjZLJ8KJjy0FnXXcFDpXa_!!1749303397.jpg",
//             "IsZhiBo": 0
//         };
// var url = 'http://mk.xichegg.com/AppCms/index.html?ui=http%3A%2F%2Fcdn.temzt.cn%2FAppCms%2FUI%2Fsharedetail.html&token=661a3f8f5cb1482bb51ea18562dc5aaf&invitecode=ZC3X4FY&pid=mm_117681921_42202188_453926032&itemid=571985711939';

// var goodsQrCodeImg = {
//     qrCode : (url,fn)=>{
//         var qr_png = qr.image(url, { type: 'png', margin: 0, size: 8});
//         var imgName = `./images/${new Date().getTime()}.png`;
//         var qr_pipe = qr_png.pipe(fs.createWriteStream(imgName));
//         qr_pipe.on('error', function(err){
//             console.log(err);
//             return;
//         })
//         qr_pipe.on('finish', function(){
//             console.log(imgName);
//             fn(imgName);
//         })
//     },
//     composite: (qrImg, data, res) => {
//         var downUrl = goodsQrCodeImg.imgDispose(data.Pic);
//         var imgName = qrImg.split('images/')[1];
//         var isTmall = data.IsTmall == 1 ? './template/tmall.png' : './template/tao.png';
//         Jimp.read('./template/spfxdtnew.png', (err,bgImg) => {
//             // bgImg.resize(703, 703);
//             Jimp.read(downUrl, function (err, lennaIMG) {
//                 lennaIMG.resize(701, 701);
//                 Jimp.read('./template/dunpai.png', function (err, dunpai) {
//                     dunpai.resize(292, 354);
//                     Jimp.read(isTmall, function (err, isTmallImg) {
//                         isTmallImg.resize(33, 33);
//                         Jimp.read(qrImg, function (err, lennaQR) {
//                             lennaQR.resize(130, 130);
//                             bgImg.composite(lennaIMG, 26, 151)
//                                     .composite(lennaQR, 529, 981)
//                                     .composite(dunpai, 445, 610)
//                                     .composite(isTmallImg, 44, 894)
//                                     .write(`./images/${imgName}`)
//                         });
//                     });
//                 });
//             });
//         });
//     },
//     imgDispose: url => {
//         if(url.indexOf('_.webp')>-1){
//             return url.split('_.webp')[0];
//         }else{
//             return url;
//         }
//     }
// };

// goodsQrCodeImg.qrCode(url,(qrImg)=>{
//         goodsQrCodeImg.composite(qrImg, data, res=()=>{});
// });

var domtoimage = require('dom-to-image');
var html = `<div id="box" style="width:750px;height:1192px;background:url('./template/spfxdtnew.png') no-repeat 0 0;position: relative;">
        <div style="width: 700px; height: 700px; position: absolute; left: 26px; top: 151px;">
            <img src="http://img.alicdn.com/imgextra/i3/1749303397/TB24HOTjZLJ8KJjy0FnXXcFDpXa_!!1749303397.jpg_600x600.jpg" style="width:100%;height:100%;">
        </div>
        <div style="font-size:32px;position: absolute;left: 44px;top:894px;">
            <img src="./template/tmall.png" style="width:33px;height:33px;">
            <div style="position: absolute; width: 350px; top: -6px; left: 45px;">卢卡斯结果就是独立客观</div>
        </div>
        <div style="color:#fff;text-align: center;width:292px;height:354px;background:url('./template/dunpai.png') no-repeat 0 0;position:absolute;left:445px;top:610px;">
            <div style="font-size:72px;position: relative;top: 105px;">24.9</div>
            <div style="font-size:40px;position: relative;top:130px">10元券</div>
        </div>
        <div style="color:#d70b50;font-size: 60px; position: absolute; top: 1000px; left: 40px;">
            24.9RMB
            <span style="text-decoration: line-through;color:#919191;font-size:30px;">
                39.4RMB
            </span>
        </div>
        <div style="color:#919191;font-size:18px;position: absolute; top: 1105px; left: 50px;">
            29999人购买
        </div>
        <div>
            <img src="./images/1530627650784.png" style="widht:130px;height:130px;position:absolute;left:529px;top:981px;   ">
        </div>
    </div>`
domtoimage.toJpeg(html, { quality: 0.95 })
    .then(function (dataUrl) {
        console.log(dataUrl)
        // var link = document.createElement('a');
        // link.download = 'my-image-name.jpeg';
        // link.href = dataUrl;
        // link.click();
    });