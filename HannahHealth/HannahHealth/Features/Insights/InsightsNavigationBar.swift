//
//  InsightsNavigationBar.swift
//  HannahHealth
//
//  Navigation and time range components for Insights
//

import SwiftUI

struct InsightsNavigationBar: View {
    @Binding var selectedTimeRange: TimeRange
    @Binding var currentDate: Date
    let periodDisplayText: String
    
    var body: some View {
        VStack(spacing: 16) {
            // Time range tabs
            HStack(spacing: 8) {
                ForEach(TimeRange.allCases, id: \.self) { range in
                    TimeRangeTab(
                        range: range,
                        isSelected: selectedTimeRange == range,
                        action: {
                            withAnimation(.spring(duration: 0.3)) {
                                selectedTimeRange = range
                                currentDate = Date()
                            }
                        }
                    )
                }
            }
            .padding(.horizontal)
            
            // Date navigation
            HStack {
                Button(action: {
                    withAnimation(.spring(duration: 0.3)) {
                        navigateBackward()
                    }
                }) {
                    Image(systemName: "chevron.left")
                        .foregroundColor(.white.opacity(0.7))
                        .frame(width: 32, height: 32)
                        .background(Color.white.opacity(0.1))
                        .cornerRadius(8)
                }
                
                Spacer()
                
                Text(periodDisplayText)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.white)
                
                Spacer()
                
                Button(action: {
                    withAnimation(.spring(duration: 0.3)) {
                        navigateForward()
                    }
                }) {
                    Image(systemName: "chevron.right")
                        .foregroundColor(canNavigateForward ? .white.opacity(0.7) : .white.opacity(0.3))
                        .frame(width: 32, height: 32)
                        .background(Color.white.opacity(0.1))
                        .cornerRadius(8)
                }
                .disabled(!canNavigateForward)
            }
            .padding(.horizontal)
        }
    }
    
    // MARK: - Navigation Logic
    private func navigateBackward() {
        let calendar = Calendar.current
        
        switch selectedTimeRange {
        case .today:
            currentDate = calendar.date(byAdding: .day, value: -1, to: currentDate) ?? currentDate
        case .week:
            currentDate = calendar.date(byAdding: .weekOfYear, value: -1, to: currentDate) ?? currentDate
        case .month:
            currentDate = calendar.date(byAdding: .month, value: -1, to: currentDate) ?? currentDate
        case .threeMonths:
            currentDate = calendar.date(byAdding: .month, value: -3, to: currentDate) ?? currentDate
        case .year:
            currentDate = calendar.date(byAdding: .year, value: -1, to: currentDate) ?? currentDate
        }
    }
    
    private func navigateForward() {
        guard canNavigateForward else { return }
        let calendar = Calendar.current
        
        switch selectedTimeRange {
        case .today:
            currentDate = calendar.date(byAdding: .day, value: 1, to: currentDate) ?? currentDate
        case .week:
            currentDate = calendar.date(byAdding: .weekOfYear, value: 1, to: currentDate) ?? currentDate
        case .month:
            currentDate = calendar.date(byAdding: .month, value: 1, to: currentDate) ?? currentDate
        case .threeMonths:
            currentDate = calendar.date(byAdding: .month, value: 3, to: currentDate) ?? currentDate
        case .year:
            currentDate = calendar.date(byAdding: .year, value: 1, to: currentDate) ?? currentDate
        }
    }
    
    private var canNavigateForward: Bool {
        let calendar = Calendar.current
        let now = Date()
        
        switch selectedTimeRange {
        case .today:
            return currentDate < calendar.startOfDay(for: now)
        case .week:
            let weekday = calendar.component(.weekday, from: currentDate)
            let daysFromMonday = (weekday + 5) % 7
            guard let sunday = calendar.date(byAdding: .day, value: 6 - daysFromMonday, to: currentDate) else { return true }
            return sunday < now
        case .month:
            guard let endOfMonth = calendar.dateInterval(of: .month, for: currentDate)?.end else { return true }
            return endOfMonth < now
        case .threeMonths:
            guard let threeMonthsEnd = calendar.date(byAdding: .month, value: 3, to: currentDate) else { return true }
            return threeMonthsEnd < now
        case .year:
            guard let endOfYear = calendar.dateInterval(of: .year, for: currentDate)?.end else { return true }
            return endOfYear < now
        }
    }
}

// MARK: - Time Range Tab
struct TimeRangeTab: View {
    let range: TimeRange
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(range.rawValue)
                .font(.system(size: 13, weight: isSelected ? .semibold : .medium))
                .foregroundColor(isSelected ? .white : .white.opacity(0.6))
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(
                    isSelected ? Color.white.opacity(0.2) : Color.clear
                )
                .cornerRadius(8)
        }
    }
}