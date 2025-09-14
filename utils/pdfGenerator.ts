import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

export interface PDFData {
  title: string;
  subtitle: string;
  sections: Array<{
    title: string;
    items: Array<{
      label: string;
      value: string;
      unit: string;
      isHighlighted?: boolean;
    }>;
  }>;
  inputs?: Array<{
    title: string;
    items: Array<{
      label: string;
      value: string;
      unit: string;
    }>;
  }>;
}

export const generateAndSharePDF = async (data: PDFData) => {
  try {
    const htmlContent = generateHTMLContent(data);
    
    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    // Share the PDF
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Share ${data.title}`,
        UTI: 'com.adobe.pdf',
      });
    } else {
      Alert.alert('Error', 'Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    Alert.alert('Error', 'Failed to generate PDF. Please try again.');
  }
};

const generateHTMLContent = (data: PDFData): string => {
  // Find the main result value (usually first highlighted item)
  const mainResult = data.sections
    .flatMap(section => section.items)
    .find(item => item.isHighlighted);
  
  const finalLoad = mainResult ? `${mainResult.value} ${mainResult.unit}` : 'N/A';
  const finalLoadLabel = mainResult ? mainResult.label : 'Final Load';
  
  // Create input sections if provided
  const inputsHTML = data.inputs ? data.inputs.map(inputSection => `
    <div class="section">
      <div class="section-header">
        <div class="section-title">${inputSection.title}</div>
      </div>
      <div class="section-content">
        ${inputSection.items.map(item => `
          <div class="parameter-row">
            <div class="parameter-label">${item.label}:</div>
            <div class="parameter-value">${item.value} ${item.unit}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('') : '';
  
  // Create result sections with proper formatting matching the image
  const sectionsHTML = data.sections.map(section => `
    <div class="section">
      <div class="section-header">
        <div class="section-title">${section.title}</div>
      </div>
      <div class="section-content">
        ${section.items.map(item => `
          <div class="parameter-row ${item.isHighlighted ? 'highlighted' : ''}">
            <div class="parameter-label">${item.label}:</div>
            <div class="parameter-value">${item.value} ${item.unit}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${data.title}</title>
      <style>
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box; 
        }
        
        @page { 
          size: A4; 
          margin: 10mm; 
        }
        
        body {
          font-family: 'Arial', 'Helvetica', sans-serif;
          line-height: 1.3;
          color: #000;
          background: #ffffff;
          font-size: 11px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          max-height: 277mm;
        }
        
        /* Header Section */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8mm;
          padding-bottom: 4mm;
          border-bottom: 2px solid #000;
        }
        
        .brand-section {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .logo {
          width: 40px;
          height: 40px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }
        
        .brand-title {
          font-size: 24px;
          font-weight: bold;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .date-section {
          text-align: right;
          font-size: 12px;
          color: #666;
        }
        
        /* Main Title */
        .main-title {
          text-align: center;
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 8mm;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        /* Sections */
        .section {
          margin-bottom: 6mm;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .section-header {
          background: #e6f3ff;
          padding: 3mm 4mm;
          border-bottom: 1px solid #ddd;
        }
        
        .section-title {
          font-size: 13px;
          font-weight: bold;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .section-content {
          padding: 3mm 4mm;
          background: #fff;
        }
        
        .parameter-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2mm 0;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .parameter-row:last-child {
          border-bottom: none;
        }
        
        .parameter-row.highlighted {
          background: #f0f8ff;
          font-weight: bold;
          padding: 3mm 4mm;
          margin: 0 -4mm;
          border: 1px solid #b3d9ff;
          border-radius: 3px;
        }
        
        .parameter-label {
          font-size: 11px;
          color: #333;
          flex: 1;
        }
        
        .parameter-value {
          font-size: 11px;
          color: #000;
          font-weight: 600;
          text-align: right;
          min-width: 80px;
        }
        
        .highlighted .parameter-label {
          color: #000;
          font-weight: bold;
        }
        
        .highlighted .parameter-value {
          color: #000;
          font-weight: bold;
          font-size: 12px;
        }
        
        /* Watermark */
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 48px;
          color: rgba(0, 0, 0, 0.05);
          font-weight: bold;
          z-index: -1;
          pointer-events: none;
        }
        
        /* Excel Note */
        .excel-note {
          text-align: center;
          margin-top: 4mm;
          padding: 2mm;
          background: #f0f8ff;
          border-radius: 4px;
          border: 1px solid #b3d9ff;
        }
        
        .excel-text {
          font-size: 10px;
          color: #2563eb;
          font-weight: bold;
          font-style: italic;
        }
        
        /* Print optimizations */
        @media print {
          body { 
            font-size: 10px; 
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            max-height: 277mm;
          }
          
          .brand-title { font-size: 22px; }
          .main-title { font-size: 18px; }
          .section-title { font-size: 12px; }
          .parameter-label, .parameter-value { font-size: 10px; }
          .highlighted .parameter-value { font-size: 11px; }
          
          .section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .watermark {
            display: block;
            color: rgba(0, 0, 0, 0.03);
          }
        }
      </style>
    </head>
    <body>
      <!-- Watermark -->
      <div class="watermark">ENZO</div>
      
      <!-- Header -->
      <div class="header">
        <div class="brand-section">
          <div class="logo" style="background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');"></div>
          <div class="brand-title">Enzo CoolCalc</div>
        </div>
        <div class="date-section">
          ${new Date().toLocaleDateString()}
        </div>
      </div>
      
      <!-- Main Title -->
      <div class="main-title">Heat Load Sheet</div>
      
      <!-- Input Sections -->
      ${inputsHTML}
      
      <!-- Result Sections -->
      ${sectionsHTML}
      
      <!-- Excel Matching Note -->
      <div class="excel-note">
        <div class="excel-text">Excel Matching Calculations</div>
      </div>
    </body>
    </html>
  `;
};
