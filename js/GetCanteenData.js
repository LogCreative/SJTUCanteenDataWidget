function refreshData(){
                
    function _setHtml(dom, h) {
        dom.innerHTML = h;
    }
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
                // console.log(CData);
                var seats = 0;
                var used = 0;
                var remain = 0;

                // 距离数据
                var dist = [0.55,1.0,0.75,0.15,1.6,1.7,1.5,0.77,0.41];

                for(i in CData){
                    
                    var id = CData[i]['Id']

                    var NameControl = document.getElementById('N'+ id);
                    if(NameControl) { NameControl.innerHTML = CData[i]['Name'];}
                    var RemainControl = document.getElementById('R'+ id);
                    if(RemainControl) { RemainControl.innerHTML = CData[i]['Seat_r']};
                    var ProgressControl = document.getElementById('P'+ id);
                    if(ProgressControl) { 
                        var Percentage = Math.round(CData[i]['Seat_r']/CData[i]['Seat_s'] * 100);
                        Percentage = (Percentage>100 ? 100 : Percentage);
                        ProgressControl.value = Percentage;
                        var PercentageControl = document.getElementById('Q' + id);
                        if(PercentageControl){ PercentageControl.innerHTML = Percentage + '%'; }
                        seats += CData[i]['Seat_s']; //总座位数
                        used += CData[i]['Seat_u'];  //使用中的座位数
                        remain += CData[i]['Seat_r'];  //剩余的座位数
                    }
                    var DistControl = document.getElementById('D'+ id);
                    if(DistControl) { DistControl.innerHTML = dist[id/100 - 1];}
                    
                }

                document.getElementById('R000').innerHTML = remain;
                var percent = Math.round(remain/seats * 100);
                percent = (percent>100? 100: percent);
                document.getElementById('P000').value = percent;
                var percentctrl = document.getElementById('Q000');
                if(percentctrl){ percentctrl.innerHTML = percent + '%'; }
            }
        };
        xmlhttp.open('GET', 'https://canteen.sjtu.edu.cn/CARD/Ajax/Place' , true);
        xmlhttp.send();
    }
    _ajaxReq();
    
}

refreshData();

//定时器
var int=self.setInterval("refreshData()",10000);