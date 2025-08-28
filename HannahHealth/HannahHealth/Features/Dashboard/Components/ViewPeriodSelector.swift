//
//  ViewPeriodSelector.swift
//  HannahHealth
//
//  Created on 27/8/2025.
//

import SwiftUI

struct ViewPeriodSelector: View {
    @Binding var selectedPeriod: ViewPeriod
    @Binding var currentDate: Date
    
    var body: some View {
        HStack(spacing: 8) {
            // Left arrow
            Button(action: navigateBackward) {
                Image(systemName: "chevron.left")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(width: 32, height: 32)
                    .background(Theme.glassMorphism)
                    .cornerRadius(16)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Theme.cardBorder)
                    )
            }
            
            // Period selectors
            HStack(spacing: 4) {
                ForEach(ViewPeriod.allCases, id: \.self) { period in
                    PeriodPill(
                        title: period.rawValue,
                        isSelected: selectedPeriod == period,
                        action: {
                            withAnimation(.spring(duration: 0.3)) {
                                selectedPeriod = period
                            }
                        }
                    )
                }
            }
            
            // Right arrow
            Button(action: navigateForward) {
                Image(systemName: "chevron.right")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(width: 32, height: 32)
                    .background(Theme.glassMorphism)
                    .cornerRadius(16)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Theme.cardBorder)
                    )
            }
        }
    }
    
    private func navigateBackward() {
        withAnimation(.spring(duration: 0.3)) {
            switch selectedPeriod {
            case .day:
                currentDate = Calendar.current.date(byAdding: .day, value: -1, to: currentDate) ?? currentDate
            case .week:
                currentDate = Calendar.current.date(byAdding: .weekOfYear, value: -1, to: currentDate) ?? currentDate
            case .month:
                currentDate = Calendar.current.date(byAdding: .month, value: -1, to: currentDate) ?? currentDate
            }
        }
    }
    
    private func navigateForward() {
        withAnimation(.spring(duration: 0.3)) {
            switch selectedPeriod {
            case .day:
                currentDate = Calendar.current.date(byAdding: .day, value: 1, to: currentDate) ?? currentDate
            case .week:
                currentDate = Calendar.current.date(byAdding: .weekOfYear, value: 1, to: currentDate) ?? currentDate
            case .month:
                currentDate = Calendar.current.date(byAdding: .month, value: 1, to: currentDate) ?? currentDate
            }
        }
    }
}

struct PeriodPill: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(isSelected ? .white : .white.opacity(0.7))
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(
                    Group {
                        if isSelected {
                            Theme.emerald
                        } else {
                            Theme.glassMorphism
                        }
                    }
                )
                .cornerRadius(16)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(isSelected ? Color.clear : Theme.cardBorder)
                )
        }
    }
}

// Helper to get display text for current period
extension ViewPeriodSelector {
    static func periodDisplayText(for date: Date, period: ViewPeriod) -> String {
        let formatter = DateFormatter()
        
        switch period {
        case .day:
            formatter.dateFormat = "EEEE, MMM d"
            return formatter.string(from: date)
            
        case .week:
            let calendar = Calendar.current
            let weekday = calendar.component(.weekday, from: date)
            let daysFromMonday = (weekday + 5) % 7
            guard let monday = calendar.date(byAdding: .day, value: -daysFromMonday, to: date),
                  let sunday = calendar.date(byAdding: .day, value: 6, to: monday) else {
                return ""
            }
            formatter.dateFormat = "MMM d"
            return "\(formatter.string(from: monday)) - \(formatter.string(from: sunday))"
            
        case .month:
            formatter.dateFormat = "MMMM yyyy"
            return formatter.string(from: date)
        }
    }
}