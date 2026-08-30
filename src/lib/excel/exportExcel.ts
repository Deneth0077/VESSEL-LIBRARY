import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import dbConnect from '@/lib/db/connect';
import Vessel from '@/models/Vessel';
import VesselEntry from '@/models/VesselEntry';

/**
 * Helper to resolve image buffer and extension from photo URL
 */
async function getPhotoBufferAndExt(
  url: string
): Promise<{ buffer: Buffer; extension: 'jpeg' | 'png' | 'gif' } | null> {
  try {
    if (!url) return null;

    // Local file path under /public/uploads/
    if (url.startsWith('/uploads/')) {
      const cleanPath = url.replace(/^\/uploads\//, '');
      const filePath = path.join(process.cwd(), 'public', 'uploads', cleanPath);
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        const ext = cleanPath.split('.').pop()?.toLowerCase();
        const extension = ext === 'png' ? 'png' : ext === 'gif' ? 'gif' : 'jpeg';
        return { buffer, extension };
      }
    }

    // Base64 data URL
    if (url.startsWith('data:image/')) {
      const parts = url.split(',');
      const meta = parts[0];
      const base64Data = parts[1];
      const ext = meta.includes('png') ? 'png' : meta.includes('gif') ? 'gif' : 'jpeg';
      const buffer = Buffer.from(base64Data, 'base64');
      return { buffer, extension: ext };
    }

    // Remote HTTP / Cloudinary URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        const urlLower = url.toLowerCase();
        const extension = urlLower.includes('.png') ? 'png' : urlLower.includes('.gif') ? 'gif' : 'jpeg';
        return { buffer, extension };
      }
    }

    return null;
  } catch (err) {
    console.error('Error fetching image for Excel export:', err);
    return null;
  }
}

export async function generateVesselExcelWorkbook(): Promise<Buffer> {
  await dbConnect();

  const vessels = await Vessel.find().sort({ vesselName: 1 }).lean();
  const entries = await VesselEntry.find().sort({ createdAt: -1 }).lean();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'VESSEL LIBRARY System';
  workbook.lastModifiedBy = 'VESSEL LIBRARY System';
  workbook.created = new Date();

  // Primary Header Style (Navy Blue)
  const headerFillNavy: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF002B49' },
  };

  // Special Notes Header Style (Red Accent)
  const headerFillRed: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFC53030' },
  };

  const headerFont: Partial<ExcelJS.Font> = {
    name: 'Segoe UI',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  };

  const styleSheetHeader = (worksheet: ExcelJS.Worksheet, isRedHeader = false) => {
    const headerRow = worksheet.getRow(1);
    headerRow.height = 32;
    headerRow.eachCell((cell) => {
      cell.fill = isRedHeader ? headerFillRed : headerFillNavy;
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });
  };

  // ==========================================
  // SHEET 1: Vessel Master Directory
  // ==========================================
  const sheet1 = workbook.addWorksheet('Vessel Directory');
  sheet1.columns = [
    { header: 'Vessel Name', key: 'vesselName', width: 24 },
    { header: 'IMO Number', key: 'imoNumber', width: 16 },
    { header: 'Vessel Type', key: 'vesselType', width: 18 },
    { header: 'Flag State', key: 'flag', width: 16 },
    { header: 'Shipping Line', key: 'ownerOperator', width: 25 },
    { header: 'Call Sign', key: 'callSign', width: 14 },
    { header: 'Year Built', key: 'yearBuilt', width: 12 },
    { header: 'LOA (Length Over All)', key: 'loa', width: 22 },
    { header: 'Beam', key: 'beam', width: 14 },
    { header: 'Keel to Deck', key: 'keelToDeck', width: 18 },
    { header: 'Bays', key: 'numberOfBays', width: 12 },
    { header: 'Rows', key: 'numberOfRows', width: 12 },
    { header: 'Lashing Bridges', key: 'lashingBridges', width: 16 },
    { header: 'Bridge Height', key: 'lashingBridgeHeight', width: 16 },
    { header: 'Additional Specs & Notes', key: 'basicInformation', width: 45 },
    { header: 'Main Photograph (Thumbnail)', key: 'mainPhotoCol', width: 28 },
    { header: 'Created Date', key: 'createdDate', width: 18 },
  ];

  for (let i = 0; i < vessels.length; i++) {
    const v = vessels[i];
    const rowIndex = i + 2;

    const row = sheet1.addRow({
      vesselName: v.vesselName,
      imoNumber: v.imoNumber,
      vesselType: v.vesselType,
      flag: v.flag,
      ownerOperator: v.ownerOperator,
      callSign: v.callSign,
      yearBuilt: v.yearBuilt,
      loa: v.loa || 'N/A',
      beam: v.beam || 'N/A',
      keelToDeck: v.keelToDeck || 'N/A',
      numberOfBays: v.numberOfBays || 'N/A',
      numberOfRows: v.numberOfRows || 'N/A',
      lashingBridges: v.lashingBridges || 'N/A',
      lashingBridgeHeight: v.lashingBridgeHeight || 'N/A',
      basicInformation: v.basicInformation || 'N/A',
      mainPhotoCol: '',
      createdDate: v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '',
    });

    row.height = 85;
    row.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    row.eachCell((cell) => { cell.border = thinBorder; });

    // Embed main photograph into Excel cell
    if (v.mainPhotographs && v.mainPhotographs.length > 0) {
      const firstPhoto = v.mainPhotographs[0];
      const photoObj = await getPhotoBufferAndExt(firstPhoto.url);

      if (photoObj) {
        const imageId = workbook.addImage({
          base64: photoObj.buffer.toString('base64'),
          extension: photoObj.extension,
        });

        sheet1.addImage(imageId, {
          tl: { col: 15.05, row: rowIndex - 1 + 0.05 },
          ext: { width: 135, height: 75 },
          editAs: 'oneCell',
        });
      }
    }
  }

  styleSheetHeader(sheet1);

  // Helper map for vessel reference
  const vesselMap = new Map<string, { name: string; imo: string }>();
  vessels.forEach((v) => {
    vesselMap.set(v._id.toString(), { name: v.vesselName, imo: v.imoNumber || '' });
  });

  const sectionConfigs = [
    { key: 'STRUCTURE', name: '2. Vessel Structure', isRed: false },
    { key: 'STRUCTURAL_DAMAGE', name: '3. Structural Damages', isRed: false },
    { key: 'OPERATIONAL_CHALLENGE', name: '4. Operational Challenges', isRed: false },
    { key: 'SPECIAL_NOTE', name: '5. Special Notes', isRed: true },
    { key: 'REMARK', name: '6. On Board Safety', isRed: false },
    { key: 'VESSEL_COORDINATION', name: '7. Vessel Coordination', isRed: false },
  ];

  // ==========================================
  // SHEETS 2-7: Technical Sections & Entry Photos
  // ==========================================
  for (const config of sectionConfigs) {
    const sheet = workbook.addWorksheet(config.name);
    sheet.columns = [
      { header: 'Vessel Name', key: 'vesselName', width: 22 },
      { header: 'IMO Number', key: 'imoNumber', width: 16 },
      { header: 'Category / Component', key: 'category', width: 24 },
      { header: 'Safety Status', key: 'safetyStatus', width: 16 },
      { header: 'Entry Description / Comments', key: 'text', width: 50 },
      { header: 'Solution / Action Taken', key: 'solution', width: 45 },
      { header: 'Attached Photograph (Thumbnail)', key: 'photoCol', width: 28 },
      { header: 'User Stamp (Added By)', key: 'addedBy', width: 25 },
      { header: 'Updated Date & Time', key: 'date', width: 22 },
    ];

    const sectionEntries = entries.filter((e) => e.section === config.key);

    for (let j = 0; j < sectionEntries.length; j++) {
      const e = sectionEntries[j];
      const rowIndex = j + 2;
      const vesselInfo = vesselMap.get(e.vesselId.toString()) || { name: 'Unknown', imo: 'N/A' };

      const row = sheet.addRow({
        vesselName: vesselInfo.name,
        imoNumber: vesselInfo.imo,
        category: e.category || 'General',
        safetyStatus: e.safetyStatus || 'N/A',
        text: e.text,
        solution: e.solution || 'N/A',
        photoCol: '',
        addedBy: `${e.createdByName || 'Unknown'} (${e.createdBy || ''})`,
        date: e.createdAt ? new Date(e.createdAt).toLocaleString() : '',
      });

      row.height = 85;
      row.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      row.eachCell((cell) => { cell.border = thinBorder; });

      // Embed entry photograph thumbnail into Excel cell
      if (e.photographs && e.photographs.length > 0) {
        const firstPhoto = e.photographs[0];
        const photoObj = await getPhotoBufferAndExt(firstPhoto.url);

        if (photoObj) {
          const imageId = workbook.addImage({
            base64: photoObj.buffer.toString('base64'),
            extension: photoObj.extension,
          });

          sheet.addImage(imageId, {
            tl: { col: 6.05, row: rowIndex - 1 + 0.05 },
            ext: { width: 135, height: 75 },
            editAs: 'oneCell',
          });
        }
      }
    }

    styleSheetHeader(sheet, config.isRed);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
