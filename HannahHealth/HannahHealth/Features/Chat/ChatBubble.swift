//
//  ChatBubble.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import SwiftUI

struct ChatBubble: View {
    let message: ChatMessage
    @State private var showTime = false
    
    var body: some View {
        HStack(alignment: .bottom, spacing: 2) {
            if message.isUser { Spacer(minLength: 40) }
            
            VStack(alignment: message.isUser ? .trailing : .leading, spacing: 2) {
                // Crisp glass message bubble
                Text(message.text)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(
                        ZStack {
                            // Black tinted bubbles
                            if message.isUser {
                                RoundedRectangle(cornerRadius: 18)
                                    .fill(Color.black.opacity(0.18))  // Darker for user
                                RoundedRectangle(cornerRadius: 18)
                                    .strokeBorder(Color.black.opacity(0.25), lineWidth: 0.5)
                            } else {
                                RoundedRectangle(cornerRadius: 18)
                                    .fill(Color(hex: "1B1464").opacity(0.8))  // Dark blue tint for Hannah
                                RoundedRectangle(cornerRadius: 18)
                                    .strokeBorder(Color(hex: "1B1464").opacity(0.9), lineWidth: 0.5)
                            }
                        }
                    )
                    .foregroundColor(.primary)
                    .font(.system(size: 16, weight: .regular, design: .rounded))
                    .clipShape(RoundedRectangle(cornerRadius: 18))
                    .onTapGesture {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            showTime.toggle()
                        }
                    }
                
                // Confidence or time
                if showTime {
                    Text(message.timestamp.formatted(date: .omitted, time: .shortened))
                        .font(.caption2)
                        .foregroundColor(.secondary)
                } else if let confidence = message.confidence {
                    Text("\(Int(confidence * 100))% confident")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            
            if !message.isUser { Spacer(minLength: 40) }
        }
    }
}

// iMessage bubble shape
struct BubbleShape: Shape {
    let isFromUser: Bool
    
    func path(in rect: CGRect) -> Path {
        let width = rect.width
        let height = rect.height
        let cornerRadius: CGFloat = 18
        let tailSize: CGFloat = 6
        
        var path = Path()
        
        if isFromUser {
            // Right-aligned bubble with tail
            path.move(to: CGPoint(x: cornerRadius, y: 0))
            path.addLine(to: CGPoint(x: width - cornerRadius - tailSize, y: 0))
            path.addArc(center: CGPoint(x: width - cornerRadius - tailSize, y: cornerRadius),
                       radius: cornerRadius,
                       startAngle: Angle(degrees: -90),
                       endAngle: Angle(degrees: 0),
                       clockwise: false)
            
            // Tail
            path.addLine(to: CGPoint(x: width - tailSize, y: height - cornerRadius))
            path.addQuadCurve(to: CGPoint(x: width, y: height),
                             control: CGPoint(x: width - tailSize, y: height))
            path.addLine(to: CGPoint(x: width - tailSize - 5, y: height))
            
            // Bottom left corner
            path.addLine(to: CGPoint(x: cornerRadius, y: height))
            path.addArc(center: CGPoint(x: cornerRadius, y: height - cornerRadius),
                       radius: cornerRadius,
                       startAngle: Angle(degrees: 90),
                       endAngle: Angle(degrees: 180),
                       clockwise: false)
            
            // Left side
            path.addLine(to: CGPoint(x: 0, y: cornerRadius))
            path.addArc(center: CGPoint(x: cornerRadius, y: cornerRadius),
                       radius: cornerRadius,
                       startAngle: Angle(degrees: 180),
                       endAngle: Angle(degrees: 270),
                       clockwise: false)
        } else {
            // Left-aligned bubble with tail
            path.move(to: CGPoint(x: width - cornerRadius, y: 0))
            path.addLine(to: CGPoint(x: cornerRadius + tailSize, y: 0))
            path.addArc(center: CGPoint(x: cornerRadius + tailSize, y: cornerRadius),
                       radius: cornerRadius,
                       startAngle: Angle(degrees: -90),
                       endAngle: Angle(degrees: -180),
                       clockwise: true)
            
            // Tail
            path.addLine(to: CGPoint(x: tailSize, y: height - cornerRadius))
            path.addQuadCurve(to: CGPoint(x: 0, y: height),
                             control: CGPoint(x: tailSize, y: height))
            path.addLine(to: CGPoint(x: tailSize + 5, y: height))
            
            // Bottom right corner
            path.addLine(to: CGPoint(x: width - cornerRadius, y: height))
            path.addArc(center: CGPoint(x: width - cornerRadius, y: height - cornerRadius),
                       radius: cornerRadius,
                       startAngle: Angle(degrees: 90),
                       endAngle: Angle(degrees: 0),
                       clockwise: true)
            
            // Right side
            path.addLine(to: CGPoint(x: width, y: cornerRadius))
            path.addArc(center: CGPoint(x: width - cornerRadius, y: cornerRadius),
                       radius: cornerRadius,
                       startAngle: Angle(degrees: 0),
                       endAngle: Angle(degrees: -90),
                       clockwise: true)
        }
        
        return path
    }
}