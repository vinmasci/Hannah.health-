//
//  InsightsChartView.swift
//  HannahHealth
//
//  Chart visualization component for Insights
//

import SwiftUI

struct InsightsChartView: View {
    let data: [ChartDataPoint]
    let metric: MetricType
    let averageValue: String
    let changeValue: String
    
    private var barSpacing: CGFloat {
        switch data.count {
        case 0...7: return 8
        case 8...12: return 4
        default: return 2
        }
    }
    
    private var fontSize: CGFloat {
        switch data.count {
        case 0...7: return 10
        case 8...12: return 9
        default: return 8
        }
    }
    
    private func barWidth(for totalWidth: CGFloat) -> CGFloat {
        let totalSpacing = barSpacing * CGFloat(data.count - 1)
        let availableWidth = totalWidth - totalSpacing - 32 // Padding
        return max(20, availableWidth / CGFloat(data.count))
    }
    
    private func barHeight(for value: Double) -> CGFloat {
        guard let maxValue = data.map({ $0.value }).max(), maxValue > 0 else { return 0 }
        return CGFloat(value / maxValue) * 160
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Stats Row
            HStack(spacing: 20) {
                StatItem(
                    title: "Average",
                    value: averageValue,
                    unit: metric.unit,
                    color: metric.color
                )
                
                StatItem(
                    title: "Change",
                    value: changeValue,
                    unit: metric.unit,
                    color: Double(changeValue) ?? 0 < 0 ? Theme.emerald : Theme.coral
                )
                
                StatItem(
                    title: "Today",
                    value: String(format: metric == .weight ? "%.1f" : "%.0f", data.last?.value ?? 0),
                    unit: metric.unit,
                    color: .white
                )
            }
            
            // Bar Chart
            GeometryReader { geometry in
                HStack(alignment: .bottom, spacing: barSpacing) {
                    ForEach(data) { point in
                        VStack(spacing: 4) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(metric.color.opacity(0.8))
                                .frame(width: barWidth(for: geometry.size.width), height: barHeight(for: point.value))
                            
                            Text(point.label)
                                .font(.system(size: fontSize))
                                .foregroundColor(.white.opacity(0.6))
                                .lineLimit(1)
                                .minimumScaleFactor(0.5)
                        }
                        .frame(width: barWidth(for: geometry.size.width))
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottom)
            }
            .frame(height: 200)
        }
        .padding()
        .background(Color.black.opacity(0.5))
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Theme.cardBorder, lineWidth: 1)
        )
    }
}

// MARK: - Stat Item Component
struct StatItem: View {
    let title: String
    let value: String
    let unit: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.6))
            
            HStack(spacing: 4) {
                Text(value)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(color)
                
                Text(unit)
                    .font(.system(size: 11))
                    .foregroundColor(.white.opacity(0.5))
            }
        }
    }
}