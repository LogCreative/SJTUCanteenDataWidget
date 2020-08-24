    var history = new Array();
    for(var i=0;i<9;i++)
        history[i] = new Array();
    
    timestamp = [];

    refreshData();

    //定时器
    var int=self.setInterval("refreshData()",10000);

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
                
                timestamp.push(Date.now());

                for(i in CData) {
                    
                    var id = CData[i]['Id']
                    var shortid = id/100 - 1;

                    var remainsPart = CData[i]['Seat_r'];

                    if(id==500)        //数据修正
                        remainsPart = 423 - CData[i]['Seat_u'];
                    
                    if(document.getElementById('Z' + id)){
                        history[shortid].push(remainsPart);
                    }   
                }
            }
        };
        xmlhttp.open('GET', 'https://canteen.sjtu.edu.cn/CARD/Ajax/Place' , true);
        xmlhttp.send();
    }
    _ajaxReq();
    
}