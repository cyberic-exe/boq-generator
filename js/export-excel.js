/* global parseNumber, ExcelJS, showNotification */

window.exportExcelProfessional = async function(buttonElement) {
    try {
        console.log('🚀 Starting Excel export with ExcelJS...');
        
        buttonElement.innerHTML = '<i class="bi bi-hourglass-split me-1"></i> Generating...';
        buttonElement.disabled = true;
        
        const form = document.getElementById('boqForm');
        const projectName = form.project_name.value.trim() || "Untitled Project";
        
        if (typeof ExcelJS === 'undefined') {
            alert('ExcelJS library not loaded! Trying alternative method...');
            return exportExcelLegacy();
        }
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('BOQ');
        
        worksheet.columns = [
            { width: 18 },
            { width: 40 },
            { width: 10 },
            { width: 12 },
            { width: 15 },
            { width: 15 } 
        ];
  
        const titleRow = worksheet.getRow(1);
        titleRow.getCell(1).value = projectName.toUpperCase();
        titleRow.getCell(1).font = { bold: true, size: 16 };
        titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE699' } };
        titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        titleRow.getCell(1).border = {
            top: { style: 'medium' },
            bottom: { style: 'medium' },
            left: { style: 'medium' },
            right: { style: 'medium' }
        };
        worksheet.mergeCells('A1:F2');
        titleRow.height = 30;

        if (projectName.length > 30) {
            worksheet.columns[0].width = Math.max(15, Math.min(projectName.length * 1.2, 50));
        }
        
        const subtitleRow = worksheet.getRow(3);
        subtitleRow.getCell(1).value = 'BILL OF QUANTITIES';
        subtitleRow.getCell(1).font = { bold: true, size: 12 };
        subtitleRow.getCell(1).alignment = { horizontal: 'center' };
        subtitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8CBAD' } };
        worksheet.mergeCells('A3:F3');
        
        let rowIndex = 5;
        const projectInfo = Object.fromEntries(new FormData(form));
        const infoLabels = [
            ['Project Name:', projectInfo.project_name],
            ['Client Name:', projectInfo.client_name],
            ['Company Name:', projectInfo.company_name],
            ['Location:', projectInfo.location],
            ['Prepared By:', projectInfo.prepared_by],
            ['Date:', new Date().toLocaleDateString()]
        ];
        
        infoLabels.forEach(([label, value]) => {
            if (value) {
                const row = worksheet.getRow(rowIndex);
                row.getCell(1).value = label;
                row.getCell(1).font = { bold: true };
                row.getCell(1).alignment = { horizontal: 'left' };
                row.getCell(2).value = value;
                row.getCell(2).alignment = { horizontal: 'left' };
                worksheet.mergeCells(`B${rowIndex}:F${rowIndex}`);
                rowIndex++;
            }
        });
        
        rowIndex += 2;
        
        const headers = ['Item No', 'Description', 'Unit', 'Quantity', 'Rate', 'Amount'];
        const headerRow = worksheet.getRow(rowIndex);
        
        headers.forEach((header, colIndex) => {
            const cell = headerRow.getCell(colIndex + 1);
            cell.value = header;
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF404040' } }; // Dark Gray
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
            };
        });
        headerRow.height = 25;
        rowIndex++;
        
        let itemNumber = 1;
        document.querySelectorAll('.category-block').forEach(categoryDiv => {
            const categoryName = categoryDiv.querySelector('h6').textContent.toUpperCase();
            
            const categoryRow = worksheet.getRow(rowIndex);
            categoryRow.getCell(1).value = categoryName;
            categoryRow.getCell(1).font = { bold: true };
            categoryRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
            categoryRow.getCell(1).border = {
                top: { style: 'medium' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' }
            };
            worksheet.mergeCells(`A${rowIndex}:F${rowIndex}`);
            rowIndex++;
            
            categoryDiv.querySelectorAll('tbody tr').forEach(row => {
                const cells = row.querySelectorAll('input');
                const quantity = parseNumber(cells[2].value);
                const rate = parseNumber(cells[3].value);
                const amount = rate * quantity;
                
                const itemRow = worksheet.getRow(rowIndex);
                
                itemRow.getCell(1).value = itemNumber++;
                itemRow.getCell(2).value = cells[0].value || "";
                itemRow.getCell(3).value = cells[1].value || "";
                itemRow.getCell(4).value = quantity;
                itemRow.getCell(5).value = rate;
                itemRow.getCell(6).value = amount;
                
                itemRow.getCell(1).alignment = { horizontal: 'center' };
                itemRow.getCell(2).alignment = { horizontal: 'left', wrapText: true };
                itemRow.getCell(3).alignment = { horizontal: 'center' };
                
                for (let col = 5; col <= 6; col++) {
                    itemRow.getCell(col).numFmt = '₱#,##0.00';
                }

                for (let col = 1; col <= 6; col++) {
                    itemRow.getCell(col).border = {
                        top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
                        bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
                        left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
                        right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
                    };
                }
                
                if (itemNumber % 2 === 0) {
                    for (let col = 1; col <= 6; col++) {
                        itemRow.getCell(col).fill = { 
                            type: 'pattern', 
                            pattern: 'solid', 
                            fgColor: { argb: 'FFF2F2F2' } 
                        };
                    }
                }
                
                rowIndex++;
            });
            
            rowIndex++;
        });
        
        rowIndex++;

        const subtotal = parseNumber(document.getElementById('subtotal').textContent);
        const markupRate = parseNumber(document.getElementById('taxRate').value) || 18;
        const markupAmount = parseNumber(document.getElementById('taxAmount').textContent);
        const grandTotal = parseNumber(document.getElementById('grandTotal').textContent);
        
        const subtotalRow = worksheet.getRow(rowIndex);
        subtotalRow.getCell(5).value = 'Subtotal:';
        subtotalRow.getCell(5).font = { bold: true };
        subtotalRow.getCell(5).alignment = { horizontal: 'right' };
        subtotalRow.getCell(6).value = subtotal;
        subtotalRow.getCell(6).numFmt = '₱#,##0.00';
        subtotalRow.getCell(6).font = { bold: true };
        rowIndex++;
        
        const markupRow = worksheet.getRow(rowIndex);
        markupRow.getCell(5).value = `Markup (${markupRate}%):`;
        markupRow.getCell(5).font = { bold: true };
        markupRow.getCell(5).alignment = { horizontal: 'right' };
        markupRow.getCell(6).value = markupAmount;
        markupRow.getCell(6).numFmt = '₱#,##0.00';
        markupRow.getCell(6).font = { bold: true };
        rowIndex++;
        
        rowIndex++;
        const grandTotalRow = worksheet.getRow(rowIndex);
        
        grandTotalRow.getCell(5).value = 'GRAND TOTAL:';
        grandTotalRow.getCell(5).font = { bold: true, size: 12 };
        grandTotalRow.getCell(5).alignment = { horizontal: 'right' };
        grandTotalRow.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6E0B4' } };
        grandTotalRow.getCell(5).border = {
            bottom: { style: 'double', color: { argb: 'FF000000' } }
        };
        
        grandTotalRow.getCell(6).value = grandTotal;
        grandTotalRow.getCell(6).numFmt = '₱#,##0.00';
        grandTotalRow.getCell(6).font = { bold: true, size: 12 };
        grandTotalRow.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6E0B4' } };
        grandTotalRow.getCell(6).border = {
            bottom: { style: 'double', color: { argb: 'FF000000' } }
        };        

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        const timestamp = new Date().getTime();
        const fileName = `${projectName.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.xlsx`;
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
            URL.revokeObjectURL(link.href);
        }, 100);
        
        setTimeout(() => {
            if (typeof window.showNotification === 'function') {
                showNotification(`✅ Excel file downloaded: <strong>${fileName}</strong>`, 'success');
            } else {
                console.log(`✅ Excel file downloaded: ${fileName}`);
            }
        }, 300);
        
    } catch (error) {
        console.error('❌ Error generating Excel:', error);
        alert('❌ Error generating Excel: ' + error.message + '\n\nTrying alternative method...');
        exportExcelLegacy();
    } finally {
        if (buttonElement) {
            buttonElement.innerHTML = '<i class="bi bi-file-earmark-excel me-1"></i> Export to Excel';
            buttonElement.disabled = false;
        }
    }
};

function exportExcelLegacy() {
    console.log('Using SheetJS fallback method...');
    alert('Using basic Excel export (Professional version failed)');
}

window.exportExcel = function() {
    const proButton = document.querySelector('button[onclick*="exportExcelProfessional"]');
    if (proButton) {
        proButton.click();
    } else {
        exportExcelLegacy();
    }
};

console.log('✅ Excel exporter loaded (Professional + Legacy)');