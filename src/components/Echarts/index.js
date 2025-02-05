import React, { Component } from 'react';
import { WebView, View, StyleSheet, Platform } from 'react-native';
import renderChart from './renderChart';
import echarts from './echarts.min';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.setNewOption = this.setNewOption.bind(this);
  }


  componentWillReceiveProps(nextProps) {
    // 去掉之前通过option去reload图表，因为动态数据渲染会导致页面空白，所以新增needReload字段，为true时去reload图表，按需求自行控制
    /*if(nextProps.option !== this.props.option) {
      this.refs.chart.reload();
    }*/

    if (nextProps.needReload) {
      this.refs.chart.reload();
    }
  }

  setNewOption(option) {
    this.refs.chart.postMessage(JSON.stringify(option));
  }

  render() {
    const source = Platform.OS === 'android' && !__DEV__ ? { uri:'file:///android_asset/tpl.html' } : require('./tpl.html');
    return (
      <View style={{flex: 1, height: this.props.height || 400,}}>
        <WebView
          ref="chart"
          scrollEnabled = {false}
          renderLoading={() => <View style={{backgroundColor:this.props.backgroundColor || 'transparent'}}/>} // 设置空View，修复webview闪白的问题
          injectedJavaScript = {renderChart(this.props)}
          style={{
            height: this.props.height || 400,
            backgroundColor: this.props.backgroundColor || 'transparent'
          }}
          scalesPageToFit={Platform.OS !== 'ios'}
          source={source}
          onMessage={event => {
            if (event.nativeEvent.data === 'getChartRef') {
              this.props.getChartRef(this.refs.chart)
            } else {
              this.props.onPress ? this.props.onPress(JSON.parse(event.nativeEvent.data)) : null
            }
          }}
        />
      </View>
    );
  }
}
