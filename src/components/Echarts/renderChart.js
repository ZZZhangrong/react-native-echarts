import echarts from './echarts.min';
import toString from '../../util/toString';

export default function renderChart(props) {
  const height = `${props.height || 400}px`;
  const width = props.width ? `${props.width}px` : 'auto';
  const lastXIndex = props.option.xAxis && props.option.xAxis.data ? props.option.xAxis.data.length - 1 : 0
  const getChartRef = props.getChartRef
  // downplay取消高亮，为了避免饼图点击高亮和文字点击高亮同时存在，所以在点击饼图高亮的时候先将饼图中所有高亮取消，downplayArray存储所有索引
  let downplayArray = []
  if (props.option.series && props.option.series.length > 0 && props.option.series[0].type && props.option.series[0].type === 'pie') {
    let num = props.option.series[0].data.length
    for (var i = 0; i< num; i++) {
      downplayArray.push(i)
    }
  }
  return `
    document.getElementById('main').style.height = "${height}";
    document.getElementById('main').style.width = "${width}";
    var myChart = echarts.init(document.getElementById('main'));
    myChart.setOption(${toString(props.option)});
    window.document.addEventListener('message', function(e) {
      var option = JSON.parse(e.data);
      if (option.highlight || option.highlight === 0) {
         myChart.dispatchAction({  
           type: 'highlight',
           dataIndex: option.highlight,
         });
         myChart.dispatchAction({
           type: 'downplay',
           dataIndex: option.highlight === option.downplay ? -1 : option.downplay
         });
      } else {
        myChart.setOption(option);
      }
    });
    if (${getChartRef}) {
      setTimeout(function () {
         window.postMessage('getChartRef')
      }, 0)
    }
    myChart.on('click', function(params) {
      var seen = [];
      var paramsString = JSON.stringify(params, function(key, val) {
        if (val != null && typeof val == "object") {
          if (seen.indexOf(val) >= 0) {
            return;
          }
          seen.push(val);
        }
        return val;
      });
      window.postMessage(paramsString);
      myChart.dispatchAction({
         type: 'downplay',
         dataIndex: ${JSON.stringify(downplayArray)}
      });
      myChart.dispatchAction({  
          type: 'highlight',
          dataIndex: params.dataIndex
      });
    });
    myChart.dispatchAction({  
      type: 'showTip',
      seriesIndex:0 ,
      dataIndex: ${lastXIndex},
    });
  `
}
