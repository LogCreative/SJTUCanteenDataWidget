var history = new Array();
for(var i=0;i<9;i++)
    history[i] = new Array();

var sampleCount = 0;

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

                // 距离数据
                // 一 二 三 四 五 六 七 哈乐 玉兰
                var dist = [0.55,1.0,0.75,0.15,1.6,1.7,1.5,0.77,0.41];

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
                        history[shortid].push(Percentage);
                    }
                    var DistControl = document.getElementById('D'+ id);
                    if(DistControl) {
                        DistControl.innerHTML = dist[shortid];
                    }
                    
                }

                // 推荐因数
                var recommend = Array(9);
                for(var i=0;i<9;++i){
                    if(document.getElementById('D' + (i+1)*100)){            // 六餐不参与
                        recommend[i] = Math.round(remains[i] * decay[i]);
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

                if(++sampleCount==10){
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