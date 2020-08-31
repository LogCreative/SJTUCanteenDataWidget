var history = new Array();
for(var i=0;i<9;i++)
    history[i] = new Array();

var sampleCount = 0;
// var rangeStart = 0;

var sx = [0,0,0,0,0,0,0,0,0], 
    sy = [0,0,0,0,0,0,0,0,0],
    sxx = [0,0,0,0,0,0,0,0,0],
    syy = [0,0,0,0,0,0,0,0,0],
    sxy = [0,0,0,0,0,0,0,0,0];

function Rad(d){
    return d * Math.PI / 180.0;//经纬度转换成三角函数中度分表形式。
}
//计算距离，参数分别为第一点的纬度，经度；第二点的纬度，经度
function GetDistance(lat1,lng1,lat2,lng2){
    var radLat1 = Rad(lat1);
    var radLat2 = Rad(lat2);
    var a = radLat1 - radLat2;
    var  b = Rad(lng1) - Rad(lng2);
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
    Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
    s = s *6378.137 ;// EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000; //输出为公里
    s=s.toFixed(2);
    return s;
}

// 距离数据
// 默认从学创中心开始
var dist = [0.55,1.0,0.75,0.15,1.6,1.7,1.5,0.77,0.41];

// 一 二 三 四 五 六 七 哈乐 玉兰
var CanteenLocation = [
    [121.438265,31.028543],
    [121.442699,31.02936],
    [121.439511,31.033175],
    [121.433739,31.031528],
    [121.447719,31.03008],
    [121.451094,31.035639],
    [121,446952,31.03594],
    [121.438838,31.027096],
    [121.437748,31.029834]
];

if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function(location){
        //获取成功
        var crd = location.coords;
        for(var i = 0; i < CanteenLocation.length; i++){
            var tempdist = GetDistance(crd.latitude,crd.longitude,CanteenLocation[i][1],CanteenLocation[i][0]);
            if(tempdist<=100)        // 超过一百公里应当认为不在学校
                dist[i] = tempdist;
        }
        console.log(dist);
    },function(err){
        //获取失败
        console.debug(err);
    });
} else {
    console.debug('不支持');
}


function refreshData(){
                
    function _ajaxReq() {
        var xmlhttp;
        if (window.XMLHttpRequest) {
            //code for IE7,firefox chrome and above
            xmlhttp = new XMLHttpRequest();
        } else {
            //code for Internet Explorer
            xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
        }
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var CData = JSON.parse(xmlhttp.responseText);

                var seats = 0;
                var used = 0;
                var remain = 0;

                var totalDist = 0;  // 总距离
                var count = 0;
                var avgDist = 0;
                for(var i=0;i<9;++i)
                    if(document.getElementById('D' + (i+1)*100))            // 六餐不参与
                        { totalDist += dist[i]; ++count; }
                avgDist = totalDist / count;
                
                //距离衰减因数 = 1 - (距离/总距离) (算法一弃用)
                // var decay = Array(9);      
                // for(var i=0;i<9;++i)
                //     if(document.getElementById('D' + (i+1)*100))            // 六餐不参与
                //         decay[i] = 1 - (dist[i] / totalDist);
                //     else
                //         decay[i] = -1;

                // 距离衰减因数 = 1 / (距离/平均距离) (算法二)
                var decay = Array(9);      
                for(var i=0;i<9;++i)
                    if(document.getElementById('D' + (i+1)*100))            // 六餐不参与
                        decay[i] = avgDist / dist[i];
                    else
                        decay[i] = -1;

                // 剩余人数
                var remains = Array(9);

                // 趋势量
                var tendency = Array(9);
                ++sampleCount;

                for(i in CData){
                    
                    var id = CData[i]['Id']
                    var shortid = id/100 - 1;

                    var seatsPart = CData[i]['Seat_s'];
                    var usedPart = CData[i]['Seat_u'];
                    var remainsPart = CData[i]['Seat_r'];

                    if(id==500){        //数据修正
                        seatsPart = 423;
                        remainsPart = seatsPart - usedPart;
                    } else if(id==700){ 
                        seatsPart = 206;
                        remainsPart = 206 - CData[i]['Seat_u'];
                    }


                    var NameControl = document.getElementById('N'+ id);
                    if(NameControl) { NameControl.innerHTML = CData[i]['Name'];}
                    var RemainControl = document.getElementById('R'+ id);
                    if(RemainControl) { 
                        RemainControl.innerHTML = remainsPart;
                    };
                    var ProgressControl = document.getElementById('P'+ id);
                    if(ProgressControl) { 
                        var Percentage = Math.round(remainsPart/seatsPart * 100);
                        Percentage = (Percentage>100 ? 100 : (Percentage<0 ? 0 : Percentage));
                        ProgressControl.value = Percentage;
                        var PercentageControl = document.getElementById('Q' + id);
                        if(PercentageControl){ PercentageControl.innerHTML = Percentage + '%'; }
                        seats += seatsPart; //总座位数
                        used += usedPart;  //使用中的座位数
                        remain += remainsPart;  //剩余的座位数
                        remains[shortid] = remainsPart;
                        

                        if(sampleCount<11){
                            // 线性回归
                            history[shortid].push(remainsPart);
                            
                            // 防止溢出，计算相对量
                            var x = sampleCount;
                            var y = remainsPart - history[shortid][0];
                            
                            sx[shortid] += x;
                            sy[shortid] += y;
                            sxx[shortid] += x * x;
                            syy[shortid] += y * y;
                            sxy[shortid] += x * y;
                            // console.log(shortid);
                            // x = N
                            
                        } else {
                            if (sampleCount==11){
                                //退出序列
                                var first = history[shortid][0];
                                var last = history[shortid][9];
                                history[shortid] = [first,last];
                                history[shortid].push(remainsPart);
    
                                // console.log(history[shortid])
    
                            } else {
                                //动态回归
                                history[shortid].push(remainsPart);
                                if(history[shortid].length==5){
                                   history[shortid].shift();
                                }
                                
                            }
                            //重新计算
                            sx[shortid] = 0;
                            sx[shortid] = 0;
                            sy[shortid] = 0;
                            sxx[shortid] = 0;
                            syy[shortid] = 0;
                            sxy[shortid] = 0;

                            for(i in history[shortid]){
                                // var x = i * 10; //不太明显
                                var x = i;
                                // console.log(i);
                                var y = remainsPart - history[shortid][0];
                                sx[shortid] += x;
                                sy[shortid] += y;
                                sxx[shortid] += x * x;
                                syy[shortid] += y * y;
                                sxy[shortid] += x * y;
                            }

                        }
                        
                        var N = history[shortid].length;
                        tendency[shortid] = (sy[shortid] * sx[shortid] / N - sxy[shortid])/(sx[shortid]*sx[shortid]/ N - sxx[shortid]);
                        tendency[shortid] = tendency[shortid].toFixed(2);
                        var tendencyControl = document.getElementById('T' + id);
                        if(tendencyControl) { tendencyControl.innerHTML = tendency[shortid];}
                    }
                    var DistControl = document.getElementById('D'+ id);
                    if(DistControl) {
                        DistControl.innerHTML = dist[shortid];
                    }
                    
                }

                // console.log(history);
                
                // console.log(tendency);
                
                // 推荐因数 期望人数 * 衰减量 （算法三）
                var recommend = Array(9);
                for(var i=0;i<9;++i){
                    if(document.getElementById('D' + (i+1)*100)){            // 六餐不参与
                        // 开始回归阶段 将会预测 30s 之后的人数
                        // 动态回归阶段 将会预测 5min 之后的人数
                        recommend[i] = Math.round((remains[i] + 30*tendency[i]) * decay[i]);
                        var recommendControl = document.getElementById('F'+(i+1)*100);
                        if(recommendControl) { recommendControl.innerHTML = recommend[i];}
                    }
                    else
                        recommend[i] = -1;
                }

                //推荐排序
                // var order = new Array(count);
                var prevMax = 200000;
                for(var i = 0; i < count; i++){
                    var maxValue = -1;
                    var maxptr = -1;
                    for(var j = 0; j < 9; j++){
                        if (recommend[j]>maxValue && recommend[j]<prevMax){
                            maxValue = recommend[j];
                            maxptr = j;
                        }
                    }
                    // order[i] = maxptr;
                    // 增加样式 N O Q R D F
                    // var prefix = ['N','O','Q','R','D','F'];
                    // for(var i=0; i<prefix.length; i++)
                    // 双 for 容易崩溃
                    $('#N'+(maxptr+1)*100).css('grid-row',i+2);
                    $('#O'+(maxptr+1)*100).css('grid-row',i+2);
                    $('#Q'+(maxptr+1)*100).css('grid-row',i+2);
                    $('#R'+(maxptr+1)*100).css('grid-row',i+2);
                    $('#D'+(maxptr+1)*100).css('grid-row',i+2);
                    $('#T'+(maxptr+1)*100).css('grid-row',i+2);
                    $('#F'+(maxptr+1)*100).css('grid-row',i+2);
                    prevMax = maxValue;
                }

                document.getElementById('R000').innerHTML = remain;
                var percent = Math.round(remain/seats * 100);
                percent = (percent>100? 100: percent);
                document.getElementById('P000').value = percent;
                var percentctrl = document.getElementById('Q000');
                if(percentctrl){ percentctrl.innerHTML = percent + '%'; }
                document.getElementById('D000').innerHTML = avgDist;

                
                if(sampleCount==11){
                    clearInterval(int);
                    int = setInterval(refreshData,10000);
                }
            }
        };
        xmlhttp.open('GET', 'https://canteen.sjtu.edu.cn/CARD/Ajax/Place' , true);
        xmlhttp.send();
    }
    _ajaxReq();
    
}

refreshData();

//定时器
var int=self.setInterval("refreshData()",1000);