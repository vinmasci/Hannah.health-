# Configuration Setup Guide

## ⚠️ CRITICAL SECURITY NOTICE

**NEVER commit API keys to version control!** The `APIConfig.swift` file contains sensitive credentials and is excluded from git via `.gitignore`.

## Initial Setup

### Step 1: Create Your Configuration File

```bash
# Navigate to this directory
cd HannahHealth/Core/Configuration/

# Copy the template to create your config file
cp APIConfig.template.swift APIConfig.swift
```

### Step 2: Add Your API Keys

Edit `APIConfig.swift` and replace the placeholder values:

1. **OpenAI API Key**
   - Visit: https://platform.openai.com/api-keys
   - Create a new API key
   - Replace `YOUR_OPENAI_API_KEY_HERE` with your key

2. **Brave Search API Key**
   - Visit: https://brave.com/search/api/
   - Sign up for API access
   - Replace `YOUR_BRAVE_SEARCH_API_KEY_HERE` with your key

3. **Supabase Configuration**
   - Visit your Supabase project dashboard
   - Go to Settings → API
   - Copy your Project URL and anon key
   - Replace the placeholder values

### Step 3: Verify Configuration

The app will validate your configuration on launch. If you see an error about missing API keys, double-check that you've replaced all placeholder values.

## Security Best Practices

### DO ✅
- Keep `APIConfig.swift` local only
- Use different keys for development and production
- Rotate keys regularly
- Store production keys in Keychain (see template for code example)
- Use environment variables in CI/CD

### DON'T ❌
- Commit `APIConfig.swift` to git
- Share API keys in code reviews
- Log API keys in debug output
- Use the same keys across multiple developers
- Store keys in UserDefaults

## Key Rotation

If your keys are ever exposed:

1. **Immediately revoke the exposed keys** in their respective dashboards
2. **Generate new keys**
3. **Update your local `APIConfig.swift`**
4. **Check git history** to ensure no keys are in commits
5. **Review access logs** in your API dashboards for unauthorized usage

## Production Setup

For production deployments, implement proper key management:

### Option 1: iOS Keychain Services
```swift
// Store keys securely in Keychain
KeychainService.store(key: "openai_key", value: apiKey)
```

### Option 2: Environment Variables
Set in Xcode build schemes:
- Edit Scheme → Run → Arguments → Environment Variables
- Add: `OPENAI_KEY` = `your-key-here`

### Option 3: CI/CD Secrets
- Use GitHub Secrets for GitHub Actions
- Use environment variables in your build pipeline
- Inject at build time, not stored in code

## Troubleshooting

### "Configuration Error: OpenAI API key not configured"
- You haven't created `APIConfig.swift` yet
- Copy the template and add your keys

### "Invalid API Key" from OpenAI
- Check that you copied the complete key
- Verify the key is active in your OpenAI dashboard
- Ensure you're not using a revoked key

### Build errors about missing APIConfig
- Make sure `APIConfig.swift` exists in this directory
- File should not be red in Xcode (that means it's missing)

## Support

For issues with:
- **OpenAI API**: https://platform.openai.com/docs
- **Brave Search**: https://brave.com/search/api/documentation
- **Supabase**: https://supabase.com/docs

## Important Files

- `APIConfig.template.swift` - Safe template (commit this)
- `APIConfig.swift` - Your actual keys (NEVER commit)
- `.gitignore` - Ensures APIConfig.swift isn't tracked