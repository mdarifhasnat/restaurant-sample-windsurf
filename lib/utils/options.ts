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
 * Format option snapshot (human-readable format) to display string
 * @param optionSnapshot - Object containing option groups and values snapshot
 * @returns Formatted string with options or empty string if parsing fails
 */
export function formatOptionSnapshot(optionSnapshot: any): string {
  if (!optionSnapshot || typeof optionSnapshot !== 'object') {
    return '';
  }

  try {
    const formattedOptions: string[] = [];
    
    for (const group of Object.values(optionSnapshot)) {
      if (!group || typeof group !== 'object') continue;
      
      const groupObj = group as any;
      const groupName = groupObj.groupNameDe || groupObj.groupName || '';
      const values = groupObj.values || [];
      
      if (!groupName || !Array.isArray(values) || values.length === 0) continue;
      
      const valueNames = values
        .map((v: any) => {
          const name = v.valueNameDe || v.valueName || '';
          const extraPrice = v.extraPrice || 0;
          return extraPrice > 0 ? `${name} (+${extraPrice.toFixed(2)}€)` : name;
        })
        .join(', ');
      
      if (valueNames) {
        formattedOptions.push(`${groupName}: ${valueNames}`);
      }
    }

    return formattedOptions.join('\n');
  } catch (error) {
    console.error('Failed to format option snapshot:', error);
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
