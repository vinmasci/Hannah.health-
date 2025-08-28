# Session 2: Fixing AI Integration

## Problems Solved

### Problem 1: "Can't use the internet"
**Issue**: ChatGPT wasn't using Brave Search results even though search was working

**Solution**: 
- Fixed OpenAI API response decoding (content changed from array to string)
- Enhanced system prompt to explicitly acknowledge web search results
- Added debug logging to track search execution

### Problem 2: Random Confidence Scores
**Issue**: Confidence scores seemed arbitrary (60-90%) without clear logic

**User Feedback**: "we should never use hardcoded values, they should always be from the search or database or chat gpts general knowledge"

**Solution**:
- Removed ALL hardcoded nutrition estimates (Big Mac = 563 cal, etc.)
- Now parses actual calories from Hannah's response using regex
- Confidence based on real data source quality:
  - 90%+ for official restaurant sites
  - 70-89% for nutrition databases
  - <70% for AI estimates

### Problem 3: Data Persistence

**Discussion**: Evaluated options (Core Data, CloudKit, UserDefaults, Supabase, Firebase)

**Decision**: Chose Supabase because:
- Cross-platform support (Android planned)
- Built-in authentication
- Real-time capabilities
- Row Level Security

**Implementation**:
1. Created `SupabaseService.swift` with auth and data methods
2. Generated complete database schema (`hannah_health_schema.sql`)
3. Set up 6 core tables with RLS policies
4. Updated `ChatViewModel` to save food entries
5. Created comprehensive `SUPABASE-SETUP.md` documentation

## Key Learnings
- OpenAI API can change response formats - need defensive coding
- Users expect real data, not estimates - always use actual sources
- Cross-platform requirements should be considered early
- Documentation is crucial for database setup

## Current State
- ✅ Chat working with real nutrition data
- ✅ Confidence scores from actual sources
- ✅ Supabase backend fully configured
- ⚠️ Auth UI not implemented (data won't save until users can log in)