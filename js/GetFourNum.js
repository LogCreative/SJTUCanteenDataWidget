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
            for(i in CData) {
                if (CData[i]['Id']==400) {
                    var remains = CData[i]['Seat_r'];
                    document.getElementById('CanteenNum').innerHTML = remains;
                }
            }
        }
    };
    xmlhttp.open('GET', 'https://canteen.sjtu.edu.cn/CARD/Ajax/Place' , true);
    xmlhttp.send();
};
_ajaxReq();

//定时器
var int=self.setInterval("_ajaxReq()",10000);