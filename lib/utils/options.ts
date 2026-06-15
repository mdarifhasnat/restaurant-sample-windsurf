/**
 * Parse and format product options from JSON string to human-readable format
 * @param optionsJson - JSON string containing options (e.g., {"size":["small"],"options":["standard"]})
 * @returns Formatted string with options (e.g., "Size: Small, Option: Standard") or empty string if parsing fails
 */
export function formatSelectedOptions(optionsJson: string | null | undefined): string {
  if (!optionsJson) {
    return '';
  }

  try {
    const options = JSON.parse(optionsJson);
    
    if (!options || typeof options !== 'object') {
      return '';
    }

    const formattedOptions: string[] = [];
    
    for (const [key, value] of Object.entries(options)) {
      // Capitalize the first letter of the key
      const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
      
      // Handle array values (e.g., ["small"]) and string values
      let formattedValue: string;
      if (Array.isArray(value)) {
        formattedValue = value
          .map((v) => {
            // Capitalize first letter of each value
            return typeof v === 'string' 
              ? v.charAt(0).toUpperCase() + v.slice(1) 
              : String(v);
          })
          .join(', ');
      } else {
        formattedValue = typeof value === 'string'
          ? value.charAt(0).toUpperCase() + value.slice(1)
          : String(value);
      }
      
      formattedOptions.push(`${formattedKey}: ${formattedValue}`);
    }

    return formattedOptions.join(', ');
  } catch (error) {
    // If parsing fails, return empty string to hide invalid JSON
    console.error('Failed to parse product options:', error);
    return '';
  }
}

/**
 * Parse product options from JSON string to object
 * @param optionsJson - JSON string containing options
 * @returns Parsed object or null if parsing fails
 */
export function parseProductOptions(optionsJson: string | null | undefined): Record<string, any> | null {
  if (!optionsJson) {
    return null;
  }

  try {
    const options = JSON.parse(optionsJson);
    return options && typeof options === 'object' ? options : null;
  } catch (error) {
    console.error('Failed to parse product options:', error);
    return null;
  }
}
