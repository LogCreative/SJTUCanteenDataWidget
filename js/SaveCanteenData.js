    var history = new Array();
    for(var i=0;i<9;i++)
        history[i] = new Array();
    
    // var starttime = Date.now();
    // timestamp = [];

    var samplecount = 0;

    var chart = null;

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
                
                var nowtime = Date.now();
                // timestamp.push(nowtime);
                // console.log(nowtime);

                for(i in CData) {
                    
                    var id = CData[i]['Id']
                    var shortid = id/100 - 1;

                    var seatsPart = CData[i]['Seat_s'];
                    var remainsPart = CData[i]['Seat_r'];

                    if(id==500){        //数据修正
                        seatsPart = 423;
                        remainsPart = 423 - CData[i]['Seat_u'];
                    } else if(id==700){ 
                        seatsPart = 206;
                        remainsPart = 206 - CData[i]['Seat_u'];
                    }

                    var percentage = Math.round(remainsPart / seatsPart * 100);

                    if(document.getElementById('Z' + id)){
                        history[shortid].push([nowtime,percentage]);
                    }   
                }

                ++samplecount;

                if(samplecount==1){
                    // 创建 HighCharts
                Highcharts.setOptions({
                    global:{
                        useUTC: false
                    },credits:{
                        enabled:false
                    },
                });

                chart = Highcharts.chart('container', {
                        chart: {
                            zoomType: 'x',
                            // redraw: false,
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
                                millisecond: '%H:%M:%S',
                                second: '%H:%M:%S',
                                minute: '%H:%M',
                                hour: '%H:%M',
                                day: '%m-%d',
                                week: '%m-%d',
                                month: '%Y-%m',
                                year: '%Y'
                            },
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
                            },
                            valueSuffix: '%'
                        },
                        yAxis: {
                            title: {
                                text: '空闲比例'
                            },
                            labels: {
                                formatter: function () {
                                    return this.value+ '%';
                                }
                            },
                            max: 100,
                        },
                        legend: {
                            enabled: true
                        },
                        plotOptions: {
                            area: {
                                // category: timestamp,
                                // fillColor: {
                                //     linearGradient: {
                                //         x1: 0,
                                //         y1: 0,
                                //         x2: 0,
                                //         y2: 1
                                //     },
                                //     stops: [
                                //         [0, new Highcharts.getOptions().colors[0]],
                                //         [1, new Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                                //     ]
                                // },
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
                            name: '一餐',
                            data: history[0],
                            visible:false,
                        },
                        {
                            type: 'area',
                            name: '二餐',
                            data: history[1],
                            visible:false,
                        },{
                            type: 'area',
                            name: '三餐',
                            data: history[2],
                            visible:false,
                        },{
                            type: 'area',
                            name: '四餐',
                            data: history[3],
                        },{
                            type: 'area',
                            name: '五餐',
                            data: history[4],
                            visible:false,
                        },{
                            type: 'area',
                            name: '七餐',
                            data: history[6],
                            visible:false,
                        },{
                            type: 'area',
                            name: '哈乐',
                            data: history[7],
                            visible:false,
                        },{
                            type: 'area',
                            name: '玉兰苑',
                            data: history[8],
                            visible:false,
                        }
                    ]
                });
                } else {
                    for(var i=0;i<5;++i)
                        chart.series[i].update({data:history[i]});
                    for(var i=6;i<9;++i)
                        chart.series[i-1].update({data:history[i]});
                }

            }
        };
        xmlhttp.open('GET', 'https://canteen.sjtu.edu.cn/CARD/Ajax/Place' , true);
        xmlhttp.send();
    }
    _ajaxReq();
    
}