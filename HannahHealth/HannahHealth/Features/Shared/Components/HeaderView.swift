//
//  HeaderView.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import SwiftUI

struct HeaderView: View {
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text("Hannah Health")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                Text("Pizza night can still be pizza night")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            Spacer()
            Image(systemName: "person.circle.fill")
                .font(.largeTitle)
                .foregroundColor(.blue)
        }
        .padding()
        .background(Color(UIColor.systemBackground))
        .shadow(radius: 2)
    }
}