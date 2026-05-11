# Changelog

All notable changes to the MERN Fullstack Starter Kit CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Interactive prompt support for `fsk generate page --with-form --interactive` to guide users through form field creation
- Unified resource generator (`fsk make resource`) for end-to-end module + page generation
- Select/dropdown field type with options array support in forms
- Boolean checkbox field with proper UI handling
- Hidden field type for internal state management
- Color picker, date/time pickers, file upload fields in form generator
- Range slider with live value display
- Zod schema generation option for type-safe frontend validation
- Auto-API wiring when generating pages with forms (optional)
- Rich text (WYSIWYG) field support with maxLength detection
- Array/tags field support for multi-select scenarios
- Relationship/foreign key field support with dropdown population
- Edit mode for forms with data pre-population
- Pagination controls in generated table/list views
- Enhanced validation messages with field labels
- Multi-language/i18n stub support in forms
- **Cleanup command** (`fsk cleanup`) with presets: minimal, production, template
- **Form display modes**: `--form-mode modal|sidepanel|inline|page` for flexible UI layouts
- **Radix UI Dialog & Sheet primitives** for modal and sidepanel form overlays
- **Form `onSuccess` callback** enabling automatic modal/sheet dismissal after submission
- **Strict form validation**: `=== undefined || === null || === ''` checks to correctly handle `0` and `false` values
- **Number field**: default value `0`, with min/max validation
- **Boolean field**: default value `false`, rendered as checkbox with `checked` handling
- **Input sanitization utilities** (`@/utils/sanitize`) for email, URL, phone, text, number, boolean
- `--form-mode` option on `fsk generate module --with-page` to control generated page layout

### Changed
- **Fixed**: Navigation entry template literals now properly interpolate values instead of writing `${...}` literally
- **Fixed**: Router insertion template literals now properly interpolate values
- **Fixed**: Import path for `parseFieldSpec` in module.js corrected from `../utils/fieldValidators.js` to `../../utils/fieldValidators.js`
- **Fixed**: Validators directory is now created before writing validator files (prevents ENOENT errors)
- **Fixed**: Empty optional fields array in validator schemas now generates `[]` instead of `[""]`
- **Added**: `getConfigPaths()` function to page.js for dynamic frontend/backend directory detection
- Enhanced form validation to include email format, URL format, and phone format checks
- Improved error messages with more context and resolution hints
- Updated Joi validators to use proper type-specific rules (email, url, phone patterns)
- Mongoose schemas now include virtuals and transform options for cleaner JSON output

### Deprecated
- Manual field specification via `--form-fields` string (use `--interactive` for better experience)
- Direct `fsk generate module` without `--with-page` for full-stack features (use `fsk make resource`)

### Removed
- None

### Fixed
- Navigation entries in app-preset.js now correctly parse and update existing arrays
- Route insertion no longer breaks when wildcard 404 route is missing
- Form sanitization now properly handles all field types
- Backend validators correctly handle optional vs required fields
- Frontend forms now include proper loading states and error toasts

### Security
- Enhanced XSS prevention with stricter HTML sanitization on all text/textarea inputs
- Phone number validation enforces E.164 format
- Email validation uses RFC-compliant regex
- URL validation enforces http/https protocol
- CSRF token support added to generated forms
- Rate limiting middleware stub added to generated modules

## [0.2.0-alpha] - 2026-05-06

### Added
- **Unified Resource Generator** (`fsk make resource`) - Generate backend module + frontend page in one command
- **Field Definition System** - Type-safe field specifications with validation rules
- **Template Loader** - 3-tier hierarchy (project, user, built-in) for customizable templates
- **Marker Strategy** - Safe regeneration that preserves custom code
- **Generator Engine** - Core engine with dry-run, force, verbose options
- **Backend Templates** - Model, service, controller, routes, validator, test generators
- **Interactive Prompts** - Guided CLI experience for module and page generation
- **Form Field System** - Complete form generation with validation and sanitization
- **Architecture Levels** - Lightweight, moderate, advanced generation modes
- **Joi Validators** - Backend validation schemas auto-generated from field specs
- **Input Sanitization** - Email, URL, phone, text sanitization utilities
- **Pagination** - Built into all generated list endpoints
- **Role-based Access** - Admin-only routes for delete operations
- **Deployment Configs** - Docker, Vercel, Railway configuration generation
- **Test Scaffolds** - Jest/Supertest test templates for advanced modules

### Changed
- Module generator now supports `--fields` specification for custom field definitions
- Page generator supports `--with-form` flag for automatic form generation
- All generated forms include real-time validation and error handling
- Backend models include timestamps, virtuals, and transform options
- Controllers use standardized API response format
- Routes support pagination and query filtering

### Fixed
- Module route mounting correctly handles existing routes/index.js
- Form field parsing handles edge cases (empty values, special characters)
- Validator generation correctly handles optional fields

## [0.1.0] - 2026-05-05

### Added
- Initial CLI release with `init` and `generate` commands
- Project scaffolding from template repository
- Basic module generation (lightweight mode)
- Basic page generation
- Theme import functionality
- Deployment configuration generation
- Resource removal commands

### Structure
- `fsk init <name>` - Scaffold new project
- `fsk generate module <name>` - Create backend module
- `fsk generate page <name>` - Create frontend page
- `fsk generate theme` - Import shadcn theme
- `fsk generate deploy` - Generate deployment configs
- `fsk remove <type> <name>` - Remove resources

## [Unreleased] - Known Limitations & Future Work

### Missing Features (Planned)
- [ ] GraphQL API generation alongside REST
- [ ] WebSocket/Socket.io integration for real-time features
- [ ] File upload service abstraction (S3, Cloudinary)
- [ ] Multi-tenant support
- [ ] Audit logging system
- [ ] Soft delete pattern implementation
- [ ] API versioning strategy
- [ ] Rate limiting configuration
- [ ] Caching layer (Redis) integration
- [ ] Queue system (Bull/BullMQ) for background jobs

### Improvements Needed
- [ ] Better TypeScript support in generated code
- [ ] More field types (UUID, JSON, Array, Enum)
- [ ] Advanced relationship handling (many-to-many, nested)
- [ ] Dashboard widget system for generated pages
- [ ] Export functionality (CSV, PDF, Excel)
- [ ] Import functionality with validation
- [ ] Search/filter builder UI
- [ ] Sort builder UI
- [ ] Bulk edit operations
- [ ] Activity log system

### Known Issues
- [ ] Pagination metadata could include more details (total pages, hasNext, hasPrev)
- [ ] Soft delete pattern not yet implemented (only hard delete)
- [ ] Unique constraint enforcement at DB level needs index creation
- [ ] File upload fields need actual upload handler implementation
- [ ] i18n is stubbed but not fully implemented

## Support

For issues, questions, or contributions, please refer to the project repository.

## License

MIT License - see LICENSE file for details.
