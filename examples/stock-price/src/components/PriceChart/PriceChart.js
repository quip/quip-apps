import React, { Component } from 'react';
import quip from 'quip';
import Chart from 'chart.js';

class PriceChart extends Component {

    node = null
    chart = null

    setNode = (node) => {
        this.node = node;
    }

    getGradient() {
        const ctx = this.node;
        const gradient = ctx.getContext('2d').createLinearGradient(0, 150, 0, 0);
        gradient.addColorStop(0, quip.apps.ui.ColorMap[this.props.color].VALUE);
        gradient.addColorStop(1, quip.apps.ui.ColorMap[this.props.color].VALUE_LIGHT);

        return gradient;
    }

    componentDidMount() {
        const ctx = this.node;
        const gradient = this.getGradient();

        const labels = [];
        const data = [];

        for (let pricePoint of this.props.data) {
            labels.push(pricePoint.label);
            data.push(pricePoint.close);
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        data: data,
                        backgroundColor: gradient,
                        lineTension: 0,
                        pointRadius: 0,
                        borderColor: quip.apps.ui.ColorMap[this.props.color].VALUE,
                        borderWidth: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        gridLines: {
                            drawBorder: false,
                            drawTicks: false
                        },
                        ticks: {
                            display: false,
                            mirror: true
                        },
                    }],
                    xAxes: [{
                        display: false,
                        gridLines: {
                            drawBorder: false
                        }
                    }]
                },
                legend: {
                    display: false
                },
                hover: {
                    mode: false
                },
                tooltips: {
                    enabled: false
                },
                animation: {
                    duration: 1,
                    onComplete: function() {
                        var controller = this.chart.controller;
                        var chart = controller.chart;
                        var yAxis = controller.scales['y-axis-0'];
            
                        yAxis.ticks.forEach(function(value, index) {
                            var xOffset = 5;
                            var yOffset = (chart.height / (yAxis.ticks.length - 1) * index) - 5;
                            ctx.getContext('2d').fillStyle = '#ffffff';
                            ctx.getContext('2d').fillText(value, xOffset, yOffset);
                        });   
                    }
                }
            }
        });
    }

    componentDidUpdate() {
        // update chart
        const gradient = this.getGradient();
        const ctx = this.node;

        const labels = [];
        const data = [];

        for (let pricePoint of this.props.data) {
            labels.push(pricePoint.label);
            data.push(pricePoint.close);
        }

        this.chart.data.labels = labels;

        this.chart.data.datasets = [
            {
                data: data,
                backgroundColor: gradient,
                lineTension: 0,
                pointRadius: 0,
                borderColor: quip.apps.ui.ColorMap[this.props.color].VALUE,
                borderWidth: 3
            }
        ];

        this.chart.update(0);
    }

    render() {
        const id = `chart-${this.props.id}`;

        return (
            <div style={{position: 'relative', width: '100%', height: '100%'}}>
                <canvas id={id} ref={(node) => this.setNode(node)}></canvas>
            </div>
        );
    }
}
 
export default PriceChart;