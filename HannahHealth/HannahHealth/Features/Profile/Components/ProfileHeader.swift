//
//  ProfileHeader.swift
//  HannahHealth
//
//  Profile header with avatar and user info
//

import SwiftUI

struct ProfileHeader: View {
    @ObservedObject var viewModel: UserProfileViewModel
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: "person.circle.fill")
                .font(.system(size: 80))
                .foregroundColor(Theme.emerald)
            
            Text(viewModel.profileDisplayName)
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            Text(viewModel.userEmail)
                .font(.caption)
                .foregroundColor(.white.opacity(0.7))
        }
        .padding(.top, 40)
    }
}