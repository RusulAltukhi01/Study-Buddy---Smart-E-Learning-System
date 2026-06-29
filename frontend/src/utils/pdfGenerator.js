import jsPDF from "jspdf";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
} from "docx";



export const downloadAsPDF = (content, fileName, options = {}) => {
  const {
    title = fileName,
    fontSize = 10,
    lineHeight = 6,
    margin = 15,
    includeMetadata = true,
    orientation = "portrait",
  } = options;

  const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxLineWidth = pageWidth - margin * 2;

  if (includeMetadata) {
    doc.setProperties({
      title,
      subject: "Generated Summary",
      creator: "StudyBridge",
      keywords: "summary, ai, education",
      creationDate: new Date(),
    });
  }

 
  const addHeader = () => {
    
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, 36, "F");

    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    const titleText = doc.splitTextToSize(`Summary: ${fileName}`, maxLineWidth - 10);
    doc.text(titleText, margin, 14);

    
    doc.setDrawColor(16, 185, 129); 
    doc.setLineWidth(0.8);
    doc.line(margin, 20, pageWidth - margin, 20);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`Generated on ${date}`, pageWidth - margin, 27, { align: "right" });

  
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "normal");
  };


  const addFooter = (pageNumber, totalHint = "") => {
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 8, { align: "center" });
    doc.setTextColor(0, 0, 0);
  };


  const CONTENT_TOP = 36;   
  const CONTENT_BOTTOM = pageHeight - 18;

  let yPosition = CONTENT_TOP + 8;
  let pageNumber = 1;


  addHeader();


  const lines = content.split("\n");

  
  const contentLines = lines.filter(
    (l) => !l.startsWith("# Summary:") && !l.startsWith("# ")
  );

  contentLines.forEach((line) => {

    if (yPosition > CONTENT_BOTTOM) {
      addFooter(pageNumber);
      doc.addPage();
      pageNumber++;
      addHeader();
      yPosition = CONTENT_TOP + 8;
    }


    if (line.startsWith("## ")) {
      yPosition += 5;

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(5, 150, 105); 

      const text = line.replace(/^##\s*/, "");
      const wrapped = doc.splitTextToSize(text, maxLineWidth);
      wrapped.forEach((w) => {
        if (yPosition > CONTENT_BOTTOM) {
          addFooter(pageNumber);
          doc.addPage();
          pageNumber++;
          addHeader();
          yPosition = CONTENT_TOP + 8;
        }
        doc.text(w, margin, yPosition);
        yPosition += lineHeight * 1.3;
      });

      
      doc.setDrawColor(209, 250, 229);
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition - 2, margin + 60, yPosition - 2);

      doc.setFontSize(fontSize);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      yPosition += 2;
      return;
    }

    
    if (line.startsWith("   - ") || line.startsWith("    - ")) {
      const clean = line.replace(/^\s*-\s*/, "");
      const wrapped = doc.splitTextToSize(clean, maxLineWidth - 12);

      doc.setTextColor(71, 85, 105);
      wrapped.forEach((w, i) => {
        if (yPosition > CONTENT_BOTTOM) {
          addFooter(pageNumber);
          doc.addPage();
          pageNumber++;
          addHeader();
          yPosition = CONTENT_TOP + 8;
        }
        doc.text((i === 0 ? "◦ " : "  ") + w, margin + 8, yPosition);
        yPosition += lineHeight * 0.95;
      });
      doc.setTextColor(0, 0, 0);
      return;
    }


    if (line.startsWith("- ") || line.startsWith("• ")) {
      const clean = line.replace(/^[-•]\s*/, "");
      const wrapped = doc.splitTextToSize(clean, maxLineWidth - 6);

      doc.setTextColor(30, 41, 59);
      wrapped.forEach((w, i) => {
        if (yPosition > CONTENT_BOTTOM) {
          addFooter(pageNumber);
          doc.addPage();
          pageNumber++;
          addHeader();
          yPosition = CONTENT_TOP + 8;
        }
        doc.text((i === 0 ? "• " : "  ") + w, margin + 3, yPosition);
        yPosition += lineHeight;
      });
      doc.setTextColor(0, 0, 0);
      return;
    }

    
    if (!line.trim()) {
      yPosition += 2.5;
      return;
    }


    const wrapped = doc.splitTextToSize(line, maxLineWidth);
    doc.setTextColor(51, 65, 85);
    wrapped.forEach((w) => {
      if (yPosition > CONTENT_BOTTOM) {
        addFooter(pageNumber);
        doc.addPage();
        pageNumber++;
        addHeader();
        yPosition = CONTENT_TOP + 8;
      }
      doc.text(w, margin, yPosition);
      yPosition += lineHeight;
    });
    doc.setTextColor(0, 0, 0);
  });

  
  addFooter(pageNumber);

  const safeFileName = fileName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  doc.save(`${safeFileName}_summary.pdf`);
};


export const formatSummaryForPDF = (summary, format, fileName) => {
  if (!summary) return "";

  const header = `# Summary: ${fileName}\n\n`;

  const clean = summary
    .replace(/Here are.*?:/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const lines = clean.split("\n").filter((l) => l.trim());

  const body = lines
    .map((line) => {
      if (line.startsWith("## ")) return line;
      if (line.startsWith("   - ") || line.startsWith("    - ")) return line;
      if (line.startsWith("- ") || line.startsWith("• ")) return line;
      
      return `- ${line.replace(/^[-•]\s*/, "")}`;
    })
    .join("\n");

  return header + body;
};


export const copySummaryToClipboard = async (summary, fileName, format) => {
  const formattedSummary = formatSummaryForPDF(summary, format, fileName);
  try {
    await navigator.clipboard.writeText(formattedSummary);
    return { success: true };
  } catch (err) {
    console.error("Failed to copy:", err);
    return { success: false, error: err.message };
  }
};


export const downloadElementAsPDF = (element, fileName) => {
  const doc = new jsPDF();
  doc.html(element, {
    callback: (doc) => doc.save(`${fileName}.pdf`),
    margin: [15, 15, 15, 15],
    autoPaging: "text",
    x: 0,
    y: 0,
    width: 180,
    windowWidth: 800,
  });
};


export const downloadSummaryAsDocx = async (summary, fileName) => {
  const lines = summary.split("\n").filter((l) => l.trim());

  const children = lines.map((line) => {
    if (line.startsWith("## ")) {
      return new Paragraph({
        text: line.replace(/^##\s*/, ""),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 80 },
      });
    }
    if (line.startsWith("- ") || line.startsWith("• ")) {
      return new Paragraph({
        bullet: { level: 0 },
        children: [new TextRun({ text: line.replace(/^[-•]\s*/, ""), size: 22 })],
        spacing: { after: 60 },
      });
    }
    if (line.startsWith("   - ") || line.startsWith("    - ")) {
      return new Paragraph({
        bullet: { level: 1 },
        children: [new TextRun({ text: line.replace(/^\s*-\s*/, ""), size: 22 })],
        spacing: { after: 40 },
      });
    }
    return new Paragraph({
      children: [new TextRun({ text: line, size: 22 })],
      spacing: { after: 80 },
    });
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: `Summary: ${fileName}`,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
              color: "64748B",
              size: 18,
            }),
          ],
          spacing: { after: 320 },
        }),
        ...children,
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `summary-${fileName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.docx`;
  a.click();
  URL.revokeObjectURL(url);
};