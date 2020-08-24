    var history = new Array();
    for(var i=0;i<9;i++)
        history[i] = new Array();
    
    timestamp = [];

    var samplecount = 0;

    refreshData();

    //定时器
    var int=self.setInterval("refreshData()",1000);

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

                ++samplecount;

                if(samplecount<=10 || samplecount % 10 == 0)
                // 创建 HighCharts
                Highcharts.chart('container', {
                        chart: {
                            zoomType: 'x'
                        },
                        title: {
                            text: '趋势数据'
                        },
                        subtitle: {
                            text: document.ontouchstart === undefined ?
                            '鼠标拖动可以进行缩放' : '手势操作进行缩放'
                        },
                        xAxis: {
                            type: 'datetime',
                            dateTimeLabelFormats: {
                                millisecond: '%H:%M:%S.%L',
                                second: '%H:%M:%S',
                                minute: '%H:%M',
                                hour: '%H:%M',
                                day: '%m-%d',
                                week: '%m-%d',
                                month: '%Y-%m',
                                year: '%Y'
                            }
                        },
                        tooltip: {
                            dateTimeLabelFormats: {
                                millisecond: '%H:%M:%S.%L',
                                second: '%H:%M:%S',
                                minute: '%H:%M',
                                hour: '%H:%M',
                                day: '%Y-%m-%d',
                                week: '%m-%d',
                                month: '%Y-%m',
                                year: '%Y'
                            }
                        },
                        yAxis: {
                            title: {
                                text: '空闲座位数'
                            }
                        },
                        legend: {
                            enabled: true
                        },
                        plotOptions: {
                            area: {
                                category: timestamp,
                                fillColor: {
                                    linearGradient: {
                                        x1: 0,
                                        y1: 0,
                                        x2: 0,
                                        y2: 1
                                    },
                                    stops: [
                                        [0, new Highcharts.getOptions().colors[0]],
                                        [1, new Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                                    ]
                                },
                                marker: {
                                    radius: 2
                                },
                                lineWidth: 1,
                                states: {
                                    hover: {
                                        lineWidth: 1
                                    }
                                },
                                threshold: null
                            }
                        },
                        series: [{
                            type: 'area',
                            name: '四餐',
                            data: history[3],
                        }]
                });

            }
        };
        xmlhttp.open('GET', 'https://canteen.sjtu.edu.cn/CARD/Ajax/Place' , true);
        xmlhttp.send();
    }
    _ajaxReq();
    
}