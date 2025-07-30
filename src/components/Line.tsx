import React from "react";
import { View } from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect, Text } from "react-native-svg";
import {Colors} from "../constants/Colors";
/**
 * Line 컴포넌트
 * 데이터를 받아서 곡선 그래프를 그리는 컴포넌트입니다.
 * @param width - 그래프의 전체 너비
 * @param height - 그래프의 전체 높이
 * @param data - 12개의 데이터 포인트를 포함하는 배열
 */
export const Line = ({ width, height, data }: { width: number, height: number, data: number[] }) => {
  // 데이터가 없거나 12개의 포인트가 아닌 경우 렌더링하지 않음
  if (!data || data.length !== 12) return null;

  // 현재 월 가져오기 (0-11)
  const currentMonth = new Date().getMonth();
  // 3월~2월 순서로 배열 재정렬했으므로, 인덱스 조정
  const adjustedMonthIndex = (currentMonth + 10) % 12;

  // 3월~2월 순서로 배열 재정렬
  const reorderedData = [...data.slice(2), ...data.slice(0, 2)];
  // 계절 라벨 배열 (3월~2월 기준, 중간 월에만 계절명 표시)
  const seasonLabels = ["", "봄", "", "", "여름", "", "", "가을", "", "", "겨울", ""];

  // 그래프 영역의 여백과 크기 계산
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const stepX = chartWidth / (reorderedData.length - 1);

  // Y축 스케일링을 위한 최소/최대값 계산
  const minY = Math.min(...reorderedData); const maxY = Math.max(...reorderedData);

  // Y값을 그래프 좌표로 변환하는 함수
  const scaleY = (value: number) => {
    return chartHeight - ((value - minY) / (maxY - minY)) * chartHeight + padding;
  };

  // 데이터 포인트를 그래프 좌표로 변환
  const points = reorderedData.map((d, i) => ({
    x: padding + i * stepX,
    y: scaleY(d),
  }));

  // 양 끝에 가상의 포인트 추가 (끝점과 동일한 값으로)
  const extendedPoints = [
    { x: points[0].x - stepX, y: points[0].y },
    ...points,
    { x: points[points.length - 1].x + stepX, y: points[points.length - 1].y }
  ];

  /**
   * Catmull-Rom Spline을 Cubic Bezier로 변환하여
   * 모든 점을 통과하는 부드러운 곡선 경로를 생성하는 함수
   */
  const createBezierPath = (points: { x: number, y: number }[]) => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1] || points[i];
      const p3 = points[i + 2] || p2;
      // Catmull-Rom to Bezier 공식
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  const bezierPath = createBezierPath(extendedPoints);
  // 곡선 아래 영역을 채우기 위한 경로 생성
  const areaPath = `${bezierPath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

  return (
    <View style={{ width: width, height: height,paddingBottom: 100}}>
      <Svg width={width} height={height}>
        <Defs>
          {/* 그래프 영역의 그라데이션 정의 */}
          <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.greenActive} stopOpacity="0.3" />
            <Stop offset="1" stopColor={Colors.greenActive} stopOpacity="0.05" />
          </LinearGradient>
        </Defs>

        {/* 곡선 아래 영역 (그라데이션 적용) */}
        <Path d={areaPath} fill="url(#gradient)" />

        {/* 메인 곡선 */}
        <Path d={bezierPath} stroke={Colors.greenTab} strokeWidth="2" fill="none" />

        {/* 데이터 포인트 표시 - 현재 월에 해당하는 점만 표시 */}
        {points.map((p, i) => (
          i === adjustedMonthIndex && (
            <Circle 
              key={i} 
              cx={p.x} 
              cy={p.y} 
              r="5" 
              fill="white" 
              stroke={Colors.greenTab}
              strokeWidth="2"
            />
          )
        ))}

        {/* x축 계절 라벨 표시 */}
        {points.map((p, i) => (
          <Text
            key={"label-" + i}
            x={p.x}
            y={height - 2}
            fontSize="12"
            fill="#333"
            textAnchor="middle"
          >
            {seasonLabels[i]}
          </Text>
        ))}
      </Svg>
    </View>
  );
};
