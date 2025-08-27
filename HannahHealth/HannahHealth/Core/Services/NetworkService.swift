//
//  NetworkService.swift
//  HannahHealth
//
//  Created on 27/8/2025.
//

import Foundation

enum NetworkError: LocalizedError {
    case invalidURL
    case noData
    case decodingError
    case serverError(String)
    case unauthorized
    case apiKeyMissing
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .noData:
            return "No data received"
        case .decodingError:
            return "Failed to decode response"
        case .serverError(let message):
            return "Server error: \(message)"
        case .unauthorized:
            return "Unauthorized - Check API keys"
        case .apiKeyMissing:
            return "API keys not configured"
        }
    }
}

protocol NetworkServiceProtocol {
    func request<T: Decodable>(_ endpoint: String, 
                               method: String,
                               headers: [String: String],
                               body: Data?) async throws -> T
}

class NetworkService: NetworkServiceProtocol {
    static let shared = NetworkService()
    private let session = URLSession.shared
    
    private init() {}
    
    func request<T: Decodable>(_ endpoint: String,
                              method: String = "GET",
                              headers: [String: String] = [:],
                              body: Data? = nil) async throws -> T {
        guard let url = URL(string: endpoint) else {
            throw NetworkError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method
        
        headers.forEach { key, value in
            request.setValue(value, forHTTPHeaderField: key)
        }
        
        if let body = body {
            request.httpBody = body
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }
        
        do {
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw NetworkError.serverError("Invalid response")
            }
            
            switch httpResponse.statusCode {
            case 200...299:
                let decoder = JSONDecoder()
                do {
                    return try decoder.decode(T.self, from: data)
                } catch {
                    print("Decoding error: \(error)")
                    if let jsonString = String(data: data, encoding: .utf8) {
                        print("Response: \(jsonString)")
                    }
                    throw NetworkError.decodingError
                }
            case 401:
                throw NetworkError.unauthorized
            default:
                let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown error"
                throw NetworkError.serverError(errorMessage)
            }
        } catch {
            if error is NetworkError {
                throw error
            }
            throw NetworkError.serverError(error.localizedDescription)
        }
    }
}