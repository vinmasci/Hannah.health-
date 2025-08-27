//
//  WeekView.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import SwiftUI

struct WeekView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Weekly Overview")
                .font(.headline)
            Text("Average: 1,520 cal/day")
            Text("Deficit: -1,750 total")
            Text("3 days on track ✅")
        }
    }
}