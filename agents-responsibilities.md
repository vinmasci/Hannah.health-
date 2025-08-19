# Development Agents - Responsibilities & Review Criteria

## 1. UI/UX Agent
**Responsibilities:**
- Component design consistency
- Accessibility (WCAG 2.1 AA compliance)
- Responsive breakpoints (mobile, tablet, desktop)
- Touch target sizes (minimum 44x44px)
- Color contrast ratios
- Loading states and skeleton screens
- Error state designs
- Empty state designs
- Micro-interactions and animations
- Visual hierarchy and typography

**Review Criteria:**
- All interactive elements have hover/focus states
- Forms have proper labels and error messages
- Navigation is keyboard accessible
- Screen reader compatibility
- Consistent spacing system (8px grid)
- Consistent color palette usage

## 2. Security Agent
**Responsibilities:**
- Authentication implementation (JWT, sessions)
- Authorization and role-based access
- Input sanitization and validation
- XSS prevention (Content Security Policy)
- CSRF token implementation
- SQL injection prevention
- Secure API endpoints
- Data encryption at rest and in transit
- Environment variable management
- Dependency vulnerability scanning

**Review Criteria:**
- No hardcoded secrets or API keys
- All user inputs are validated and sanitized
- Proper CORS configuration
- Secure headers implemented
- Rate limiting on APIs
- Audit logs for sensitive operations

## 3. SEO Agent
**Responsibilities:**
- Meta tags (title, description, OG tags)
- Structured data (JSON-LD)
- XML sitemap generation
- Robots.txt configuration
- Page load performance (Core Web Vitals)
- Image optimization and lazy loading
- Proper heading hierarchy
- Internal linking structure
- URL structure and permalinks
- Mobile-first indexing compliance

**Review Criteria:**
- All pages have unique meta titles/descriptions
- Images have alt text
- Pages load under 3 seconds
- Proper use of canonical URLs
- Schema markup for recipes/nutrition
- Clean URL structure

## 4. Code Quality Agent
**Responsibilities:**
- ESLint/Prettier configuration
- TypeScript strict mode enforcement
- Naming conventions (files, variables, functions)
- Code duplication detection
- Complexity metrics (cyclomatic complexity)
- Import organization
- Dead code elimination
- Console.log removal
- Comment quality
- Git commit message standards

**Review Criteria:**
- No linting errors or warnings
- Type coverage > 95%
- Functions under 50 lines
- Files under 300 lines
- DRY principle adherence
- Meaningful variable names

## 5. Architecture Agent
**Responsibilities:**
- Folder structure enforcement
- Module boundaries and dependencies
- Design pattern implementation
- State management architecture
- API design (REST/GraphQL)
- Database schema design
- Caching strategy
- Service layer abstraction
- Component composition patterns
- Build configuration

**Review Criteria:**
- Clear separation of concerns
- No circular dependencies
- Consistent file organization
- Proper use of design patterns
- API follows REST principles
- Database normalized to 3NF

## 6. Performance Agent
**Responsibilities:**
- Bundle size optimization
- Code splitting strategy
- Lazy loading implementation
- Image optimization (WebP, AVIF)
- Caching headers
- CDN configuration
- Database query optimization
- API response time monitoring
- Memory leak detection
- Virtual scrolling for large lists

**Review Criteria:**
- Bundle size < 200KB (initial)
- Time to Interactive < 3.5s
- First Contentful Paint < 1.5s
- No memory leaks
- Efficient re-renders
- Optimized database queries

## 7. Testing Agent
**Responsibilities:**
- Unit test coverage
- Integration test suite
- E2E test scenarios
- Test data management
- Mock implementation
- Snapshot testing
- Performance testing
- Accessibility testing
- Security testing
- Load testing

**Review Criteria:**
- Code coverage > 80%
- All critical paths tested
- E2E tests for user journeys
- Tests run in < 5 minutes
- No flaky tests
- Proper test isolation

## 8. File Tracker Agent
**Responsibilities:**
- Maintain file registry (all project files)
- Track file modifications (who, when, what)
- Update sitemap.xml automatically
- Generate file dependency graph
- Track file sizes and growth
- Document file purposes
- Monitor for orphaned files
- Track file relationships
- Version history logging
- Change impact analysis

**File Registry Format:**
```json
{
  "filepath": "/src/components/MealCard.tsx",
  "created": "2024-01-15T10:30:00Z",
  "modified": "2024-01-15T14:45:00Z",
  "size": 3456,
  "type": "component",
  "description": "Draggable meal card component",
  "dependencies": ["React", "dnd-kit"],
  "usedBy": ["MealBoard.tsx", "FoodLibrary.tsx"],
  "changelog": [
    {
      "date": "2024-01-15T14:45:00Z",
      "change": "Added swap functionality",
      "author": "UI Agent"
    }
  ]
}
```

## 9. Documentation Agent
**Responsibilities:**
- README.md maintenance
- API documentation
- Component documentation
- JSDoc/TSDoc comments
- Architecture Decision Records (ADRs)
- User guides
- Developer onboarding docs
- Changelog maintenance
- Configuration documentation
- Deployment guides

**Review Criteria:**
- All public APIs documented
- README has setup instructions
- Complex functions have comments
- ADRs for major decisions
- Examples for all components
- Up-to-date dependencies list

## 10. Analytics Agent
**Responsibilities:**
- User event tracking
- Conversion funnel monitoring
- Error tracking (Sentry/LogRocket)
- Performance metrics collection
- A/B test implementation
- User session recording
- Custom event definitions
- Dashboard creation
- Alert configuration
- Privacy compliance (GDPR)

**Review Criteria:**
- Key user actions tracked
- Error rate < 1%
- Conversion metrics defined
- No PII in analytics
- Consent management implemented
- Real-time alerts configured

## 11. Data Validation Agent
**Responsibilities:**
- Nutrition data accuracy
- Serving size validation
- Macro calculation verification
- Cost calculation accuracy
- Recipe scaling logic
- Unit conversion accuracy
- Barcode data validation
- User input validation
- API response validation
- Database constraint enforcement

**Review Criteria:**
- Macros sum correctly
- Costs calculate accurately
- Units convert properly
- No impossible values
- Consistent decimal precision
- Proper null handling

## 12. Recipe/Meal Agent
**Responsibilities:**
- Meal composition rules
- Macro aggregation logic
- Portion size management
- Recipe scaling algorithms
- Substitution compatibility
- Meal planning constraints
- Nutritional balance checking
- Meal variety tracking
- Prep time calculations
- Dietary restriction handling

**Review Criteria:**
- Accurate macro totals
- Valid substitutions only
- Portion sizes realistic
- Scaling maintains ratios
- Dietary tags accurate
- Balanced meal suggestions

## 13. Shopping List Agent
**Responsibilities:**
- Ingredient aggregation
- Quantity consolidation
- Unit standardization
- Store section grouping
- Price estimation
- Inventory tracking
- Expiration date tracking
- Shopping history
- Bulk buying optimization
- Store preference handling

**Review Criteria:**
- Quantities combine correctly
- Units standardized
- No duplicate items
- Logical grouping
- Accurate totals
- Efficient list order

## 14. Deployment Agent
**Responsibilities:**
- CI/CD pipeline setup
- Build optimization
- Environment configuration
- Secret management
- Database migrations
- Rollback procedures
- Health checks
- Monitoring setup
- Auto-scaling configuration
- CDN deployment

**Review Criteria:**
- Zero-downtime deployments
- Automated testing in pipeline
- Environment parity
- Rollback < 5 minutes
- Health checks passing
- Secrets properly managed

## 15. Monitoring Agent
**Responsibilities:**
- Application performance monitoring
- Error rate tracking
- Uptime monitoring
- API latency tracking
- Database performance
- User experience metrics
- Resource utilization
- Cost monitoring
- Alert configuration
- Incident response

**Review Criteria:**
- 99.9% uptime SLA
- Error rate < 0.1%
- P95 latency < 500ms
- Alerts properly configured
- Dashboards comprehensive
- Logs properly structured

## Agent Communication Protocol

### Inter-Agent Messages
```typescript
interface AgentMessage {
  from: AgentType;
  to: AgentType | AgentType[];
  timestamp: Date;
  type: 'request' | 'response' | 'notification' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'critical';
  subject: string;
  body: any;
  requiresResponse: boolean;
  responseDeadline?: Date;
}
```

### Agent Coordination Rules
1. **File Changes:** File Tracker Agent must be notified of all file changes
2. **Security Issues:** Security Agent has veto power on deployments
3. **Performance Degradation:** Performance Agent can block releases
4. **Test Failures:** Testing Agent can block merges
5. **Documentation:** Documentation Agent reviews all public API changes

### Daily Agent Reports
Each agent generates a daily status report including:
- Tasks completed
- Issues found
- Recommendations
- Metrics/KPIs
- Upcoming concerns

### Conflict Resolution
When agents disagree:
1. Security Agent has highest priority
2. Testing Agent has second priority
3. Performance Agent has third priority
4. Other agents negotiate based on user-defined priorities

## Implementation Notes

Each agent should be implemented as a separate module with:
- Clear interfaces
- Event-driven communication
- Logging capabilities
- Configuration options
- Health check endpoints
- Graceful degradation
- Rate limiting
- Retry logic

Agents should be able to run:
- On file save (watch mode)
- On git commit (pre-commit hooks)
- On pull request (CI/CD)
- On schedule (cron jobs)
- On demand (manual trigger)