function doPost(e) {
  // 1. Mở Sheet đang active và lấy URL để nhúng vào email
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getActiveSheet();
  var sheetUrl = spreadsheet.getUrl();
  
  // 2. Lấy tham số gửi từ Form
  var fullName = e.parameter.fullName || "";
  var email    = e.parameter.email || "";
  var phone    = e.parameter.phone || "";
  var demand   = e.parameter.demand || "";
  var note     = e.parameter.note || "";
  
  // Thêm dấu nháy đơn vào trước số điện thoại để giữ số 0 ở đầu (cho cả Sheet và Email)
  if (phone !== "") {
    phone = "'" + phone;
  }
  
  // 3. Lấy thời gian hiện tại theo múi giờ Việt Nam (GMT+7) và định dạng Giờ trước Ngày sau
  var date = new Date();
  // "HH:mm dd/MM/yyyy" => Ví dụ: 14:30 10/06/2026
  var timeStr = Utilities.formatDate(date, "GMT+7", "HH:mm dd/MM/yyyy");

  // 4. Tính toán cột STT (Số Thứ Tự)
  var lastRow = sheet.getLastRow();
  var stt = (lastRow === 0) ? 1 : lastRow; 

  if (lastRow === 0) {
    sheet.appendRow(["STT", "Họ tên", "Gmail", "Số điện thoại", "Nhu cầu", "Ghi chú", "Thời gian đăng ký"]);
    stt = 1; 
  }
  
  // 5. Tạo mảng dữ liệu
  var rowData = [
    stt,
    fullName,
    email,
    phone,
    demand,
    note,
    timeStr
  ];
  
  // 6. Thêm dữ liệu vào Sheet
  sheet.appendRow(rowData);

  // 7. Gửi email thông báo (HTML Template đẹp mắt)
  try {
    var emailAddress = "thedoants@gmail.com";
    var subject = "Đăng ký mới: " + fullName + " - Dự án la Perle Héritage";
    
    // Thiết kế mã HTML cho Email
    var htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <div style="background-color: #0b1f3a; color: #ffffff; padding: 25px 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 1px;">Khách Hàng Mới Đăng Ký</h2>
          <p style="margin: 8px 0 0; font-size: 15px; color: #d4af37;">Dự án la Perle Héritage</p>
        </div>
        
        <div style="padding: 30px 25px;">
          <p style="font-size: 16px; line-height: 1.5;">Chào anh/chị,</p>
          <p style="font-size: 16px; line-height: 1.5; color: #555;">Hệ thống vừa ghi nhận một lượt đăng ký nhận thông tin thành công từ website. Dưới đây là chi tiết khách hàng:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 25px; margin-bottom: 30px; font-size: 15px;">
            <tr>
              <th style="text-align: left; padding: 14px; border-bottom: 1px solid #eee; color: #666; background-color: #fafafa;">Họ và tên:</th>
              <td style="padding: 14px; border-bottom: 1px solid #eee; font-weight: bold; color: #0b1f3a;">${fullName}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 14px; border-bottom: 1px solid #eee; color: #666; background-color: #fafafa;">Số điện thoại:</th>
              <td style="padding: 14px; border-bottom: 1px solid #eee; font-weight: bold; color: #d4af37; font-size: 16px;">${phone}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 14px; border-bottom: 1px solid #eee; color: #666; background-color: #fafafa;">Email:</th>
              <td style="padding: 14px; border-bottom: 1px solid #eee;">${email || '<span style="color: #aaa; font-style: italic;">Không cung cấp</span>'}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 14px; border-bottom: 1px solid #eee; color: #666; background-color: #fafafa;">Loại căn hộ:</th>
              <td style="padding: 14px; border-bottom: 1px solid #eee;">${demand}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 14px; border-bottom: 1px solid #eee; color: #666; background-color: #fafafa;">Ghi chú:</th>
              <td style="padding: 14px; border-bottom: 1px solid #eee;">${note || '<span style="color: #aaa; font-style: italic;">Không có</span>'}</td>
            </tr>
            <tr>
              <th style="text-align: left; padding: 14px; border-bottom: 1px solid #eee; width: 35%; color: #666; background-color: #fafafa;">Thời gian đăng ký:</th>
              <td style="padding: 14px; border-bottom: 1px solid #eee; color: #0b1f3a; font-style: italic;">${timeStr}</td>
            </tr>
          </table>
          
          <div style="text-align: center; margin: 35px 0 10px;">
            <a href="${sheetUrl}" style="background-color: #d4af37; color: #0b1f3a; padding: 14px 32px; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 5px; display: inline-block; text-transform: uppercase;">Mở Danh Sách Google Sheet</a>
          </div>
        </div>
        
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 13px; color: #888; border-top: 1px solid #e5e5e5;">
          Email này được gửi tự động từ hệ thống website. Vui lòng không trả lời.
        </div>
      </div>
    `;

    MailApp.sendEmail({
      to: emailAddress,
      subject: subject,
      htmlBody: htmlBody
    });
  } catch (error) {
    // Bỏ qua lỗi email nếu có để form trên web vẫn hoạt động trơn tru
  }
  
  // 8. Trả về kết quả
  return ContentService.createTextOutput(JSON.stringify({ "result": "success", "row": sheet.getLastRow() }))
    .setMimeType(ContentService.MimeType.JSON);
}
