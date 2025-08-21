// Unit conversion service for recipe measurements
import { unitConversions, INPUT_CONSTRAINTS } from '../utils/constants.js';

export class UnitConverter {
    /**
     * Convert a quantity from one unit to another
     * @param {number} quantity - The quantity to convert
     * @param {string} fromUnit - The unit to convert from
     * @param {string} toUnit - The unit to convert to
     * @returns {number} The converted quantity
     */
    static convert(quantity, fromUnit, toUnit) {
        if (fromUnit === toUnit) return quantity;
        
        // Direct conversion if available
        if (unitConversions[fromUnit] && unitConversions[fromUnit][toUnit]) {
            return quantity * unitConversions[fromUnit][toUnit];
        }
        
        // Try reverse conversion
        if (unitConversions[toUnit] && unitConversions[toUnit][fromUnit]) {
            return quantity / unitConversions[toUnit][fromUnit];
        }
        
        // Try two-step conversion through a common unit (grams for weight, ml for volume)
        const weightUnits = ['g', 'oz', 'lb', 'kg'];
        const volumeUnits = ['cup', 'tbsp', 'tsp', 'ml', 'fl oz'];
        
        if (weightUnits.includes(fromUnit) && weightUnits.includes(toUnit)) {
            // Convert through grams
            const inGrams = this.convert(quantity, fromUnit, 'g');
            return this.convert(inGrams, 'g', toUnit);
        }
        
        if (volumeUnits.includes(fromUnit) && volumeUnits.includes(toUnit)) {
            // Convert through ml
            const inMl = this.convert(quantity, fromUnit, 'ml');
            return this.convert(inMl, 'ml', toUnit);
        }
        
        // No conversion available, return original quantity
        console.warn(`No conversion available from ${fromUnit} to ${toUnit}`);
        return quantity;
    }
    
    /**
     * Get available units for conversion based on base unit
     * @param {string} baseUnit - The base unit
     * @returns {Array<string>} Array of available units
     */
    static getAvailableUnits(baseUnit) {
        const weightUnits = ['g', 'oz', 'lb', 'kg'];
        const volumeUnits = ['cup', 'tbsp', 'tsp', 'ml', 'fl oz'];
        const countUnits = ['unit', 'small', 'medium', 'large', 'slice', 'piece', 'bar'];
        
        // For weight units, also include cup for common cooking conversions
        if (weightUnits.includes(baseUnit)) {
            return [...weightUnits, 'cup'];
        }
        
        if (volumeUnits.includes(baseUnit)) {
            return volumeUnits;
        }
        
        if (countUnits.includes(baseUnit)) {
            // Only return compatible count units
            if (['small', 'medium', 'large'].includes(baseUnit)) {
                return ['small', 'medium', 'large'];
            }
            return [baseUnit]; // Other count units don't convert
        }
        
        return [baseUnit];
    }
    
    /**
     * Get the step size for input fields based on unit
     * @param {string} unit - The unit
     * @returns {number} Step size for input
     */
    static getStepSize(unit) {
        return INPUT_CONSTRAINTS.stepSizes[unit] || 1;
    }
    
    /**
     * Get the minimum value for input fields based on unit
     * @param {string} unit - The unit
     * @returns {number} Minimum value for input
     */
    static getMinValue(unit) {
        // Special handling for certain units
        if (unit === 'cup' || unit === 'tbsp' || unit === 'tsp') {
            return this.getStepSize(unit);
        }
        return INPUT_CONSTRAINTS.minQuantity;
    }
    
    /**
     * Format a quantity for display based on unit
     * @param {number} quantity - The quantity to format
     * @param {string} unit - The unit
     * @returns {string} Formatted quantity string
     */
    static formatQuantity(quantity, unit) {
        // For whole number units, don't show decimals unless needed
        const countUnits = ['unit', 'slice', 'piece', 'bar', 'small', 'medium', 'large'];
        
        if (countUnits.includes(unit)) {
            return quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(1);
        }
        
        // For cup measurements, use fractions
        if (unit === 'cup') {
            return this.toFraction(quantity);
        }
        
        // For very small quantities, use 2 decimal places
        if (quantity < 1) {
            return quantity.toFixed(2);
        }
        
        // For larger quantities, use 1 decimal place if needed
        return quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(1);
    }
    
    /**
     * Convert decimal to fraction for display (mainly for cups)
     * @param {number} decimal - The decimal value
     * @returns {string} Fraction representation
     */
    static toFraction(decimal) {
        const fractions = [
            { value: 0.125, display: '1/8' },
            { value: 0.25, display: '1/4' },
            { value: 0.333, display: '1/3' },
            { value: 0.375, display: '3/8' },
            { value: 0.5, display: '1/2' },
            { value: 0.625, display: '5/8' },
            { value: 0.667, display: '2/3' },
            { value: 0.75, display: '3/4' },
            { value: 0.875, display: '7/8' }
        ];
        
        const whole = Math.floor(decimal);
        const remainder = decimal - whole;
        
        if (remainder === 0) {
            return whole.toString();
        }
        
        // Find closest fraction
        let closest = fractions[0];
        let minDiff = Math.abs(remainder - fractions[0].value);
        
        for (const fraction of fractions) {
            const diff = Math.abs(remainder - fraction.value);
            if (diff < minDiff) {
                minDiff = diff;
                closest = fraction;
            }
        }
        
        // If difference is too large, just show decimal
        if (minDiff > 0.05) {
            return decimal.toFixed(2);
        }
        
        return whole > 0 ? `${whole} ${closest.display}` : closest.display;
    }
    
    /**
     * Parse a quantity string that might contain fractions
     * @param {string} input - The input string
     * @returns {number} The parsed quantity
     */
    static parseQuantity(input) {
        if (!input || typeof input !== 'string') {
            return parseFloat(input) || 0;
        }
        
        // Handle mixed numbers like "1 1/2"
        const mixedMatch = input.match(/^(\d+)\s+(\d+)\/(\d+)$/);
        if (mixedMatch) {
            const whole = parseInt(mixedMatch[1]);
            const numerator = parseInt(mixedMatch[2]);
            const denominator = parseInt(mixedMatch[3]);
            return whole + (numerator / denominator);
        }
        
        // Handle fractions like "1/2"
        const fractionMatch = input.match(/^(\d+)\/(\d+)$/);
        if (fractionMatch) {
            const numerator = parseInt(fractionMatch[1]);
            const denominator = parseInt(fractionMatch[2]);
            return numerator / denominator;
        }
        
        // Regular number
        return parseFloat(input) || 0;
    }
    
    /**
     * Check if two units are compatible for conversion
     * @param {string} unit1 - First unit
     * @param {string} unit2 - Second unit
     * @returns {boolean} Whether the units can be converted
     */
    static areUnitsCompatible(unit1, unit2) {
        if (unit1 === unit2) return true;
        
        const weightUnits = ['g', 'oz', 'lb', 'kg', 'cup']; // Cup included for cooking
        const volumeUnits = ['cup', 'tbsp', 'tsp', 'ml', 'fl oz'];
        const sizeUnits = ['small', 'medium', 'large'];
        
        // Check if both units are in the same category
        if (weightUnits.includes(unit1) && weightUnits.includes(unit2)) return true;
        if (volumeUnits.includes(unit1) && volumeUnits.includes(unit2)) return true;
        if (sizeUnits.includes(unit1) && sizeUnits.includes(unit2)) return true;
        
        return false;
    }
    
    /**
     * Get unit category (weight, volume, count)
     * @param {string} unit - The unit
     * @returns {string} The category
     */
    static getUnitCategory(unit) {
        const weightUnits = ['g', 'oz', 'lb', 'kg'];
        const volumeUnits = ['cup', 'tbsp', 'tsp', 'ml', 'fl oz'];
        const sizeUnits = ['small', 'medium', 'large'];
        const countUnits = ['unit', 'slice', 'piece', 'bar'];
        
        if (weightUnits.includes(unit)) return 'weight';
        if (volumeUnits.includes(unit)) return 'volume';
        if (sizeUnits.includes(unit)) return 'size';
        if (countUnits.includes(unit)) return 'count';
        
        return 'other';
    }
}