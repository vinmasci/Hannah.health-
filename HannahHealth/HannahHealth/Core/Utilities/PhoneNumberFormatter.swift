//
//  PhoneNumberFormatter.swift
//  HannahHealth
//
//  Phone number formatting utilities
//

import Foundation

struct PhoneNumberFormatter {
    
    /// Formats a phone number based on the country code
    static func format(_ number: String, countryCode: String) -> String {
        // Remove all non-digit characters
        let digits = number.filter { $0.isNumber }
        
        switch countryCode {
        case "+1": // US/Canada format: XXX-XXX-XXXX
            guard digits.count <= 10 else { return digits }
            
            if digits.count <= 3 {
                return digits
            } else if digits.count <= 6 {
                let areaCode = String(digits.prefix(3))
                let rest = String(digits.dropFirst(3))
                return "\(areaCode)-\(rest)"
            } else {
                let areaCode = String(digits.prefix(3))
                let middle = String(digits.dropFirst(3).prefix(3))
                let last = String(digits.dropFirst(6).prefix(4))
                return "\(areaCode)-\(middle)-\(last)"
            }
            
        case "+44": // UK format: XXXX XXX XXXX
            guard digits.count <= 11 else { return digits }
            
            if digits.count <= 4 {
                return digits
            } else if digits.count <= 7 {
                let first = String(digits.prefix(4))
                let rest = String(digits.dropFirst(4))
                return "\(first) \(rest)"
            } else {
                let first = String(digits.prefix(4))
                let middle = String(digits.dropFirst(4).prefix(3))
                let last = String(digits.dropFirst(7).prefix(4))
                return "\(first) \(middle) \(last)"
            }
            
        case "+61": // Australia format: XXX XXX XXX
            guard digits.count <= 9 else { return digits }
            
            if digits.count <= 3 {
                return digits
            } else if digits.count <= 6 {
                let first = String(digits.prefix(3))
                let rest = String(digits.dropFirst(3))
                return "\(first) \(rest)"
            } else {
                let first = String(digits.prefix(3))
                let middle = String(digits.dropFirst(3).prefix(3))
                let last = String(digits.dropFirst(6).prefix(3))
                return "\(first) \(middle) \(last)"
            }
            
        case "+86": // China format: XXX XXXX XXXX
            guard digits.count <= 11 else { return digits }
            
            if digits.count <= 3 {
                return digits
            } else if digits.count <= 7 {
                let first = String(digits.prefix(3))
                let rest = String(digits.dropFirst(3))
                return "\(first) \(rest)"
            } else {
                let first = String(digits.prefix(3))
                let middle = String(digits.dropFirst(3).prefix(4))
                let last = String(digits.dropFirst(7).prefix(4))
                return "\(first) \(middle) \(last)"
            }
            
        case "+33": // France format: X XX XX XX XX
            guard digits.count <= 9 else { return digits }
            
            if digits.count <= 1 {
                return digits
            } else if digits.count <= 3 {
                let first = String(digits.prefix(1))
                let rest = String(digits.dropFirst(1))
                return "\(first) \(rest)"
            } else {
                let first = String(digits.prefix(1))
                let rest = String(digits.dropFirst(1))
                var formatted = first
                for (index, digit) in rest.enumerated() {
                    if index % 2 == 0 && index > 0 {
                        formatted += " "
                    }
                    formatted.append(digit)
                }
                return formatted
            }
            
        case "+49": // Germany format: XXXX XXXXXXX
            guard digits.count <= 11 else { return digits }
            
            if digits.count <= 4 {
                return digits
            } else {
                let first = String(digits.prefix(4))
                let rest = String(digits.dropFirst(4))
                return "\(first) \(rest)"
            }
            
        case "+91": // India format: XXXXX XXXXX
            guard digits.count <= 10 else { return digits }
            
            if digits.count <= 5 {
                return digits
            } else {
                let first = String(digits.prefix(5))
                let rest = String(digits.dropFirst(5))
                return "\(first) \(rest)"
            }
            
        case "+81": // Japan format: XX XXXX XXXX
            guard digits.count <= 10 else { return digits }
            
            if digits.count <= 2 {
                return digits
            } else if digits.count <= 6 {
                let first = String(digits.prefix(2))
                let rest = String(digits.dropFirst(2))
                return "\(first) \(rest)"
            } else {
                let first = String(digits.prefix(2))
                let middle = String(digits.dropFirst(2).prefix(4))
                let last = String(digits.dropFirst(6).prefix(4))
                return "\(first) \(middle) \(last)"
            }
            
        case "+7": // Russia format: XXX XXX-XX-XX
            guard digits.count <= 10 else { return digits }
            
            if digits.count <= 3 {
                return digits
            } else if digits.count <= 6 {
                let first = String(digits.prefix(3))
                let rest = String(digits.dropFirst(3))
                return "\(first) \(rest)"
            } else if digits.count <= 8 {
                let first = String(digits.prefix(3))
                let middle = String(digits.dropFirst(3).prefix(3))
                let rest = String(digits.dropFirst(6))
                return "\(first) \(middle)-\(rest)"
            } else {
                let first = String(digits.prefix(3))
                let middle = String(digits.dropFirst(3).prefix(3))
                let third = String(digits.dropFirst(6).prefix(2))
                let last = String(digits.dropFirst(8).prefix(2))
                return "\(first) \(middle)-\(third)-\(last)"
            }
            
        case "+55": // Brazil format: XX XXXXX-XXXX
            guard digits.count <= 11 else { return digits }
            
            if digits.count <= 2 {
                return digits
            } else if digits.count <= 7 {
                let first = String(digits.prefix(2))
                let rest = String(digits.dropFirst(2))
                return "\(first) \(rest)"
            } else {
                let first = String(digits.prefix(2))
                let middle = String(digits.dropFirst(2).prefix(5))
                let last = String(digits.dropFirst(7).prefix(4))
                return "\(first) \(middle)-\(last)"
            }
            
        case "+52": // Mexico format: XX XXXX XXXX
            guard digits.count <= 10 else { return digits }
            
            if digits.count <= 2 {
                return digits
            } else if digits.count <= 6 {
                let first = String(digits.prefix(2))
                let rest = String(digits.dropFirst(2))
                return "\(first) \(rest)"
            } else {
                let first = String(digits.prefix(2))
                let middle = String(digits.dropFirst(2).prefix(4))
                let last = String(digits.dropFirst(6).prefix(4))
                return "\(first) \(middle) \(last)"
            }
            
        default: // Generic format with spaces every 3-4 digits
            var formatted = ""
            for (index, digit) in digits.enumerated() {
                if index > 0 && index % 3 == 0 {
                    formatted += " "
                }
                formatted.append(digit)
            }
            return formatted
        }
    }
    
    /// Extracts country code and number from a full phone number
    static func extractCountryCode(from phone: String) -> (code: String, number: String) {
        let trimmedPhone = phone.trimmingCharacters(in: .whitespaces)
        
        // Check common country codes in order of specificity
        let commonCodes = [
            "+1268", "+1242", "+1246", "+1767", "+1809", "+1473", "+1876", "+1869", "+1758", "+1784", "+1868", // Caribbean
            "+44", "+61", "+86", "+33", "+49", "+91", "+81", "+7", "+55", "+52", // Major countries
            "+1", // US/Canada (check last for +1 prefix)
        ]
        
        for code in commonCodes {
            if trimmedPhone.hasPrefix(code) {
                let number = String(trimmedPhone.dropFirst(code.count)).trimmingCharacters(in: .whitespaces)
                return (code, number)
            }
        }
        
        // Try to extract any country code (up to 4 digits after +)
        if trimmedPhone.hasPrefix("+") {
            let codeEndIndex = trimmedPhone.firstIndex(of: " ") ?? trimmedPhone.index(trimmedPhone.startIndex, offsetBy: min(5, trimmedPhone.count))
            let code = String(trimmedPhone[..<codeEndIndex])
            let number = String(trimmedPhone[codeEndIndex...]).trimmingCharacters(in: .whitespaces)
            return (code, number)
        }
        
        // Default to US if no country code
        return ("+1", trimmedPhone)
    }
}