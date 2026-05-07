/**
 * MarkerStrategy — preserves custom code during regeneration
 * 
 * Generated files are split into regions:
 *   [Prelude]   — everything before AUTO-GENERATED marker (imports, license, etc)
 *   [AutoBlock] — the generated code (replaced on regeneration)
 *   [Custom]    — developer's custom edits (preserved forever)
 *   [Epilogue]  — everything after END marker (module.exports, etc if outside markers)
 */

const MARKERS = {
  // Matches the entire auto-generated block including header/footer
  block: /^(\/\/ ═+ AUTO-GENERATED[\s\S]*?\/\/ ═+)\s*$/m,
  
  // Extract just the content between the dashed lines
  autoContent: /^\/\/ ═+ AUTO-GENERATED — DO NOT EDIT MANUALLY\s*[\r\n]+(?:\/\/ .*\s*)*\/\/ ═+\s*[\r\n]+([\s\S]*?)\s*[\r\n]+\/\/ ═+ END AUTO-GENERATED\s*$/m,
  
  // Custom code zone marker
  customZone: /\/\/ ✎ CUSTOM CODE ZONE[\s\S]*?\/\/ ─+[\s\S]*?$/m,
};

export class MarkerStrategy {
  /**
   * Parse a file into sections
   * @returns {Object} { hasMarkers, prelude, autoBlock, customBlock, epilogue }
   */
  static parse(content) {
    const blockMatch = content.match(MARKERS.block);
    
    if (!blockMatch) {
      // No markers — entire file is custom (first-time generation)
      return { hasMarkers: false, full: content };
    }

    const fullBlock = blockMatch[0];
    const blockStart = blockMatch.index;
    const blockEnd = blockStart + fullBlock.length;

    // Extract auto content (between dashed lines)
    const autoContentMatch = fullBlock.match(MARKERS.autoContent);
    const autoBlock = autoContentMatch ? autoContentMatch[1].trim() : fullBlock;

    // Look for custom zone within auto block (if regenerating once)
    let customBlock = '';
    const customMatch = fullBlock.match(MARKERS.customZone);
    if (customMatch) {
      customBlock = customMatch[0];
    }

    return {
      hasMarkers: true,
      prelude: content.slice(0, blockStart),
      autoBlock,
      customBlock,
      epilogue: content.slice(blockEnd),
      fullBlock, // the entire matched block including markers
    };
  }

  /**
   * Compose new file content by replacing auto block only
   */
  static compose(parsed, newAutoBlock) {
    if (!parsed.hasMarkers) {
      // First generation: wrap entire content
      return MarkerStrategy.wrapWithMarkers(newAutoBlock);
    }

    // Reconstruct the full marker block with new auto content
    const timestamp = new Date().toISOString();
    const header = `// ═══════════════════════════════════════════════════════════════════════════
// AUTO-GENERATED — DO NOT EDIT MANUALLY
// Generated at: ${timestamp}
// ═══════════════════════════════════════════════════════════════════════════`;
    
    const footer = `// ═══════════════════════════════════════════════════════════════════════════
// END AUTO-GENERATED
// ═══════════════════════════════════════════════════════════════════════════`;

    const autoSection = `${header}\n\n${newAutoBlock}\n\n${footer}`;

    // If there's existing custom code, append it
    const customNote = parsed.customBlock 
      ? `\n\n${parsed.customBlock}\n`
      : '\n\n// ✎ CUSTOM CODE ZONE — YOUR CODE HERE\n// Add custom logic below. This section is preserved during regeneration.\n// ────────────────────────────────────────────────────────────────────────────\n';

    return parsed.prelude + autoSection + customNote + parsed.epilogue;
  }

  /**
   * Create initial wrapped content for new file
   */
  static wrapWithMarkers(autoContent, resourceName = '') {
    const timestamp = new Date().toISOString();
    return `// ═══════════════════════════════════════════════════════════════════════════
// AUTO-GENERATED — DO NOT EDIT MANUALLY
// Resource: ${resourceName}
// Generated at: ${timestamp}
// ═══════════════════════════════════════════════════════════════════════════

${autoContent}

// ═══════════════════════════════════════════════════════════════════════════
// END AUTO-GENERATED
// ═══════════════════════════════════════════════════════════════════════════`;
  }

  /**
   * Ensure file has markers; if not, add them (for first-time regen)
   */
  static ensureMarkers(content, resourceName) {
    if (MARKERS.block.test(content)) {
      return content; // already has markers
    }
    return MarkerStrategy.wrapWithMarkers(content, resourceName);
  }

  /**
   * Extract just the auto block from existing file (for comparison)
   */
  static extractAutoBlock(content) {
    const parsed = MarkerStrategy.parse(content);
    return parsed.hasMarkers ? parsed.autoBlock : content;
  }
}
