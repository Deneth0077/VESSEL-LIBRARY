import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { generateVesselExcelWorkbook } from '@/lib/excel/exportExcel';
import { logAudit } from '@/lib/audit/logger';

export async function GET(req: NextRequest) {
  try {
    const user = await verifySession();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const excelBuffer = await generateVesselExcelWorkbook();

    await logAudit({
      userId: user._id.toString(),
      userName: user.fullName,
      userRole: user.role,
      action: 'EXCEL_EXPORT',
      target: 'ALL_VESSELS',
    });

    const filename = `Vessel_Library_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating Excel export:', error);
    return NextResponse.json({ message: 'Failed to generate Excel export.' }, { status: 500 });
  }
}
