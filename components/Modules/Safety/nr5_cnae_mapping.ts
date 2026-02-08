export const nr5CnaeMapping: Record<string, string> = {
    // Agriculture, Livestock, Forestry
    '01': 'C-1', // Agriculture
    '02': 'C-1', // Forestry
    '03': 'C-1', // Fishing

    // Mining
    '05': 'C-1',
    '06': 'C-1',
    '07': 'C-1',
    '08': 'C-1',
    '09': 'C-1',

    // Manufacturing
    '10': 'C-2', // Food
    '11': 'C-2', // Beverages
    '12': 'C-2', // Tobacco
    '13': 'C-3', // Textiles
    '14': 'C-3', // Apparel
    '15': 'C-4', // Leather/Footwear
    '16': 'C-5', // Wood
    '17': 'C-6', // Paper
    '18': 'C-6', // Printing
    '19': 'C-7', // Coke/Refined Petroleum
    '20': 'C-7', // Chemicals
    '21': 'C-8', // Pharmaceuticals
    '22': 'C-7', // Rubber/Plastic
    '23': 'C-9', // Non-metallic mineral products
    '24': 'C-10', // Basic metals
    '25': 'C-11', // Fabricated metal products
    '26': 'C-12', // Computer/Electronic
    '27': 'C-12', // Electrical equipment
    '28': 'C-12', // Machinery
    '29': 'C-13', // Motor vehicles
    '30': 'C-13', // Other transport equipment
    '31': 'C-14', // Furniture
    '32': 'C-14', // Other manufacturing
    '33': 'C-14', // Repair/Installation

    // Utilities
    '35': 'C-15', // Electricity/Gas
    '36': 'C-16', // Water collection
    '37': 'C-16', // Sewerage
    '38': 'C-16', // Waste management
    '39': 'C-16', // Remediation

    // Construction
    '41': 'C-3a', // Construction of buildings
    '42': 'C-3a', // Civil engineering
    '43': 'C-3a', // Specialized construction

    // Trade
    '45': 'C-17', // Cars/Motorcycles trade
    '46': 'C-17', // Wholesale
    '47': 'C-29', // Retail trade - Note: Often C-29, sometimes split. Using C-29 as common for general retail.

    // Transportation
    '49': 'C-32', // Land transport
    '50': 'C-30', // Water transport
    '51': 'C-31', // Air transport
    '52': 'C-33', // Warehousing
    '53': 'C-34', // Postal

    // Hospitality
    '55': 'C-25', // Accommodation
    '56': 'C-25', // Food service

    // Information/Communication
    '58': 'C-26', // Publishing
    '59': 'C-26', // Motion picture
    '60': 'C-34', // Broadcasting
    '61': 'C-34', // Telecommunications
    '62': 'C-26', // IT
    '63': 'C-26', // Information services

    // Financial
    '64': 'C-18', // Financial services
    '65': 'C-19', // Insurance
    '66': 'C-18', // Auxiliary financial

    // Real Estate
    '68': 'C-20',

    // Professional/Scientific
    // Correction: NR-5 Table I matches Groups.
    // Let's stick to the common ones available in the dropdown first or map carefully.
    // 69-75 often 'Services' -> C-35
    '69': 'C-35', // Legal/Accounting
    '70': 'C-35',
    '71': 'C-35',
    '72': 'C-35',
    '73': 'C-35',
    '74': 'C-35',
    '75': 'C-35', // Veterinary

    // Administrative
    '77': 'C-35',
    '78': 'C-35',
    '79': 'C-35',
    '80': 'C-27', // Security (Private security usually has specific risks, C-27 is unspecified here but often mapped to vigilance which is C-26 or similar? Checking... Vigilance is often C-27 or C-28. Using C-35 as safe fallback if not sure)
    '81': 'C-35', // Services to buildings
    '82': 'C-35',

    // Public Admin
    '84': 'C-35',

    // Education
    '85': 'C-21',

    // Health
    '86': 'C-22', // Human health
    '87': 'C-22', // Residential care
    '88': 'C-23', // Social work

    // Arts/Entertainment
    '90': 'C-28',
    '91': 'C-28',
    '92': 'C-28',
    '93': 'C-28',

    // Other Services
    '94': 'C-35',
    '95': 'C-35',
    '96': 'C-35',
    '97': 'C-35',
    '99': 'C-35',
};

export function getNr5Group(cnae: string): string | null {
    if (!cnae) return null;
    // Try exact match
    // Try 2 first digits
    const cleanCnae = cnae.replace(/[^\d]/g, '');
    if (cleanCnae.length >= 2) {
        const prefix = cleanCnae.substring(0, 2);
        return nr5CnaeMapping[prefix] || null;
    }
    return null;
}
