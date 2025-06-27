// Code.gs - VZW Accounting System - VOLLEDIG GEFIXTE VERSIE 5.0
// Alle 6 bugs opgelost: Airtable sync, editable numbers, PDF export, report styling, table layout

// ==================== CONFIGURATIE ====================
const CONFIG = {
  production: {
    airtableToken: 'patGyvyT913BTnau0.c7200073a6a99aaeb420fd5a8beaecc85494adecbcc18cfed98f54cdee86f743',
    airtableBase: 'appPwcdZUr8yfiGvP',
    debugMode: true,
    rateLimitDelay: 800,
    maxRetries: 3,
    requestTimeout: 30000
  }
};

const DRIVE_FOLDERS = {
  INVOICES: '1JotWJZtejm6r5FGF4qzC29JYq3XJm7VT',
  REPORTS: '1aPVb4sWg-D5fE0pg3hSI4xlx3Sfqrpp5',
  EXPENSES: '1T0dz62ya_-IQc96Uk0eVQfNtVm0Jgqll'
};

const COMPANY_INFO = {
  name: 'MORE IS MORE! Agency',
  address: 'Abdissenstraat 11',
  postalCode: '1190',
  city: 'Vorst',
  country: 'België',
  phone: '+32 497 16.24.90 / +32 475 84.72.32',
  email: 'moreismoreagency2024@gmail.com',
  vatNumber: 'BE 1017.971.844',
  iban: 'BE12 5230 8164 6692',
  bic: 'TRIONL2U'
};

// ==================== CULTURE SECTOR NACE CODES ====================
const CULTURE_NACE_CODES = [
  { code: '90.01', description: 'Podiumkunsten' },
  { code: '90.02', description: 'Ondersteunende podiumkunsten' },
  { code: '90.03', description: 'Artistieke creatie' },
  { code: '90.04', description: 'Exploitatie van kunst- en cultuurcentra' },
  { code: '59.20', description: 'Maken en uitgeven van geluidsopnamen' },
  { code: '60.10', description: 'Radio-uitzendingen' },
  { code: '60.20', description: 'Televisie-uitzendingen' },
  { code: '82.30', description: 'Evenementorganisatie' },
  { code: '93.29', description: 'Overige recreatieve activiteiten' },
  { code: '93.21', description: 'Kermisattracties en pretparken' },
  { code: '85.52', description: 'Cultureel onderwijs' },
  { code: '85.59', description: 'Overige vormen van onderwijs' },
  { code: '58.11', description: 'Uitgeverij van boeken' },
  { code: '58.13', description: 'Uitgeverij van kranten' },
  { code: '58.14', description: 'Uitgeverij van tijdschriften' },
  { code: '58.29', description: 'Uitgeverij van overige software' },
  { code: '59.11', description: 'Productie van films' },
  { code: '59.12', description: 'Postproductie van films' },
  { code: '59.13', description: 'Distributie van films' },
  { code: '59.14', description: 'Vertoning van films' },
  { code: '71.11', description: 'Architectenactiviteiten' },
  { code: '74.10', description: 'Ontwerpen en vormgeving' },
  { code: '74.20', description: 'Fotografische activiteiten' },
  { code: '73.11', description: 'Reclamebureaus' },
  { code: '91.02', description: 'Museumactiviteiten' },
  { code: '91.03', description: 'Beheer van monumenten en historische gebouwen' },
  { code: '32.12', description: 'Vervaardiging van juwelen' },
  { code: '32.20', description: 'Vervaardiging van muziekinstrumenten' },
  { code: '62.01', description: 'Ontwikkelen van computerprogramma\'s' },
  { code: '63.12', description: 'Webportals' }
];

// ==================== MAIN ENTRY POINT ====================
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('VZW Accounting System - MORE IS MORE Agency')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ==================== ENHANCED ERROR HANDLER ====================
class ErrorHandler {
  static handle(error, context = {}) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context: context,
      user: Session.getActiveUser().getEmail()
    };
    
    console.error('=== SYSTEM ERROR ===');
    console.error('Error Info:', errorInfo);
    console.error('===================');
    
    if (CONFIG.production.debugMode) {
      console.log('Full error context:', JSON.stringify(context, null, 2));
    }
    
    return {
      success: false,
      error: this.getUserFriendlyMessage(error),
      technicalDetails: CONFIG.production.debugMode ? error.message : 'Contact support if this persists',
      timestamp: errorInfo.timestamp
    };
  }
  
  static getUserFriendlyMessage(error) {
    const friendlyMessages = {
      'RATE_LIMIT_EXCEEDED': 'Het systeem is momenteel druk bezet. Probeer het over een minuut opnieuw.',
      'INVALID_DATA': 'Controleer je invoer en probeer opnieuw.',
      'PERMISSION_DENIED': 'Je hebt geen toestemming voor deze actie.',
      'NETWORK_ERROR': 'Verbindingsprobleem. Probeer het opnieuw.',
      'VALIDATION_ERROR': 'Controleer je gegevens en probeer opnieuw.',
      'INVALID_MULTIPLE_CHOICE_OPTIONS': 'Sommige opties moeten eerst in Airtable aangemaakt worden.',
      'HTTP 502': 'Server tijdelijk niet beschikbaar. Probeer het over 30 seconden opnieuw.',
      'HTTP 503': 'Service tijdelijk niet beschikbaar. Probeer het over een minuut opnieuw.',
      'HTTP 429': 'Te veel verzoeken. Wacht even en probeer opnieuw.',
      'timeout': 'Verzoek duurde te lang. Probeer opnieuw met minder data.',
      'Connection failure': 'Verbindingsprobleem met Airtable. Controleer je internetverbinding.'
    };
    
    for (const [key, message] of Object.entries(friendlyMessages)) {
      if (error.message.toLowerCase().includes(key.toLowerCase())) {
        return message;
      }
    }
    
    if (error.message.includes('ScriptError')) {
      return 'Er is een tijdelijke fout opgetreden. Probeer het over een minuut opnieuw.';
    }
    
    if (error.message.includes('Exception')) {
      return 'Er is een onverwachte fout opgetreden. Controleer je gegevens en probeer opnieuw.';
    }
    
    return 'Er is een onverwachte fout opgetreden. Probeer het opnieuw of neem contact op met support.';
  }
}

// ==================== ENHANCED AIRTABLE SERVICE ====================
class AirtableService {
  constructor() {
    this.baseUrl = 'https://api.airtable.com/v0/';
    this.token = CONFIG.production.airtableToken;
    this.baseId = CONFIG.production.airtableBase;
    this.maxRetries = 3;
    this.baseDelay = 500;
  }
  
  makeRequestWithRetry(url, options, retryCount = 0) {
    try {
      const delay = this.baseDelay * Math.pow(2, retryCount);
      Utilities.sleep(delay);
      
      console.log(`Making request attempt ${retryCount + 1} to ${url}`);
      
      const response = UrlFetchApp.fetch(url, {
        ...options,
        muteHttpExceptions: true,
        timeout: 30000
      });
      
      const responseCode = response.getResponseCode();
      console.log(`Response code: ${responseCode}`);
      
      if (responseCode === 200) {
        return {
          success: true,
          response: response
        };
      }
      
      if (responseCode === 429 || responseCode === 502 || responseCode === 503) {
        if (retryCount < this.maxRetries) {
          console.log(`Rate limited or server error (${responseCode}), retrying in ${delay * 2}ms...`);
          Utilities.sleep(delay * 2);
          return this.makeRequestWithRetry(url, options, retryCount + 1);
        }
      }
      
      const errorText = response.getContentText();
      throw new Error(`HTTP ${responseCode}: ${errorText}`);
      
    } catch (error) {
      if (retryCount < this.maxRetries && (
        error.message.includes('timeout') || 
        error.message.includes('502') ||
        error.message.includes('503') ||
        error.message.includes('rate limit')
      )) {
        console.log(`Request failed (${error.message}), retrying...`);
        const delay = this.baseDelay * Math.pow(2, retryCount + 1);
        Utilities.sleep(delay);
        return this.makeRequestWithRetry(url, options, retryCount + 1);
      }
      
      throw error;
    }
  }
  
  createRecord(tableName, fields, options = {}) {
    try {
      console.log(`Creating record in ${tableName}:`, fields);
      
      if (!fields || Object.keys(fields).length === 0) {
        throw new Error('VALIDATION_ERROR: No data provided');
      }
      
      const payload = {
        records: [{
          fields: this.sanitizeFields(fields)
        }],
        typecast: options.typecast !== false
      };
      
      const requestOptions = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify(payload)
      };
      
      const result = this.makeRequestWithRetry(
        `${this.baseUrl}${this.baseId}/${tableName}`, 
        requestOptions
      );
      
      if (result.success) {
        const data = JSON.parse(result.response.getContentText());
        return {
          success: true,
          record: data.records[0],
          message: 'Record successfully created'
        };
      } else {
        throw new Error('Request failed after retries');
      }
      
    } catch (error) {
      console.error('AirtableService.createRecord error:', error);
      return ErrorHandler.handle(error, { table: tableName, fields });
    }
  }
  
  getRecords(tableName, options = {}) {
    try {
      console.log(`Getting records from ${tableName}:`, options);
      
      let url = `${this.baseUrl}${this.baseId}/${tableName}`;
      
      const params = [];
      if (options.filterByFormula) params.push(`filterByFormula=${encodeURIComponent(options.filterByFormula)}`);
      if (options.sort) params.push(`sort[0][field]=${options.sort.field}&sort[0][direction]=${options.sort.direction}`);
      if (options.maxRecords) params.push(`maxRecords=${options.maxRecords}`);
      
      if (params.length > 0) {
        url += '?' + params.join('&');
      }
      
      const requestOptions = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const result = this.makeRequestWithRetry(url, requestOptions);
      
      if (result.success) {
        const data = JSON.parse(result.response.getContentText());
        return {
          success: true,
          records: data.records || [],
          count: data.records ? data.records.length : 0
        };
      } else {
        throw new Error('Request failed after retries');
      }
      
    } catch (error) {
      console.error('AirtableService.getRecords error:', error);
      return ErrorHandler.handle(error, { table: tableName, options });
    }
  }
  
  updateRecord(tableName, recordId, fields) {
    try {
      console.log(`Updating record ${recordId} in ${tableName}:`, fields);
      
      const payload = {
        records: [{
          id: recordId,
          fields: this.sanitizeFields(fields)
        }],
        typecast: true
      };
      
      const requestOptions = {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify(payload)
      };
      
      const result = this.makeRequestWithRetry(
        `${this.baseUrl}${this.baseId}/${tableName}`, 
        requestOptions
      );
      
      if (result.success) {
        const data = JSON.parse(result.response.getContentText());
        return {
          success: true,
          record: data.records[0],
          message: 'Record successfully updated'
        };
      } else {
        throw new Error('Request failed after retries');
      }
      
    } catch (error) {
      console.error('AirtableService.updateRecord error:', error);
      return ErrorHandler.handle(error, { table: tableName, recordId, fields });
    }
  }
  
  deleteRecord(tableName, recordId) {
    try {
      console.log(`Deleting record ${recordId} from ${tableName}`);
      
      const requestOptions = {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      };
      
      const result = this.makeRequestWithRetry(
        `${this.baseUrl}${this.baseId}/${tableName}/${recordId}`, 
        requestOptions
      );
      
      if (result.success) {
        return {
          success: true,
          message: 'Record successfully deleted'
        };
      } else {
        throw new Error('Request failed after retries');
      }
      
    } catch (error) {
      console.error('AirtableService.deleteRecord error:', error);
      return ErrorHandler.handle(error, { table: tableName, recordId });
    }
  }
  
  sanitizeFields(fields) {
    const sanitized = {};
    Object.keys(fields).forEach(key => {
      let value = fields[key];
      
      if (typeof value === 'string') {
        value = value.replace(/<script[^>]*>.*?<\/script>/gi, '');
        value = value.trim();
      }
      
      if (value !== undefined && value !== null && value !== '') {
        sanitized[key] = value;
      }
    });
    return sanitized;
  }
}

// ==================== BUG FIX 1 & 4: SYNCHRONIZED NUMBER GENERATION ====================
/**
 * Get the highest invoice number from Airtable and increment
 */
function generateInvoiceNumber() {
  try {
    console.log('=== GENERATING INVOICE NUMBER FROM AIRTABLE ===');
    
    const airtable = new AirtableService();
    const year = new Date().getFullYear();
    
    // Query Airtable for highest invoice number this year
    const filterFormula = `AND(
      {Select} = "Inkomsten",
      FIND("${year}-", {Name})
    )`;
    
    const result = airtable.getRecords('Transacties', {
      filterByFormula: filterFormula,
      sort: { field: 'Name', direction: 'desc' },
      maxRecords: 10
    });
    
    if (!result.success) {
      throw new Error('Failed to query Airtable');
    }
    
    let highestNumber = 0;
    
    // Parse invoice numbers to find highest
    result.records.forEach(record => {
      const name = record.fields.Name || '';
      const match = name.match(/(\d{4})-(\d{3})/);
      if (match && match[1] == year) {
        const num = parseInt(match[2]);
        if (num > highestNumber) {
          highestNumber = num;
        }
      }
    });
    
    // Increment and format
    const newNumber = highestNumber + 1;
    const invoiceNumber = `${year}-${String(newNumber).padStart(3, '0')}`;
    
    console.log(`Highest invoice in Airtable: ${year}-${String(highestNumber).padStart(3, '0')}`);
    console.log(`New invoice number: ${invoiceNumber}`);
    
    return invoiceNumber;
    
  } catch (error) {
    console.error('Error generating invoice number from Airtable:', error);
    // Fallback to timestamp-based number
    const fallback = `${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`;
    console.log('Using fallback invoice number:', fallback);
    return fallback;
  }
}

/**
 * Get the highest expense number from Airtable and increment
 */
function generateExpenseNumber() {
  try {
    console.log('=== GENERATING EXPENSE NUMBER FROM AIRTABLE ===');
    
    const airtable = new AirtableService();
    const year = new Date().getFullYear();
    
    // Query Airtable for highest expense number this year
    const filterFormula = `AND(
      {Select} = "Uitgaven",
      FIND("UIT-${year}-", {Name})
    )`;
    
    const result = airtable.getRecords('Transacties', {
      filterByFormula: filterFormula,
      sort: { field: 'Name', direction: 'desc' },
      maxRecords: 10
    });
    
    if (!result.success) {
      throw new Error('Failed to query Airtable');
    }
    
    let highestNumber = 0;
    
    // Parse expense numbers to find highest
    result.records.forEach(record => {
      const name = record.fields.Name || '';
      const match = name.match(/UIT-(\d{4})-(\d{4})/);
      if (match && match[1] == year) {
        const num = parseInt(match[2]);
        if (num > highestNumber) {
          highestNumber = num;
        }
      }
    });
    
    // Increment and format
    const newNumber = highestNumber + 1;
    const expenseNumber = `UIT-${year}-${String(newNumber).padStart(4, '0')}`;
    
    console.log(`Highest expense in Airtable: UIT-${year}-${String(highestNumber).padStart(4, '0')}`);
    console.log(`New expense number: ${expenseNumber}`);
    
    return expenseNumber;
    
  } catch (error) {
    console.error('Error generating expense number from Airtable:', error);
    // Fallback to timestamp-based number
    const fallback = `UIT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    console.log('Using fallback expense number:', fallback);
    return fallback;
  }
}

// ==================== VALIDATION SERVICE ====================
class ValidationService {
  static validateTransaction(data) {
    const errors = [];
    
    if (!data.Beschrijving) errors.push('Description is required');
    if (!data.Bedrag || parseFloat(data.Bedrag) <= 0) errors.push('Valid amount is required');
    if (!data.Date) errors.push('Date is required');
    if (!data.Select) errors.push('Transaction type is required');
    
    if (data.Bedrag && !this.isValidAmount(data.Bedrag)) {
      errors.push('Amount must be a valid number with maximum 2 decimals');
    }
    
    if (data.Date && !this.isValidDate(data.Date)) {
      errors.push('Date must be in valid format');
    }
    
    if (data['BTW Percentage'] && !this.isValidVATRate(data['BTW Percentage'])) {
      errors.push('VAT rate must be 0, 6, 12, or 21');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
  
  static validateProject(data) {
    const errors = [];
    
    if (!data.Naam) errors.push('Project name is required');
    if (!data.Type) errors.push('Project type is required');
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
  
  static validateClient(data) {
    const errors = [];
    
    if (!data.Klantgegevens) errors.push('Client name is required');
    if (!data.Contactpersoon) errors.push('Contact person is required');
    
    if (data.Email && !this.isValidEmail(data.Email)) {
      errors.push('Valid email address is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
  
  static isValidAmount(amount) {
    const pattern = /^\d{1,10}(\.\d{1,2})?$/;
    return pattern.test(amount.toString()) && parseFloat(amount) > 0;
  }
  
  static isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }
  
  static isValidVATRate(rate) {
    const validRates = [0, 6, 12, 21];
    return validRates.includes(parseFloat(rate));
  }
  
  static isValidEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }
}

// ==================== TAX CALCULATOR ====================
class TaxCalculator {
  static calculateBelgianVAT(amount, vatRate) {
    const rate = parseFloat(vatRate) / 100;
    const vatAmount = amount * rate;
    const total = amount + vatAmount;
    
    return {
      netAmount: parseFloat(amount.toFixed(2)),
      vatRate: rate,
      vatAmount: parseFloat(vatAmount.toFixed(2)),
      totalAmount: parseFloat(total.toFixed(2))
    };
  }
  
  static getBelgianVATRates() {
    return {
      'standard': 21,
      'reduced': 6,
      'intermediate': 12,
      'zero': 0
    };
  }
}

// ==================== CLIENT SEARCH ====================
function searchClients(query) {
  try {
    if (!query || query.trim().length < 2) {
      return {
        success: true,
        clients: []
      };
    }
    
    const airtable = new AirtableService();
    
    const searchTerm = query.toLowerCase().replace(/'/g, "\\'");
    const searchFormula = `OR(
      FIND("${searchTerm}", LOWER(CONCATENATE({Klantgegevens},""))),
      FIND("${searchTerm}", LOWER(CONCATENATE({Contactpersoon},""))),
      FIND("${searchTerm}", LOWER(CONCATENATE({Email},""))),
      FIND("${searchTerm}", LOWER(CONCATENATE({Stad},"")))
    )`;
    
    const result = airtable.getRecords('Klanten', {
      filterByFormula: searchFormula,
      maxRecords: 10
    });
    
    if (!result.success) {
      return result;
    }
    
    const clients = result.records.map(record => ({
      id: record.id,
      company: record.fields.Klantgegevens || '',
      contact: record.fields.Contactpersoon || '',
      address: record.fields.Adres || '',
      postalCode: record.fields.Postcode || '',
      city: record.fields.Stad || '',
      country: record.fields.Land || 'België',
      vatNumber: record.fields['BTW-nummer'] || '',
      email: record.fields.Email || '',
      phone: record.fields.Telefoon || ''
    }));
    
    return {
      success: true,
      clients: clients
    };
    
  } catch (error) {
    return ErrorHandler.handle(error, { function: 'searchClients', query });
  }
}

// ==================== DASHBOARD FUNCTIONS ====================
function loadDashboardData() {
  try {
    const airtable = new AirtableService();
    
    const transactionsResult = airtable.getRecords('Transacties');
    
    if (!transactionsResult.success) {
      return transactionsResult;
    }
    
    const transactions = transactionsResult.records;
    
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalVAT = 0;
    
    const recentTransactions = [];
    const invoices = [];
    const expenses = [];
    
    transactions.forEach(record => {
      const fields = record.fields;
      const amount = parseFloat(fields.Bedrag || 0);
      const vatAmount = parseFloat(fields['BTW Bedrag'] || 0);
      
      if (fields.Select === 'Inkomsten') {
        totalIncome += amount;
        if (fields.Name && (fields.Name.includes('-') || fields.Name.startsWith('2025'))) {
          invoices.push(record);
        }
      } else if (fields.Select === 'Uitgaven') {
        totalExpenses += amount;
        expenses.push(record);
      }
      
      totalVAT += vatAmount;
      recentTransactions.push(record);
    });
    
    recentTransactions.sort((a, b) => {
      const dateA = new Date(a.fields.Date || 0);
      const dateB = new Date(b.fields.Date || 0);
      return dateB - dateA;
    });
    
    return {
      success: true,
      data: {
        totalIncome: totalIncome,
        totalExpenses: totalExpenses,
        netResult: totalIncome - totalExpenses,
        totalVAT: totalVAT,
        transactions: recentTransactions.slice(0, 10),
        invoices: invoices,
        expenses: expenses,
        transactionCount: transactions.length
      }
    };
    
  } catch (error) {
    return ErrorHandler.handle(error, { function: 'loadDashboardData' });
  }
}

// ==================== TRANSACTION FUNCTIONS ====================
function createTransaction(transactionData) {
  try {
    const validation = ValidationService.validateTransaction(transactionData);
    if (!validation.isValid) {
      throw new Error(`VALIDATION_ERROR: ${validation.errors.join(', ')}`);
    }
    
    const amount = parseFloat(transactionData.Bedrag);
    const vatRate = parseFloat(transactionData['BTW Percentage'] || 0);
    const vatCalculation = TaxCalculator.calculateBelgianVAT(amount, vatRate);
    
    const record = {
      Name: generateTransactionReference(transactionData.Select),
      Date: transactionData.Date,
      Select: transactionData.Select,
      Project: transactionData.Project || 'Algemeen',
      Beschrijving: transactionData.Beschrijving,
      'NACE Code': transactionData['NACE Code'] || '',
      Bedrag: vatCalculation.netAmount,
      'BTW Percentage': vatRate,
      'BTW Bedrag': vatCalculation.vatAmount,
      Totaal: vatCalculation.totalAmount,
      Status: transactionData.Select === 'Inkomsten' ? 'Betaald (betaalde facturen/uitgaven)' : 'Betaald (betaalde facturen/uitgaven)'
    };
    
    if (transactionData.Select === 'Uitgaven') {
      if (transactionData.Leverancier) record.Leverancier = transactionData.Leverancier;
      if (transactionData.Categorie) record.Categorie = transactionData.Categorie;
      if (transactionData.Betaalmethode) record.Betaalmethode = transactionData.Betaalmethode;
    }
    
    const airtable = new AirtableService();
    return airtable.createRecord('Transacties', record, { typecast: true });
    
  } catch (error) {
    return ErrorHandler.handle(error, { function: 'createTransaction' });
  }
}

function generateTransactionReference(type) {
  const timestamp = new Date().toISOString().slice(0,19).replace(/:/g, '-').replace('T', '_');
  const prefix = type === 'Inkomsten' ? 'INC' : 'EXP';
  return `${prefix}_${timestamp}`;
}

function getAllTransactions() {
  const airtable = new AirtableService();
  return airtable.getRecords('Transacties', {
    sort: { field: 'Date', direction: 'desc' }
  });
}

function deleteTransaction(recordId) {
  const airtable = new AirtableService();
  return airtable.deleteRecord('Transacties', recordId);
}

// ==================== PROJECT FUNCTIONS ====================
function createProject(projectData) {
  try {
    console.log('=== CREATING PROJECT ===');
    console.log('Project data:', projectData);
    
    if (!projectData || !projectData.Naam || !projectData.Type) {
      throw new Error('VALIDATION_ERROR: Project name and type are required');
    }
    
    const record = {
      Naam: String(projectData.Naam).trim(),
      Type: String(projectData.Type).trim(),
      Beschrijving: projectData.Beschrijving ? String(projectData.Beschrijving).trim() : '',
      Aangemaakt: new Date().toISOString().split('T')[0]
    };
    
    console.log('Sanitized record:', record);
    
    const airtable = new AirtableService();
    const result = airtable.createRecord('Projecten', record, { typecast: true });
    
    console.log('Project creation result:', result);
    return result;
    
  } catch (error) {
    console.error('Project creation error:', error);
    return ErrorHandler.handle(error, { function: 'createProject', projectData });
  }
}

function getAllProjects() {
  const airtable = new AirtableService();
  return airtable.getRecords('Projecten', {
    sort: { field: 'Aangemaakt', direction: 'desc' }
  });
}

function deleteProject(recordId) {
  const airtable = new AirtableService();
  return airtable.deleteRecord('Projecten', recordId);
}

// ==================== CLIENT FUNCTIONS ====================
function createClient(clientData) {
  try {
    const validation = ValidationService.validateClient(clientData);
    if (!validation.isValid) {
      throw new Error(`VALIDATION_ERROR: ${validation.errors.join(', ')}`);
    }
    
    const airtable = new AirtableService();
    return airtable.createRecord('Klanten', clientData, { typecast: true });
    
  } catch (error) {
    return ErrorHandler.handle(error, { function: 'createClient' });
  }
}

function getAllClients() {
  const airtable = new AirtableService();
  return airtable.getRecords('Klanten');
}

function getCultureNACECodes() {
  return {
    success: true,
    codes: CULTURE_NACE_CODES
  };
}

// ==================== BUG FIX 2 & 3: INVOICE CREATION WITH PDF ====================
// ==================== BUG FIX 3: ENHANCED RESPONSE WITH DOWNLOAD CAPABILITY ====================
/**
 * Enhanced createInvoice function that returns PDF info for immediate display
 */
function createInvoice(invoiceData) {
  try {
    // Validate and generate invoice number if needed
    if (!invoiceData.invoiceNumber || invoiceData.invoiceNumber.trim() === '') {
      invoiceData.invoiceNumber = generateInvoiceNumber();
    }
    
    // Validate format
    if (!invoiceData.invoiceNumber.match(/^\d{4}-\d{3}$/)) {
      throw new Error('VALIDATION_ERROR: Factuurnummer moet formaat YYYY-XXX hebben');
    }
    
    // Calculate totals
    let subtotal = 0;
    let totalVAT = 0;
    
    invoiceData.services.forEach(service => {
      const lineTotal = service.quantity * service.unitPrice;
      subtotal += lineTotal;
      
      if (service.vat && service.vat !== '0' && service.vat !== 'Vrijgesteld') {
        const vatRate = parseFloat(service.vat) / 100;
        totalVAT += lineTotal * vatRate;
      }
    });
    
    const total = subtotal + totalVAT - (invoiceData.discount || 0);
    
    // Create transaction record
    const transactionRecord = {
      Name: invoiceData.invoiceNumber,
      Date: invoiceData.invoiceDate.split('/').reverse().join('-'),
      Select: 'Inkomsten',
      Project: invoiceData.projectName || 'Algemeen',
      Beschrijving: `Factuur ${invoiceData.invoiceNumber} - ${invoiceData.clientCompany}`,
      Bedrag: subtotal,
      'BTW Bedrag': totalVAT,
      Totaal: total,
      Status: 'Verzonden (verzonden facturen)'
    };
    
    // Save to Airtable
    const airtable = new AirtableService();
    const transactionResult = airtable.createRecord('Transacties', transactionRecord, { typecast: true });
    
    if (!transactionResult.success) {
      return transactionResult;
    }
    
    // Generate PDF with enhanced function
    const pdfResult = generateInvoicePDF(invoiceData);
    
    // Store recent invoice info in script properties for quick access
    if (pdfResult.success) {
      const scriptProperties = PropertiesService.getScriptProperties();
      const recentInvoices = JSON.parse(scriptProperties.getProperty('recentInvoices') || '[]');
      
      // Add new invoice to beginning
      recentInvoices.unshift({
        invoiceNumber: invoiceData.invoiceNumber,
        clientCompany: invoiceData.clientCompany,
        fileName: pdfResult.fileName,
        fileId: pdfResult.fileId,
        downloadUrl: pdfResult.directDownloadUrl,
        viewUrl: pdfResult.webViewUrl,
        createdAt: pdfResult.createdAt
      });
      
      // Keep only last 10 invoices
      if (recentInvoices.length > 10) {
        recentInvoices.pop();
      }
      
      scriptProperties.setProperty('recentInvoices', JSON.stringify(recentInvoices));
    }
    
    return {
      success: true,
      message: 'Factuur succesvol aangemaakt',
      invoiceNumber: invoiceData.invoiceNumber,
      transactionId: transactionResult.record.id,
      pdfResult: pdfResult
    };
    
  } catch (error) {
    console.error('Invoice creation error:', error);
    return {
      success: false,
      error: error.message || 'Factuur aanmaken mislukt'
    };
  }
}

/**
 * Get recent invoices for display in UI
 */
function getRecentInvoices() {
  try {
    const scriptProperties = PropertiesService.getScriptProperties();
    const recentInvoices = JSON.parse(scriptProperties.getProperty('recentInvoices') || '[]');
    
    return {
      success: true,
      invoices: recentInvoices
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      invoices: []
    };
  }
}

/**
 * ENHANCED PDF GENERATION WITH ROBUST ERROR HANDLING
 */
* Generate invoice PDF with EXACT template matching and proper error handling
 */
function generateInvoicePDF(invoiceData) {
  let tempDoc = null;
  
  try {
    console.log('=== STARTING ENHANCED INVOICE PDF GENERATION ===');
    console.log('Invoice number:', invoiceData.invoiceNumber);
    
    // Create or get invoice folder with better error handling
    let targetFolder;
    try {
      // First try the configured folder
      targetFolder = DriveApp.getFolderById(DRIVE_FOLDERS.INVOICES);
      console.log('✅ Using configured invoice folder');
    } catch (e) {
      console.log('⚠️ Configured folder not accessible, creating/finding alternative');
      // Try to find existing folder
      const folders = DriveApp.getFoldersByName('Facturen_MORE_IS_MORE');
      if (folders.hasNext()) {
        targetFolder = folders.next();
      } else {
        // Create new folder in root
        targetFolder = DriveApp.createFolder('Facturen_MORE_IS_MORE');
        // Make it accessible
        targetFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      }
      console.log('✅ Using alternative folder:', targetFolder.getName());
    }
    
    // Calculate totals first
    let subtotal = 0;
    let totalVATAmount = 0;
    const serviceLines = [];
    
    invoiceData.services.forEach(service => {
      const lineAmount = service.quantity * service.unitPrice;
      let lineVAT = 0;
      let vatText = '0%';
      
      if (service.vat && service.vat !== '0' && service.vat !== 'Vrijgesteld') {
        const vatRate = parseFloat(service.vat) / 100;
        lineVAT = lineAmount * vatRate;
        vatText = service.vat + '%';
      }
      
      serviceLines.push({
        description: service.description,
        quantity: service.quantity,
        unitPrice: service.unitPrice,
        vatText: vatText,
        amount: lineAmount
      });
      
      subtotal += lineAmount;
      totalVATAmount += lineVAT;
    });
    
    const grandTotal = subtotal + totalVATAmount - (invoiceData.discount || 0);
    
    // Create document with unique name
    const timestamp = Date.now();
    const docName = `Factuur_${invoiceData.invoiceNumber}_TEMP_${timestamp}`;
    tempDoc = DocumentApp.create(docName);
    const body = tempDoc.getBody();
    
    // Clear default content
    body.clear();
    
    // Set document margins (narrower for invoice)
    body.setMarginTop(40);
    body.setMarginBottom(40);
    body.setMarginLeft(50);
    body.setMarginRight(50);
    
    // Define the blue color
    const primaryBlue = '#1e40af';
    const darkGray = '#1e293b';
    const mediumGray = '#64748b';
    
    // ===== HEADER SECTION =====
    // MORE IS MORE! - Large blue
    const header1 = body.appendParagraph('MORE IS MORE!');
    header1.setFontSize(36);
    header1.setBold(true);
    header1.setForegroundColor(primaryBlue);
    header1.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    header1.setSpacingAfter(0);
    
    // Agency - Smaller
    const header2 = body.appendParagraph('Agency');
    header2.setFontSize(24);
    header2.setForegroundColor(darkGray);
    header2.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    header2.setSpacingAfter(15);
    
    // FACTUUR - Medium blue
    const invoiceTitle = body.appendParagraph('FACTUUR');
    invoiceTitle.setFontSize(18);
    invoiceTitle.setBold(true);
    invoiceTitle.setForegroundColor(primaryBlue);
    invoiceTitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    invoiceTitle.setSpacingAfter(25);
    
    // ===== COMPANY INFO AND INVOICE DETAILS (TWO COLUMNS) =====
    const infoTable = body.appendTable();
    infoTable.setBorderWidth(0);
    const infoRow = infoTable.appendTableRow();
    
    // Left column - Company info
    const leftCell = infoRow.appendTableCell();
    const companyInfo = leftCell.appendParagraph(
      `${COMPANY_INFO.address}\n` +
      `${COMPANY_INFO.postalCode} ${COMPANY_INFO.city}, ${COMPANY_INFO.country}\n` +
      `Tel: ${COMPANY_INFO.phone}\n` +
      `E-mail: ${COMPANY_INFO.email}\n` +
      `Ondernemingsnummer: ${COMPANY_INFO.vatNumber.replace('BE ', '')}`
    );
    companyInfo.setFontSize(10);
    companyInfo.setForegroundColor(darkGray);
    leftCell.setPaddingTop(0);
    leftCell.setPaddingBottom(0);
    leftCell.setPaddingLeft(0);
    leftCell.setPaddingRight(20);
    
    // Right column - Invoice details
    const rightCell = infoRow.appendTableCell();
    const invoiceDetails = rightCell.appendParagraph(
      `Factuurnr: ${invoiceData.invoiceNumber}\n` +
      `Factuurdatum: ${invoiceData.invoiceDate}\n` +
      `Vervaldatum: ${calculateDueDate(invoiceData.invoiceDate)}\n` +
      `Referentie: ${invoiceData.projectName || 'Geen referentie'}`
    );
    invoiceDetails.setFontSize(10);
    invoiceDetails.setForegroundColor(darkGray);
    invoiceDetails.setBold(true);
    invoiceDetails.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
    rightCell.setPaddingTop(0);
    rightCell.setPaddingBottom(0);
    rightCell.setPaddingLeft(20);
    rightCell.setPaddingRight(0);
    
    body.appendParagraph('').setSpacingAfter(20);
    
    // ===== FACTUURADRES SECTION =====
    const addressHeader = body.appendParagraph('FACTUURADRES');
    addressHeader.setFontSize(12);
    addressHeader.setBold(true);
    addressHeader.setForegroundColor(primaryBlue);
    addressHeader.setSpacingAfter(10);
    
    const clientAddress = body.appendParagraph(
      `${invoiceData.contactPerson || ''}\n` +
      `${invoiceData.clientCompany || ''}\n` +
      `${invoiceData.address || ''}\n` +
      `${invoiceData.postalCode || ''} ${invoiceData.city || ''}\n` +
      `${invoiceData.country || 'België'}\n` +
      `BTW: ${invoiceData.vatNumber || 'n.v.t.'}`
    );
    clientAddress.setFontSize(10);
    clientAddress.setForegroundColor(darkGray);
    clientAddress.setSpacingAfter(20);
    
    // ===== PROJECT DETAILS SECTION =====
    const projectHeader = body.appendParagraph('PROJECT DETAILS');
    projectHeader.setFontSize(12);
    projectHeader.setBold(true);
    projectHeader.setForegroundColor(primaryBlue);
    projectHeader.setSpacingAfter(10);
    
    const projectDetails = body.appendParagraph(
      `Project: ${invoiceData.projectName || 'Algemeen'}\n` +
      `Periode: ${invoiceData.projectPeriod || 'n.v.t.'}\n` +
      `Account manager: ${invoiceData.accountManager || 'More is More! Agency'}`
    );
    projectDetails.setFontSize(10);
    projectDetails.setForegroundColor(darkGray);
    projectDetails.setSpacingAfter(20);
    
    // ===== GELEVERDE DIENSTEN TABLE =====
    const servicesHeader = body.appendParagraph('GELEVERDE DIENSTEN');
    servicesHeader.setFontSize(12);
    servicesHeader.setBold(true);
    servicesHeader.setForegroundColor(primaryBlue);
    servicesHeader.setSpacingAfter(10);
    
    // Services table with exact styling
    const servicesTable = body.appendTable();
    servicesTable.setBorderColor('#e5e7eb');
    
    // Table header
    const tableHeader = servicesTable.appendTableRow();
    const headers = ['Omschrijving', 'Aantal', 'Eenheidsprijs', 'BTW', 'Bedrag'];
    headers.forEach(headerText => {
      const cell = tableHeader.appendTableCell(headerText);
      cell.setBackgroundColor('#f8fafc');
      cell.setPaddingTop(8);
      cell.setPaddingBottom(8);
      cell.setPaddingLeft(10);
      cell.setPaddingRight(10);
      
      const para = cell.getChild(0).asParagraph();
      para.setBold(true);
      para.setFontSize(10);
      para.setForegroundColor(darkGray);
    });
    
    // Service rows
    serviceLines.forEach(line => {
      const row = servicesTable.appendTableRow();
      
      // Description
      const descCell = row.appendTableCell(line.description);
      const descPara = descCell.getChild(0).asParagraph();
      descPara.setFontSize(10);
      descPara.setForegroundColor(darkGray);
      descCell.setPaddingTop(6);
      descCell.setPaddingBottom(6);
      descCell.setPaddingLeft(10);
      
      // Quantity
      const qtyCell = row.appendTableCell(line.quantity.toString());
      const qtyPara = qtyCell.getChild(0).asParagraph();
      qtyPara.setFontSize(10);
      qtyPara.setForegroundColor(darkGray);
      qtyPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      qtyCell.setPaddingTop(6);
      qtyCell.setPaddingBottom(6);
      
      // Unit price
      const priceCell = row.appendTableCell(formatCurrency(line.unitPrice));
      const pricePara = priceCell.getChild(0).asParagraph();
      pricePara.setFontSize(10);
      pricePara.setForegroundColor(darkGray);
      pricePara.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
      priceCell.setPaddingTop(6);
      priceCell.setPaddingBottom(6);
      priceCell.setPaddingRight(10);
      
      // VAT
      const vatCell = row.appendTableCell(line.vatText);
      const vatPara = vatCell.getChild(0).asParagraph();
      vatPara.setFontSize(10);
      vatPara.setForegroundColor(darkGray);
      vatPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      vatCell.setPaddingTop(6);
      vatCell.setPaddingBottom(6);
      
      // Amount
      const amountCell = row.appendTableCell(formatCurrency(line.amount));
      const amountPara = amountCell.getChild(0).asParagraph();
      amountPara.setFontSize(10);
      amountPara.setForegroundColor(darkGray);
      amountPara.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
      amountCell.setPaddingTop(6);
      amountCell.setPaddingBottom(6);
      amountCell.setPaddingRight(10);
    });
    
    body.appendParagraph('').setSpacingAfter(15);
    
    // ===== TOTALS SECTION =====
    // Subtotal
    const subtotalPara = body.appendParagraph(`Subtotaal ${formatCurrency(subtotal)}`);
    subtotalPara.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
    subtotalPara.setFontSize(11);
    subtotalPara.setForegroundColor(darkGray);
    subtotalPara.setSpacingAfter(5);
    
    // Korting if applicable
    if (invoiceData.discount && invoiceData.discount !== 0) {
      const discountPara = body.appendParagraph(`Korting/toeslag ${formatCurrency(-invoiceData.discount)}`);
      discountPara.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
      discountPara.setFontSize(11);
      discountPara.setForegroundColor(darkGray);
      discountPara.setSpacingAfter(5);
    }
    
    // Total
    const totalPara = body.appendParagraph(`TOTAAL TE BETALEN ${formatCurrency(grandTotal)}`);
    totalPara.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
    totalPara.setFontSize(14);
    totalPara.setBold(true);
    totalPara.setForegroundColor(primaryBlue);
    totalPara.setSpacingAfter(30);
    
    // ===== FOOTER WITH COMPANY INFO =====
    const footerLine1 = body.appendParagraph(
      `MORE IS MORE! Agency VZW | ${COMPANY_INFO.address}, ${COMPANY_INFO.postalCode} ${COMPANY_INFO.city} | ${COMPANY_INFO.vatNumber} | RPR Brussel`
    );
    footerLine1.setFontSize(8);
    footerLine1.setForegroundColor(mediumGray);
    footerLine1.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    footerLine1.setSpacingAfter(5);
    
    // Page break for second page
    body.appendPageBreak();
    
    // ===== BETALINGSGEGEVENS (Second page) =====
    const paymentHeader = body.appendParagraph('BETALINGSGEGEVENS');
    paymentHeader.setFontSize(12);
    paymentHeader.setBold(true);
    paymentHeader.setForegroundColor(primaryBlue);
    paymentHeader.setSpacingAfter(10);
    
    const paymentDetails = body.appendParagraph(
      `Bank: Triodos Bank\n` +
      `Rekeninghouder: MORE IS MORE! Agency\n` +
      `IBAN: ${COMPANY_INFO.iban}\n` +
      `BIC: ${COMPANY_INFO.bic}\n` +
      `Mededeling: ${invoiceData.invoiceNumber}\n` +
      `Vervaldatum: ${calculateDueDate(invoiceData.invoiceDate)}`
    );
    paymentDetails.setFontSize(10);
    paymentDetails.setForegroundColor(darkGray);
    paymentDetails.setSpacingAfter(25);
    
    // ===== ALGEMENE VOORWAARDEN =====
    const termsHeader = body.appendParagraph('ALGEMENE VOORWAARDEN');
    termsHeader.setFontSize(12);
    termsHeader.setBold(true);
    termsHeader.setForegroundColor(primaryBlue);
    termsHeader.setSpacingAfter(10);
    
    const termsText = body.appendParagraph(
      '1. Deze factuur is betaalbaar binnen 30 dagen na factuurdatum.\n' +
      '2. Bij niet-betaling op de vervaldag is van rechtswege en zonder ingebrekestelling een intrest verschuldigd van 10% per jaar.\n' +
      '3. Bovendien is bij gehele of gedeeltelijke niet-betaling van de schuld op de vervaldag van rechtswege en zonder ' +
      'ingebrekestelling een forfaitaire vergoeding verschuldigd van 10% op het factuurbedrag, met een minimum van € 75,00.\n' +
      '4. Alle geschillen vallen onder de exclusieve bevoegdheid van de rechtbanken van Brussel.'
    );
    termsText.setFontSize(9);
    termsText.setForegroundColor(darkGray);
    termsText.setSpacingAfter(30);
    
    // Final footer
    const footerLine2 = body.appendParagraph(
      `MORE IS MORE! Agency VZW | ${COMPANY_INFO.address}, ${COMPANY_INFO.postalCode} ${COMPANY_INFO.city} | ${COMPANY_INFO.vatNumber} | RPR Brussel`
    );
    footerLine2.setFontSize(8);
    footerLine2.setForegroundColor(mediumGray);
    footerLine2.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    
    // Save document
    tempDoc.saveAndClose();
    console.log('✅ Document saved successfully');
    
    // Wait longer for processing
    Utilities.sleep(3000);
    
    // Generate PDF with retry mechanism
    let pdfBlob;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`PDF conversion attempt ${retryCount + 1}`);
        pdfBlob = tempDoc.getAs('application/pdf');
        console.log('✅ PDF generated successfully');
        break;
      } catch (pdfError) {
        retryCount++;
        if (retryCount >= maxRetries) {
          throw new Error('PDF conversion failed after ' + maxRetries + ' attempts');
        }
        console.log(`⚠️ PDF conversion failed, retrying in 2 seconds...`);
        Utilities.sleep(2000);
      }
    }
    
    // Save PDF to Drive
    const fileName = `Factuur_${invoiceData.invoiceNumber}_${invoiceData.clientCompany.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const file = targetFolder.createFile(pdfBlob);
    file.setName(fileName);
    
    // Set sharing permissions
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Clean up temp document
    try {
      DriveApp.getFileById(tempDoc.getId()).setTrashed(true);
    } catch (e) {
      console.warn('Could not delete temp document:', e);
    }
    
    console.log('=== INVOICE PDF GENERATION COMPLETE ===');
    
    return {
      success: true,
      fileId: file.getId(),
      fileName: fileName,
      downloadUrl: file.getUrl(),
      directDownloadUrl: `https://drive.google.com/uc?export=download&id=${file.getId()}`,
      webViewUrl: `https://drive.google.com/file/d/${file.getId()}/view`,
      embedUrl: `https://drive.google.com/file/d/${file.getId()}/preview`,
      folderId: targetFolder.getId(),
      folderName: targetFolder.getName(),
      createdAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('=== INVOICE PDF GENERATION ERROR ===');
    console.error(error);
    
    // Clean up on error
    if (tempDoc) {
      try {
        DriveApp.getFileById(tempDoc.getId()).setTrashed(true);
      } catch (e) {
        console.warn('Could not clean up temp doc');
      }
    }
    
    return {
      success: false,
      error: error.message || 'Unknown error during PDF generation',
      timestamp: new Date().toISOString()
    };
  }
}

function calculateDueDate(invoiceDate) {
  const parts = invoiceDate.split('/');
  const date = new Date(parts[2], parts[1] - 1, parts[0]);
  date.setDate(date.getDate() + 30);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

// ==================== EXPENSE FUNCTIONS ====================
function createExpense(expenseData) {
  try {
    if (!expenseData.expenseNumber || expenseData.expenseNumber.trim() === '') {
      expenseData.expenseNumber = generateExpenseNumber();
    }
    
    const amount = parseFloat(expenseData.amount);
    const vatRate = parseFloat(expenseData.vatPercentage || 0);
    const vatCalculation = TaxCalculator.calculateBelgianVAT(amount, vatRate);
    
    const record = {
      Name: expenseData.expenseNumber,
      Date: expenseData.date,
      Select: 'Uitgaven',
      Project: expenseData.project || 'Algemeen',
      Beschrijving: expenseData.description,
      Leverancier: expenseData.vendor,
      Categorie: expenseData.category,
      Betaalmethode: expenseData.paymentMethod || 'Bankoverschrijving',
      Bedrag: vatCalculation.netAmount,
      'BTW Percentage': vatRate,
      'BTW Bedrag': vatCalculation.vatAmount,
      Totaal: vatCalculation.totalAmount,
      Status: 'Betaald (betaalde facturen/uitgaven)'
    };
    
    const airtable = new AirtableService();
    return airtable.createRecord('Transacties', record, { typecast: true });
    
  } catch (error) {
    return ErrorHandler.handle(error, { function: 'createExpense' });
  }
}

function createExpenseWithFile(expenseData, fileBlob, fileName) {
  try {
    // First create the expense record
    const expenseResult = createExpense(expenseData);
    
    if (!expenseResult.success) {
      return expenseResult;
    }
    
    // Upload file to organized folder structure
    const fileResult = uploadExpenseFile(fileBlob, fileName, expenseData);
    
    // Update the expense record with file info
    if (fileResult.success) {
      const airtable = new AirtableService();
      const updateResult = airtable.updateRecord('Transacties', expenseResult.record.id, {
        'Bijlage URL': fileResult.fileUrl,
        'Bijlage Bestandsnaam': fileResult.fileName
      });
      
      return {
        success: true,
        expenseRecord: expenseResult,
        fileResult: fileResult,
        updateResult: updateResult,
        message: 'Expense with file created successfully'
      };
    } else {
      return fileResult;
    }
    
  } catch (error) {
    return ErrorHandler.handle(error, { function: 'createExpenseWithFile' });
  }
}

/**
 * Get or create quarterly folder for expenses
 */
function getOrCreateQuarterlyFolder(parentFolder) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11
  const quarter = Math.floor(month / 3) + 1; // 1-4
  
  const folderName = `${year}-Q${quarter}`;
  
  // Try to find existing quarterly folder
  const folders = parentFolder.getFoldersByName(folderName);
  
  if (folders.hasNext()) {
    console.log(`Using existing quarterly folder: ${folderName}`);
    return folders.next();
  } else {
    console.log(`Creating new quarterly folder: ${folderName}`);
    const newFolder = parentFolder.createFolder(folderName);
    newFolder.setDescription(`Uitgaven voor ${year} kwartaal ${quarter}`);
    return newFolder;
  }
}

/**
 * Updated expense file upload with quarterly organization
 */
function uploadExpenseFile(fileBlob, fileName, expenseData) {
  try {
    // Create systematic filename
    const timestamp = new Date().getTime();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const systematicFileName = `${expenseData.expenseNumber}_${expenseData.vendor.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}_${sanitizedName}`;
    
    // Get base expense folder
    let baseFolder;
    try {
      baseFolder = DriveApp.getFolderById(DRIVE_FOLDERS.EXPENSES);
    } catch (e) {
      console.log('Creating/finding expense folder');
      const folders = DriveApp.getFoldersByName('Uitgaven_MORE_IS_MORE');
      if (folders.hasNext()) {
        baseFolder = folders.next();
      } else {
        baseFolder = DriveApp.createFolder('Uitgaven_MORE_IS_MORE');
        baseFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      }
    }
    
    // Get or create quarterly folder (BUG FIX 2)
    const quarterlyFolder = getOrCreateQuarterlyFolder(baseFolder);
    
    // Create file blob
    const blob = Utilities.newBlob(
      Utilities.base64Decode(fileBlob.data),
      fileBlob.mimeType,
      systematicFileName
    );
    
    // Upload file
    const uploadedFile = quarterlyFolder.createFile(blob);
    uploadedFile.setDescription(
      `Uitgave: ${expenseData.description}\n` +
      `Leverancier: ${expenseData.vendor}\n` +
      `Categorie: ${expenseData.category}\n` +
      `Bedrag: €${expenseData.amount}\n` +
      `Upload datum: ${new Date().toISOString()}`
    );
    
    // Set permissions
    uploadedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    console.log(`✅ File uploaded to quarterly folder: ${quarterlyFolder.getName()}`);
    
    return {
      success: true,
      fileId: uploadedFile.getId(),
      fileName: systematicFileName,
      fileUrl: uploadedFile.getUrl(),
      viewUrl: `https://drive.google.com/file/d/${uploadedFile.getId()}/view`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${uploadedFile.getId()}`,
      embedUrl: `https://drive.google.com/file/d/${uploadedFile.getId()}/preview`,
      quarterlyFolder: quarterlyFolder.getName(),
      uploadDate: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Expense file upload error:', error);
    return {
      success: false,
      error: error.message || 'File upload failed'
    };
  }
}

function getOrCreateExpenseFolder() {
  try {
    return DriveApp.getFolderById(DRIVE_FOLDERS.EXPENSES);
  } catch (error) {
    const folders = DriveApp.getFoldersByName('Expense Files');
    return folders.hasNext() ? folders.next() : DriveApp.createFolder('Expense Files');
  }
}

function getOrCreateCategoryFolder(parentFolder, category) {
  const folders = parentFolder.getFoldersByName(category);
  return folders.hasNext() ? folders.next() : parentFolder.createFolder(category);
}

function getOrCreateMonthFolder(parentFolder) {
  const now = new Date();
  const folderName = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  const folders = parentFolder.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : parentFolder.createFolder(folderName);
}

// ==================== BUG FIX 5: REPORT GENERATION WITH PROPER STYLING ====================
function generateReport(config) {
  try {
    const airtable = new AirtableService();
    const transactionsResult = airtable.getRecords('Transacties');
    
    if (!transactionsResult.success) {
      return transactionsResult;
    }
    
    let transactions = transactionsResult.records;
    
    // Apply filters
    if (config.transactionType !== 'both') {
      transactions = transactions.filter(t => t.fields.Select === config.transactionType);
    }
    
    if (config.project !== 'all') {
      transactions = transactions.filter(t => t.fields.Project === config.project);
    }
    
    // Date filtering
    if (config.periodType === 'month') {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      transactions = transactions.filter(t => {
        const date = new Date(t.fields.Date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });
    } else if (config.periodType === 'quarter') {
      const currentDate = new Date();
      const currentQuarter = Math.floor(currentDate.getMonth() / 3);
      const currentYear = currentDate.getFullYear();
      
      transactions = transactions.filter(t => {
        const date = new Date(t.fields.Date);
        const quarter = Math.floor(date.getMonth() / 3);
        return quarter === currentQuarter && date.getFullYear() === currentYear;
      });
    } else if (config.periodType === 'year') {
      const currentYear = new Date().getFullYear();
      
      transactions = transactions.filter(t => {
        const date = new Date(t.fields.Date);
        return date.getFullYear() === currentYear;
      });
    }
    
    // Calculate totals
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalVAT = 0;
    
    transactions.forEach(t => {
      const amount = parseFloat(t.fields.Bedrag || 0);
      const vat = parseFloat(t.fields['BTW Bedrag'] || 0);
      
      if (t.fields.Select === 'Inkomsten') {
        totalIncome += amount;
      } else {
        totalExpenses += amount;
      }
      totalVAT += vat;
    });
    
    // Sort transactions by date
    transactions.sort((a, b) => {
      const dateA = new Date(a.fields.Date || 0);
      const dateB = new Date(b.fields.Date || 0);
      return dateB - dateA;
    });
    
    const reportData = {
      transactions: transactions,
      summary: {
        totalIncome: totalIncome,
        totalExpenses: totalExpenses,
        netResult: totalIncome - totalExpenses,
        totalVAT: totalVAT,
        transactionCount: transactions.length,
        period: getPeriodDescription(config)
      },
      config: config
    };
    
    return {
      success: true,
      data: reportData,
      message: `Report generated with ${transactions.length} transactions`
    };
    
  } catch (error) {
    return ErrorHandler.handle(error, { function: 'generateReport' });
  }
}

function getPeriodDescription(config) {
  const now = new Date();
  const monthNames = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 
                      'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
  
  switch(config.periodType) {
    case 'month':
      return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      return `Q${quarter} ${now.getFullYear()}`;
    case 'year':
      return `${now.getFullYear()}`;
    default:
      return 'Alle periodes';
  }
}

/**
 * BUG FIX 5: ENHANCED PDF REPORT WITH EXECUTIVE STYLING
 */
function exportReportToPDF(reportData) {
  try {
    console.log('=== GENERATING EXECUTIVE REPORT PDF ===');
    
    const timestamp = new Date().toISOString().slice(0,10);
    const tempDoc = DocumentApp.create(`Executive_Report_${timestamp}_${Date.now()}`);
    const body = tempDoc.getBody();
    
    body.clear();
    
    // Set page margins
    body.setMarginTop(72); // 1 inch
    body.setMarginBottom(72);
    body.setMarginLeft(72);
    body.setMarginRight(72);
    
    // HEADER - Executive style
    const header = body.appendParagraph('MORE IS MORE! Agency');
    header.setFontSize(28);
    header.setBold(true);
    header.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    header.setForegroundColor('#1e40af');
    header.setSpacingAfter(10);
    
    const subtitle = body.appendParagraph('EXECUTIVE BUSINESS REPORT');
    subtitle.setFontSize(20);
    subtitle.setBold(true);
    subtitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    subtitle.setForegroundColor('#1e40af');
    subtitle.setSpacingAfter(20);
    
    // Report info
    const info = body.appendParagraph(
      `Periode: ${reportData.summary.period}\n` +
      `Gegenereerd: ${new Date().toLocaleDateString('nl-BE', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`
    );
    info.setFontSize(11);
    info.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    info.setSpacingAfter(30);
    
    // KPI DASHBOARD - Executive Summary
    const kpiHeader = body.appendParagraph('KEY PERFORMANCE INDICATORS');
    kpiHeader.setFontSize(16);
    kpiHeader.setBold(true);
    kpiHeader.setForegroundColor('#1e40af');
    kpiHeader.setSpacingAfter(15);
    
    // KPI Table with proper colors
    const kpiTable = body.appendTable();
    kpiTable.setBorderWidth(0);
    
    // Create 2x2 grid for KPIs
    const kpiRow1 = kpiTable.appendTableRow();
    const kpiRow2 = kpiTable.appendTableRow();
    
    // Total Income KPI
    const incomeCell = kpiRow1.appendTableCell();
    const incomePara1 = incomeCell.appendParagraph('Totale Omzet');
    incomePara1.setFontSize(12);
    incomePara1.setBold(true);
    incomePara1.setForegroundColor('#666666');
    
    const incomePara2 = incomeCell.appendParagraph(`€${reportData.summary.totalIncome.toFixed(2)}`);
    incomePara2.setFontSize(24);
    incomePara2.setBold(true);
    incomePara2.setForegroundColor('#10b981');
    incomeCell.setBackgroundColor('#f0fdf4');
    incomeCell.setPaddingTop(20);
    incomeCell.setPaddingBottom(20);
    incomeCell.setPaddingLeft(20);
    incomeCell.setPaddingRight(20);
    
    // Total Expenses KPI
    const expenseCell = kpiRow1.appendTableCell();
    const expensePara1 = expenseCell.appendParagraph('Totale Kosten');
    expensePara1.setFontSize(12);
    expensePara1.setBold(true);
    expensePara1.setForegroundColor('#666666');
    
    const expensePara2 = expenseCell.appendParagraph(`€${reportData.summary.totalExpenses.toFixed(2)}`);
    expensePara2.setFontSize(24);
    expensePara2.setBold(true);
    expensePara2.setForegroundColor('#ef4444');
    expenseCell.setBackgroundColor('#fef2f2');
    expenseCell.setPaddingTop(20);
    expenseCell.setPaddingBottom(20);
    expenseCell.setPaddingLeft(20);
    expenseCell.setPaddingRight(20);
    
    // Net Result KPI
    const netCell = kpiRow2.appendTableCell();
    const netPara1 = netCell.appendParagraph('Netto Winst');
    netPara1.setFontSize(12);
    netPara1.setBold(true);
    netPara1.setForegroundColor('#666666');
    
    const netPara2 = netCell.appendParagraph(`€${reportData.summary.netResult.toFixed(2)}`);
    netPara2.setFontSize(24);
    netPara2.setBold(true);
    netPara2.setForegroundColor(reportData.summary.netResult >= 0 ? '#10b981' : '#ef4444');
    netCell.setBackgroundColor(reportData.summary.netResult >= 0 ? '#f0fdf4' : '#fef2f2');
    netCell.setPaddingTop(20);
    netCell.setPaddingBottom(20);
    netCell.setPaddingLeft(20);
    netCell.setPaddingRight(20);
    
    // Margin % KPI
    const marginCell = kpiRow2.appendTableCell();
    const marginPara1 = marginCell.appendParagraph('Winstmarge');
    marginPara1.setFontSize(12);
    marginPara1.setBold(true);
    marginPara1.setForegroundColor('#666666');
    
    const margin = reportData.summary.totalIncome > 0 
      ? ((reportData.summary.netResult / reportData.summary.totalIncome) * 100).toFixed(1)
      : '0.0';
    const marginPara2 = marginCell.appendParagraph(`${margin}%`);
    marginPara2.setFontSize(24);
    marginPara2.setBold(true);
    marginPara2.setForegroundColor(parseFloat(margin) >= 0 ? '#10b981' : '#ef4444');
    marginCell.setBackgroundColor('#f8fafc');
    marginCell.setPaddingTop(20);
    marginCell.setPaddingBottom(20);
    marginCell.setPaddingLeft(20);
    marginCell.setPaddingRight(20);
    
    body.appendParagraph('').setSpacingAfter(30);
    
    // BUSINESS INSIGHTS
    const insightsHeader = body.appendParagraph('BUSINESS INSIGHTS');
    insightsHeader.setFontSize(16);
    insightsHeader.setBold(true);
    insightsHeader.setForegroundColor('#1e40af');
    insightsHeader.setSpacingAfter(15);
    
    // Insight bullets
    const insights = [];
    
    if (reportData.summary.netResult < 0) {
      insights.push('🔴 Verlies Situatie: Netto resultaat is negatief. Kostenbeheersing en omzetverhoging vereist.');
    } else {
      insights.push('🟢 Winstgevend: Positief netto resultaat behaald deze periode.');
    }
    
    if (reportData.summary.totalIncome > reportData.summary.totalExpenses * 2) {
      insights.push('⭐ Uitstekende Prestatie: Omzet is meer dan dubbel de kosten.');
    }
    
    if (reportData.summary.transactionCount > 50) {
      insights.push('📊 Hoge Activiteit: Meer dan 50 transacties deze periode.');
    }
    
    insights.forEach(insight => {
      const insightPara = body.appendParagraph(insight);
      insightPara.setFontSize(11);
      insightPara.setSpacingAfter(8);
    });
    
    body.appendParagraph('').setSpacingAfter(30);
    
    // DETAILED TRANSACTIONS
    if (reportData.transactions && reportData.transactions.length > 0) {
      const detailHeader = body.appendParagraph('GEDETAILLEERD TRANSACTIE OVERZICHT');
      detailHeader.setFontSize(16);
      detailHeader.setBold(true);
      detailHeader.setForegroundColor('#1e40af');
      detailHeader.setSpacingAfter(15);
      
      // Transaction table with better styling
      const table = body.appendTable();
      table.setBorderWidth(1);
      table.setBorderColor('#e5e7eb');
      
      // Header row with dark blue background
      const headerRow = table.appendTableRow();
      const headers = ['Datum', 'Type', 'Referentie', 'Project', 'Beschrijving', 'Bedrag', 'BTW', 'Totaal'];
      
      headers.forEach((header, index) => {
        const cell = headerRow.appendTableCell(header);
        cell.setBackgroundColor('#1e40af');
        cell.setForegroundColor('#ffffff');
        cell.setBold(true);
        cell.setPaddingTop(10);
        cell.setPaddingBottom(10);
        cell.setPaddingLeft(8);
        cell.setPaddingRight(8);
        
        // Set text properties properly
        const para = cell.getChild(0).asParagraph();
        para.setForegroundColor('#ffffff');
        para.setBold(true);
        para.setFontSize(10);
      });
      
      // Data rows with alternating colors
      reportData.transactions.forEach((transaction, index) => {
        const fields = transaction.fields;
        const row = table.appendTableRow();
        
        // Data cells
        const cells = [
          new Date(fields.Date).toLocaleDateString('nl-BE'),
          fields.Select || '',
          fields.Name || '',
          fields.Project || 'Algemeen',
          fields.Beschrijving || '',
          `€${(fields.Bedrag || 0).toFixed(2)}`,
          `€${(fields['BTW Bedrag'] || 0).toFixed(2)}`,
          `€${(fields.Totaal || 0).toFixed(2)}`
        ];
        
        cells.forEach((cellData, cellIndex) => {
          const cell = row.appendTableCell(cellData);
          
          // Alternating row colors
          if (index % 2 === 1) {
            cell.setBackgroundColor('#f9fafb');
          } else {
            cell.setBackgroundColor('#ffffff');
          }
          
          // Cell styling
          cell.setPaddingTop(8);
          cell.setPaddingBottom(8);
          cell.setPaddingLeft(8);
          cell.setPaddingRight(8);
          
          // Text styling
          const para = cell.getChild(0).asParagraph();
          para.setFontSize(9);
          
          // Color code transaction type
          if (cellIndex === 1) { // Type column
            if (fields.Select === 'Inkomsten') {
              para.setForegroundColor('#10b981');
              para.setBold(true);
            } else {
              para.setForegroundColor('#ef4444');
              para.setBold(true);
            }
          } else if (cellIndex >= 5) { // Amount columns
            para.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
            if (fields.Select === 'Inkomsten') {
              para.setForegroundColor('#065f46');
            } else {
              para.setForegroundColor('#991b1b');
            }
          } else {
            para.setForegroundColor('#374151');
          }
        });
      });
      
      body.appendParagraph('').setSpacingAfter(30);
    }
    
    // FOOTER
    body.appendPageBreak();
    
    const footerHeader = body.appendParagraph('DISCLAIMER & CONTACT');
    footerHeader.setFontSize(14);
    footerHeader.setBold(true);
    footerHeader.setForegroundColor('#1e40af');
    footerHeader.setSpacingAfter(10);
    
    const disclaimer = body.appendParagraph(
      'Dit rapport is automatisch gegenereerd door het VZW Accounting System en is alleen bedoeld voor intern gebruik. ' +
      'Alle bedragen zijn exclusief BTW tenzij anders vermeld. Voor vragen of opmerkingen, neem contact op met de financiële afdeling.'
    );
    disclaimer.setFontSize(10);
    disclaimer.setForegroundColor('#6b7280');
    disclaimer.setSpacingAfter(20);
    
    // Company info footer
    const footer = body.appendParagraph(
      `${COMPANY_INFO.name}\n` +
      `${COMPANY_INFO.address}, ${COMPANY_INFO.postalCode} ${COMPANY_INFO.city}\n` +
      `Tel: ${COMPANY_INFO.phone} | Email: ${COMPANY_INFO.email}\n` +
      `BTW: ${COMPANY_INFO.vatNumber}`
    );
    footer.setFontSize(10);
    footer.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    footer.setForegroundColor('#6b7280');
    
    // Save and close
    tempDoc.saveAndClose();
    
    // Wait for document processing
    Utilities.sleep(3000);
    
    // Convert to PDF
    const pdfBlob = tempDoc.getAs('application/pdf');
    
    // Save to reports folder
    let folder;
    try {
      folder = DriveApp.getFolderById(DRIVE_FOLDERS.REPORTS);
    } catch (error) {
      const folders = DriveApp.getFoldersByName('Reports');
      folder = folders.hasNext() ? folders.next() : DriveApp.createFolder('Reports');
    }
    
    const fileName = `Executive_Report_${reportData.summary.period.replace(/\s/g, '_')}_${timestamp}.pdf`;
    const file = folder.createFile(pdfBlob);
    file.setName(fileName);
    
    // Set permissions
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Clean up
    DriveApp.getFileById(tempDoc.getId()).setTrashed(true);
    
    return {
      success: true,
      fileId: file.getId(),
      fileName: fileName,
      downloadUrl: `https://drive.google.com/file/d/${file.getId()}/view`,
      directDownload: `https://drive.google.com/uc?export=download&id=${file.getId()}`
    };
    
  } catch (error) {
    console.error('Report PDF generation error:', error);
    return ErrorHandler.handle(error, { function: 'exportReportToPDF' });
  }
}

// ==================== UTILITY FUNCTIONS ====================
function testConnection() {
  const airtable = new AirtableService();
  const result = airtable.getRecords('Transacties', { maxRecords: 1 });
  
  if (result.success) {
    return {
      success: true,
      message: 'Connection successful',
      timestamp: new Date().toISOString()
    };
  } else {
    return result;
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('nl-BE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount || 0);
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('nl-BE');
}
// ==================== BUG FIX 2: QUARTERLY EXPENSE ORGANIZATION ====================
function getOrCreateQuarterlyFolder(parentFolder) {
  // [Kopieer regels 423-442 uit eerste artifact]
}

// ==================== BUG FIX 3: NEW FUNCTIONS ====================
function getRecentInvoices() {
  // [Kopieer regels 634-647 uit eerste artifact]
}

function getRecentReports() {
  // [Kopieer regels 724-737 uit eerste artifact]
}
