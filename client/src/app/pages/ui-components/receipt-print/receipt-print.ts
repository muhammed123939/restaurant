

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

//for pdf only 
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-receipt-print',
  standalone: true,
  imports: [CommonModule , TranslateModule],
  templateUrl: './receipt-print.html',
  styleUrl: './receipt-print.scss',
})
export class ReceiptPrint implements OnInit {

  receipt: any;
employee : any ; 

  ngOnInit(): void {
    
  const employeeData = localStorage.getItem('employeeLoginStorage');
   this.employee = employeeData ? JSON.parse(employeeData) : null;

    

    this.receipt = history.state.receipt;

    // // auto print only reciept 
    // setTimeout(() => {
    //   if (this.receipt?.items?.length) {
    //     this.printReceipt();
    //   }
    // }, 500);
   
  setTimeout(() => {
  Swal.fire({
    title: 'Receipt Ready',
    text: 'Do you want to download PDF?',
    icon: 'success',
    showCancelButton: true,
    confirmButtonText: 'Download',
    cancelButtonText: 'Skip'
  }).then(res => {
    if (res.isConfirmed) {
      this.printReceipt();
    }
  });
}, 300);
  }

async printReceipt() {
  const element = document.getElementById('receipt');
  if (!element) return;

  const canvas = await html2canvas(element, {
      scale: 3,
  useCORS: true,
  windowWidth: element.scrollWidth,
  scrollX: 0,
  scrollY: 0,
  width: element.offsetWidth,
  height: element.offsetHeight
  });

  const imgData = canvas.toDataURL('image/png');

const pdf = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: [80, 250]
});

const pdfWidth = 80;
const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

  pdf.save(`receipt-${this.receipt.orderNumber}.pdf`);
}

//for reciept print machine 
  // printReceipt() {
  //   const printContent = document.getElementById('receipt')?.outerHTML;

  //   if (!printContent) return;

  //   const WindowPrt = window.open('', '', 'width=400,height=600');

  //   WindowPrt?.document.write(`
  //     <html>
  //       <head>
  //         <title>Receipt</title>
  //         <style>
  //           body {
  //             font-family: monospace;
  //             margin: 0;
  //             padding: 0;
  //           }

  //           .receipt {
  //             width: 80mm;
  //             font-size: 12px;
  //             padding: 5px;
  //           }

  //           .header, .footer {
  //             text-align: center;
  //           }

  //           hr {
  //             border: none;
  //             border-top: 1px dashed #000;
  //             margin: 5px 0;
  //           }

  //           .row {
  //             display: flex;
  //             justify-content: space-between;
  //           }

  //           .row.title {
  //             font-weight: bold;
  //           }

  //           .name {
  //             width: 50%;
  //           }
  //         </style>
  //       </head>

  //       <body onload="window.print(); window.close();">
  //         ${printContent}
  //       </body>
  //     </html>
  //   `);

  //   WindowPrt?.document.close();
  // }
}