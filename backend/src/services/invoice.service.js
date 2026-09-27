import puppeteer from "puppeteer";

// One shared headless Chromium instance for the life of the process instead
// of launching a fresh browser (slow, ~1-2s) per invoice download. If that
// browser ever crashes or disconnects, clear the cache so the next call
// launches a replacement instead of reusing a dead connection forever
// (previously every receipt download would fail with "Connection closed"
// until the whole server was restarted).
let browserPromise = null;
function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer
      .launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      })
      .then((browser) => {
        browser.once("disconnected", () => {
          browserPromise = null;
        });
        return browser;
      });
    browserPromise.catch(() => {
      browserPromise = null;
    });
  }
  return browserPromise;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

function rupees(paise) {
  return `₹ ${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

const GUITAR_ILLUSTRATION_URL = "https://res.cloudinary.com/vpetrpeu/image/upload/v1790244473/invoice.png";

// `data` shape:
// { invoiceNo, issueDate, business: {name, address, phone, email, website},
//   student: {name, className, batchName, admissionNo, phone},
//   items: [{description, subLabel, period, qty, amountPaise}],
//   subtotalPaise, discountPaise, totalPaise,
//   payment: {mode, transactionId, paidAtLabel} }
function buildInvoiceHtml(data) {
  const { business, student, items, payment } = data;

  const itemRows = items
    .map(
      (item, i) => `
        <tr>
          <td class="idx">${i + 1}</td>
          <td class="desc">
            <div class="desc-main">${escapeHtml(item.description)}</div>
            ${item.subLabel ? `<div class="desc-sub">${escapeHtml(item.subLabel)}</div>` : ""}
          </td>
          <td>${escapeHtml(item.period || "-")}</td>
          <td class="center">${item.qty}</td>
          <td class="amount">${rupees(item.amountPaise)}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Dancing+Script:wght@600&family=Inter:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', Arial, sans-serif;
    color: #374151;
    background: #FAF8F6;
    font-size: 12px;
  }
  .page { width: 800px; margin: 0 auto; padding: 40px 42px 50px; background: #FAF8F6; }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 22px; border-bottom: 2px solid #F3D9E6; }
  .brand { display: flex; align-items: center; gap: 14px; }
  .brand-mark {
    width: 56px; height: 56px; border-radius: 999px; background: #FDE6EF;
    display: flex; align-items: center; justify-content: center; font-size: 30px; color: #E91E63;
  }
  .brand-name { font-family: 'Playfair Display', serif; font-size: 24px; line-height: 1.15; }
  .brand-name .pink { color: #E91E63; font-weight: 700; }
  .brand-name .dark { color: #1a1a2e; font-weight: 700; }
  .brand-tag { margin-top: 4px; font-size: 10px; letter-spacing: 2px; color: #F0A8C4; font-weight: 600; }

  .contact { text-align: right; font-size: 11px; color: #4b5563; line-height: 1.9; }
  .contact div { display: flex; justify-content: flex-end; align-items: center; gap: 6px; }
  .contact .icon { color: #E91E63; font-size: 12px; width: 14px; text-align: center; }

  /* Invoice title */
  .invoice-top { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 28px; }
  .invoice-title { font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 700; color: #E91E63; letter-spacing: 1px; }
  .invoice-sub { margin-top: 8px; font-size: 12px; color: #1a1a2e; font-weight: 600; }
  .invoice-sub-2 { margin-top: 2px; font-size: 11px; color: #9ca3af; }
  .invoice-underline { width: 46px; height: 3px; background: #E91E63; margin-top: 12px; border-radius: 2px; }

  .meta { width: 230px; font-size: 11px; }
  .meta-row { display: flex; justify-content: space-between; align-items: center; gap: 14px; margin-bottom: 8px; }
  .meta-label { color: #9ca3af; }
  .meta-value { color: #1a1a2e; font-weight: 600; text-align: right; }
  .pill { display: inline-block; padding: 2px 12px; border-radius: 999px; font-size: 10px; font-weight: 700; }
  .pill-paid { background: #DCFCE7; color: #15803D; }
  .pill-pending { background: #FEF9C3; color: #A16207; }

  /* Content row: student box + illustration */
  .content-row { display: flex; gap: 24px; margin-top: 26px; align-items: stretch; }
  .student-box { flex: 1; background: #FDF2F8; border-radius: 14px; padding: 20px 22px; }
  .student-box h3 { font-family: 'Playfair Display', serif; color: #E91E63; font-size: 15px; margin-bottom: 12px; }
  .student-row { display: flex; font-size: 11.5px; margin-bottom: 8px; }
  .student-label { width: 108px; color: #6b7280; }
  .student-sep { width: 14px; color: #d1d5db; }
  .student-value { color: #1a1a2e; font-weight: 600; }

  .illustration { width: 220px; display: flex; align-items: center; justify-content: center; position: relative; }
  .illustration svg { width: 100%; height: auto; }
  .illustration img { width: 100%; height: auto; object-fit: contain; }

  /* Table */
  table.items { width: 100%; border-collapse: collapse; margin-top: 26px; }
  table.items thead th {
    background: #FCE7F3; color: #9D174D; text-align: left; font-size: 10.5px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.3px; padding: 11px 10px; white-space: nowrap;
  }
  table.items thead th:first-child { border-radius: 8px 0 0 8px; }
  table.items thead th:last-child { border-radius: 0 8px 8px 0; text-align: right; }
  table.items tbody td { padding: 13px 14px; font-size: 11.5px; border-bottom: 1px solid #f1e5eb; vertical-align: top; }
  table.items tbody td.idx { color: #9ca3af; }
  table.items tbody td.center { text-align: center; }
  table.items tbody td.amount { text-align: right; font-weight: 700; color: #1a1a2e; }
  .desc-main { font-weight: 700; color: #1a1a2e; }
  .desc-sub { font-size: 10px; color: #9ca3af; margin-top: 2px; }

  /* Totals */
  .totals { width: 300px; margin-left: auto; margin-top: 18px; }
  .totals-row { display: flex; justify-content: space-between; font-size: 12px; padding: 6px 4px; color: #4b5563; }
  .totals-row.total { margin-top: 6px; border-top: 2px solid #F3D9E6; padding-top: 12px; font-size: 15px; font-weight: 700; color: #E91E63; }

  /* Payment info + footer */
  .bottom-row { display: flex; justify-content: space-between; gap: 24px; margin-top: 30px; }
  .payment-box { flex: 1; background: #FDF2F8; border-radius: 14px; padding: 18px 22px; }
  .payment-box h3 { font-family: 'Playfair Display', serif; color: #E91E63; font-size: 14px; margin-bottom: 10px; }
  .note { flex: 1; font-size: 11px; color: #4b5563; line-height: 1.8; padding-top: 4px; }
  .note .regards { margin-top: 14px; font-weight: 600; color: #1a1a2e; }

  .closing { margin-top: 34px; display: flex; justify-content: space-between; align-items: flex-end; }
  .closing-script { font-family: 'Dancing Script', cursive; font-size: 26px; color: #E91E63; }
</style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="brand">
        <div class="brand-mark">&#9835;</div>
        <div>
          <div class="brand-name"><span class="pink">${escapeHtml(business.namePink)}</span><br/><span class="dark">${escapeHtml(business.nameDark)}</span></div>
          <div class="brand-tag">LEARN &bull; PLAY &bull; GROW</div>
        </div>
      </div>
      <div class="contact">
        ${business.address ? `<div><span class="icon">&#128205;</span>${escapeHtml(business.address)}</div>` : ""}
        ${business.phone ? `<div><span class="icon">&#9742;</span>${escapeHtml(business.phone)}</div>` : ""}
        ${business.email ? `<div><span class="icon">&#9993;</span>${escapeHtml(business.email)}</div>` : ""}
        ${business.website ? `<div><span class="icon">&#127760;</span>${escapeHtml(business.website)}</div>` : ""}
      </div>
    </div>

    <div class="invoice-top">
      <div>
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-sub">Thank you for being a part of our music family!</div>
        <div class="invoice-sub-2">Here's your payment receipt for the services availed.</div>
        <div class="invoice-underline"></div>
      </div>
      <div class="meta">
        <div class="meta-row"><span class="meta-label">Invoice No</span><span class="meta-value">${escapeHtml(data.invoiceNo)}</span></div>
        <div class="meta-row"><span class="meta-label">Issue Date</span><span class="meta-value">${escapeHtml(data.issueDate)}</span></div>
        <div class="meta-row"><span class="meta-label">Payment Status</span><span class="pill ${data.paid ? "pill-paid" : "pill-pending"}">${data.paid ? "Paid" : "Pending"}</span></div>
      </div>
    </div>

    <div class="content-row">
      <div class="student-box">
        <h3>Student Details</h3>
        <div class="student-row"><span class="student-label">Name</span><span class="student-sep">:</span><span class="student-value">&nbsp;${escapeHtml(student.name)}</span></div>
        <div class="student-row"><span class="student-label">Class</span><span class="student-sep">:</span><span class="student-value">&nbsp;${escapeHtml(student.className)}</span></div>
        <div class="student-row"><span class="student-label">Batch</span><span class="student-sep">:</span><span class="student-value">&nbsp;${escapeHtml(student.batchName)}</span></div>
        <div class="student-row"><span class="student-label">Admission No.</span><span class="student-sep">:</span><span class="student-value">&nbsp;${escapeHtml(student.admissionNo)}</span></div>
        <div class="student-row"><span class="student-label">Phone</span><span class="student-sep">:</span><span class="student-value">&nbsp;${escapeHtml(student.phone)}</span></div>
      </div>
      <div class="illustration">
        <img src="${GUITAR_ILLUSTRATION_URL}" alt="Guitar" />
      </div>
    </div>

    <table class="items">
      <thead>
        <tr>
          <th style="width:32px;">#</th>
          <th>Description</th>
          <th style="width:135px;">Duration / Period</th>
          <th style="width:50px;" class="center">Qty</th>
          <th style="width:110px;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row"><span>Subtotal</span><span>${rupees(data.subtotalPaise)}</span></div>
      <div class="totals-row"><span>Discount</span><span>${rupees(data.discountPaise)}</span></div>
      <div class="totals-row total"><span>Total Amount</span><span>${rupees(data.totalPaise)}</span></div>
    </div>

    <div class="bottom-row">
      <div class="payment-box">
        <h3>Payment Information</h3>
        <div class="student-row"><span class="student-label">Payment Mode</span><span class="student-sep">:</span><span class="student-value">&nbsp;${escapeHtml(payment.mode)}</span></div>
        <div class="student-row"><span class="student-label">Transaction ID</span><span class="student-sep">:</span><span class="student-value">&nbsp;${escapeHtml(payment.transactionId)}</span></div>
        <div class="student-row"><span class="student-label">Payment Date</span><span class="student-sep">:</span><span class="student-value">&nbsp;${escapeHtml(payment.paidAtLabel)}</span></div>
      </div>
      <div class="note">
        If you have any questions, feel free to contact us at ${escapeHtml(business.phone)} or ${escapeHtml(business.email)}.
        <div class="regards">Best regards,<br/>${escapeHtml(business.nameDark ? `${business.namePink} ${business.nameDark}` : business.namePink)}</div>
      </div>
    </div>

    <div class="closing">
      <div class="closing-script">Keep Making Music &hearts;</div>
    </div>
  </div>
</body>
</html>`;
}

export async function renderInvoicePdf(data) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    const html = buildInvoiceHtml(data);
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      printBackground: true,
      width: "880px",
      height: "1250px",
    });
    return pdf;
  } finally {
    await page.close();
  }
}
