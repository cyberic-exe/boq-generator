/* global parseNumber, showNotification */

function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('portrait', 'mm', 'a4');
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yOffset = margin;
    
    const form = document.getElementById('boqForm');
    const projectInfo = Object.fromEntries(new FormData(form));
    const projectName = form.project_name.value.trim() || "Untitled Project";
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text("BILL OF QUANTITIES", pageWidth / 2, yOffset, { align: "center" });
    yOffset += 8;
    
    doc.setFontSize(14);
    doc.text(projectName, pageWidth / 2, yOffset, { align: "center" });
    yOffset += 10;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    let infoX = margin;
    let infoY = yOffset;
    
    const leftInfo = [
        ['Project:', projectInfo.project_name],
        ['Client:', projectInfo.client_name],
        ['Company:', projectInfo.company_name]
    ];
    
    const rightInfo = [
        ['Location:', projectInfo.location],
        ['Prepared By:', projectInfo.prepared_by],
        ['Date:', new Date().toLocaleDateString()]
    ];
    
    leftInfo.forEach(([label, value]) => {
        if (value) {
            doc.setFont(undefined, 'bold');
            doc.text(`${label}`, infoX, infoY);
            doc.setFont(undefined, 'normal');
            doc.text(value, infoX + 20, infoY);
            infoY += 5;
        }
    });
    
    infoY = yOffset;
    infoX = pageWidth / 2;
    rightInfo.forEach(([label, value]) => {
        if (value) {
            doc.setFont(undefined, 'bold');
            doc.text(`${label}`, infoX, infoY);
            doc.setFont(undefined, 'normal');
            doc.text(value, infoX + 25, infoY);
            infoY += 5;
        }
    });
    
    yOffset = Math.max(yOffset + 5, infoY + 5);
    
    let itemNumber = 1;
    const categories = document.querySelectorAll('.category-block');
    
    categories.forEach((categoryDiv, catIndex) => {
        const categoryName = categoryDiv.querySelector('h6').textContent;
        
        if (yOffset > 250 && catIndex > 0) {
            doc.addPage();
            yOffset = margin;
        }
        
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(categoryName.toUpperCase(), margin, yOffset);
        yOffset += 6;
        
        const rows = [];
        categoryDiv.querySelectorAll('tbody tr').forEach(row => {
            const cells = row.querySelectorAll('input');
            const qty = parseNumber(cells[2].value);
            const rate = parseNumber(cells[3].value);
            const amount = rate * qty;
            
            rows.push([
                itemNumber++,
                cells[0].value || "",
                cells[1].value || "",
                qty.toFixed(2),
                rate.toFixed(2),
                amount.toFixed(2)
            ]);
        });
        
        doc.autoTable({
            head: [['No.', 'Description', 'Unit', 'Qty', 'Rate', 'Amount']],
            body: rows,
            startY: yOffset,
            margin: { left: margin, right: margin },
            styles: {
                fontSize: 9,
                cellPadding: 3,
                overflow: 'linebreak',
                lineColor: [50, 50, 50],
                lineWidth: 0.3
            },
            headStyles: {
                fillColor: [240, 240, 240],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                halign: 'center',
                lineWidth: 0.3
            },
            bodyStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineWidth: 0.3
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15, lineWidth: 0.3 },
            1: { halign: 'left', cellWidth: 70, lineWidth: 0.3 },
            2: { halign: 'center', cellWidth: 20, lineWidth: 0.3 },
            3: { halign: 'right', cellWidth: 20, lineWidth: 0.3 },
            4: { halign: 'right', cellWidth: 25, lineWidth: 0.3 },
            5: { halign: 'right', cellWidth: 30, lineWidth: 0.3 }
        },
            didDrawPage: (data) => {
                yOffset = data.cursor.y + 5;
            }
        });
        
        yOffset += 3;
    });
    
    if (yOffset > 220) {
        doc.addPage();
        yOffset = margin;
    }
    
    const subtotal = parseNumber(document.getElementById('subtotal').textContent);
    const markupRate = document.getElementById('taxRate').value || 18;
    const taxAmount = parseNumber(document.getElementById('taxAmount').textContent);
    const grandTotal = parseNumber(document.getElementById('grandTotal').textContent);
    
    const totalsX = pageWidth - margin - 80;
    
    doc.autoTable({
        body: [
            ['Subtotal:', subtotal.toFixed(2)],
            [`Markup (${markupRate}%):`, taxAmount.toFixed(2)],
            ['GRAND TOTAL:', `PHP ${grandTotal.toFixed(2)}`]
        ],
        startY: yOffset,
        margin: { left: totalsX, right: margin },
        tableWidth: 80,
        styles: {
            fontSize: 10,
            cellPadding: 4,
            lineColor: [0, 0, 0],
            lineWidth: 0.5
        },
        bodyStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            lineWidth: 0.5
        },
        columnStyles: {
            0: { halign: 'right', cellWidth: 50, lineWidth: 0.5 },
            1: { halign: 'right', cellWidth: 30, lineWidth: 0.5 }
        },
        willDrawCell: (data) => {
            if (data.row.index === 2) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fontSize = 11;
            }
        }
    });
    
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text(
            `Page ${i} of ${totalPages}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
        );
        doc.text(
            `Generated: ${new Date().toLocaleString()}`,
            margin,
            doc.internal.pageSize.getHeight() - 10
        );
    }
    
    const fileName = `${projectName.replace(/[^a-z0-9]/gi, '_')}_BOQ.pdf`;
    doc.save(fileName);
    
    setTimeout(() => {
        if (window.showNotification) {
            showNotification(`✅ PDF file downloaded: ${fileName}`, 'success');
        }
    }, 300);
}

window.exportPDF = exportPDF;