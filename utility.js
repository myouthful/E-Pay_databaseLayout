const generateAccountNumber = (bankName) => {
    // Bank prefix mapping (first 3 digits)
    const bankPrefixes = {
        'access': '044',
        'gtbank': '058',
        'zenith': '057',
        'uba': '033',
        'firstbank': '011',
        'union': '032',
        'sterling': '232',
        'polaris': '076',
        'e-pay': '777'    // Added e-pay with a unique prefix
    };

    // Get bank prefix or use default '000' if bank not found
    const prefix = bankPrefixes[bankName.toLowerCase()] || '000';
    
    // Generate 7 random digits for the remaining part
    const randomPart = Math.floor(Math.random() * 10000000)
        .toString()
        .padStart(7, '0');

    // Combine prefix and random part
    const accountNumber = `${prefix}${randomPart}`;
    
    return accountNumber;
};

// Example usage:
// const accNum = generateAccountNumber('e-pay'); // Returns something like: 7771234567


const getBankPrefix = (bankName) => {
    const bankPrefixes = {
        'access': '044',
        'gtbank': '058',
        'zenith': '057',
        'uba': '033',
        'firstbank': '011',
        'union': '032',
        'sterling': '232',
        'polaris': '076',
        'e-pay': '777'
    };

    // Convert bank name to lowercase and check if it exists in bankPrefixes
    const normalizedBankName = bankName.toLowerCase();
    return bankPrefixes[normalizedBankName] || null;
};

// Add to exports
module.exports = {
    generateAccountNumber,
    getBankPrefix
};


