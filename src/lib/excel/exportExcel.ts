import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import dbConnect from '@/lib/db/connect';
import Vessel from '@/models/Vessel';
import VesselEntry from '@/models/VesselEntry';

/**
 * Helper to resolve image buffer and extension from photo URL
 */
async function getPhotoBufferAndExt(url: string): Promise<{ buffer: Buffer; extension: 'jpeg' | 'png' | 'gif' } | null> {
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

    // Remote HTTP URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const res = await fetch(url);
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        const ext = url.split('.').pop()?.split('?')[0]?.toLowerCase();
        const extension = ext === 'png' ? 'png' : ext === 'gif' ? 'gif' : 'jpeg';
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

  const headerFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF002B49' }, // Navy Blue header
  };

  const headerFont: Partial<ExcelJS.Font> = {
    name: 'Arial',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };

  const styleSheetHeader = (worksheet: ExcelJS.Worksheet) => {
    const headerRow = worksheet.getRow(1);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });

    worksheet.columns.forEach((column) => {
      let maxLength = 14;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const val = cell.value ? cell.value.toString() : '';
        if (val.length > maxLength) {
          maxLength = val.length;
        }
      });
      column.width = Math.min(maxLength + 4, 50);
    });
  };

  // ==========================================
  // SHEET 1: Vessel Directory & Main Photos
  // ==========================================
  const sheet1 = workbook.addWorksheet('Vessel List');
  sheet1.columns = [
    { header: 'Vessel Name', key: 'vesselName', width: 22 },
    { header: 'IMO Number', key: 'imoNumber', width: 16 },
    { header: 'Vessel Type', key: 'vesselType', width: 18 },
    { header: 'Flag State', key: 'flag', width: 16 },
    { header: 'Owner / Operator', key: 'ownerOperator', width: 25 },
    { header: 'Call Sign', key: 'callSign', width: 14 },
    { header: 'Year Built', key: 'yearBuilt', width: 12 },
    { header: 'LOA (Length Over All)', key: 'loa', width: 20 },
    { header: 'Beam', key: 'beam', width: 14 },
    { header: 'Keel to Deck', key: 'keelToDeck', width: 16 },
    { header: 'Bays', key: 'numberOfBays', width: 12 },
    { header: 'Rows', key: 'numberOfRows', width: 12 },
    { header: 'Lashing Bridges', key: 'lashingBridges', width: 16 },
    { header: 'Bridge Height', key: 'lashingBridgeHeight', width: 16 },
    { header: 'Additional Specs & Notes', key: 'basicInformation', width: 35 },
    { header: 'Main Photograph', key: 'mainPhotoCol', width: 26 },
    { header: 'Photo Count', key: 'photoCount', width: 14 },
    { header: 'Created Date', key: 'createdDate', width: 18 },
  ];

  for (let i = 0; i < vessels.length; i++) {
    const v = vessels[i];
    const rowIndex = i + 2; // 1-indexed header is row 1
    const row = sheet1.addRow({
      vesselName: v.vesselName,
      imoNumber: v.imoNumber,
      vesselType: v.vesselType,
      flag: v.flag,
      ownerOperator: v.ownerOperator,
      callSign: v.callSign,
      yearBuilt: v.yearBuilt,
      loa: v.loa || '',
      beam: v.beam || '',
      keelToDeck: v.keelToDeck || '',
      numberOfBays: v.numberOfBays || '',
      numberOfRows: v.numberOfRows || '',
      lashingBridges: v.lashingBridges || '',
      lashingBridgeHeight: v.lashingBridgeHeight || '',
      basicInformation: v.basicInformation || '',
      mainPhotoCol: '',
      photoCount: v.mainPhotographs?.length || 0,
      createdDate: v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '',
    });

    row.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

    // Embed main photograph into Excel cell
    if (v.mainPhotographs && v.mainPhotographs.length > 0) {
      const firstPhoto = v.mainPhotographs[0];
      const photoObj = await getPhotoBufferAndExt(firstPhoto.url);

      if (photoObj) {
        row.height = 70; // Expand row height for image thumbnail
        const imageId = workbook.addImage({
          base64: photoObj.buffer.toString('base64'),
          extension: photoObj.extension,
        });

        sheet1.addImage(imageId, {
          tl: { col: 15.1, row: rowIndex - 1 + 0.1 },
          ext: { width: 110, height: 60 },
          editAs: 'oneCell',
        });
      }
    }
  }

  styleSheetHeader(sheet1);
  sheet1.getColumn('mainPhotoCol').width = 22;

  // Helper map for vessel reference
  const vesselMap = new Map<string, { name: string; imo: string }>();
  vessels.forEach((v) => {
    vesselMap.set(v._id.toString(), { name: v.vesselName, imo: v.imoNumber || '' });
  });

  const sectionConfigs = [
    { key: 'STRUCTURE', name: 'Vessel Structure' },
    { key: 'STRUCTURAL_DAMAGE', name: 'Structural Damages' },
    { key: 'OPERATIONAL_CHALLENGE', name: 'Operational Challenges' },
    { key: 'SPECIAL_NOTE', name: 'Special Notes' },
    { key: 'REMARK', name: 'Remarks' },
  ];

  // ==========================================
  // SHEETS 2-6: Technical Sections & Entry Photos
  // ==========================================
  for (const config of sectionConfigs) {
    const sheet = workbook.addWorksheet(config.name);
    sheet.columns = [
      { header: 'Vessel Name', key: 'vesselName', width: 22 },
      { header: 'IMO Number', key: 'imoNumber', width: 16 },
      { header: 'Entry Description (Text)', key: 'text', width: 45 },
      { header: 'Entry Photograph', key: 'photoCol', width: 26 },
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
        text: e.text,
        photoCol: '',
        addedBy: `${e.createdByName || 'Unknown'} (${e.createdBy || ''})`,
        date: e.createdAt ? new Date(e.createdAt).toLocaleString() : '',
      });

      row.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

      // Embed entry photograph into Excel cell
      if (e.photographs && e.photographs.length > 0) {
        const firstPhoto = e.photographs[0];
        const photoObj = await getPhotoBufferAndExt(firstPhoto.url);

        if (photoObj) {
          row.height = 75; // Expand row height for image thumbnail
          const imageId = workbook.addImage({
            base64: photoObj.buffer.toString('base64'),
            extension: photoObj.extension,
          });

          sheet.addImage(imageId, {
            tl: { col: 3.1, row: rowIndex - 1 + 0.1 },
            ext: { width: 110, height: 65 },
            editAs: 'oneCell',
          });
        }
      }
    }

    styleSheetHeader(sheet);
    sheet.getColumn('photoCol').width = 22;
    sheet.getColumn('text').width = 45;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
