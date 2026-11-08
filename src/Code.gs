/**
 * ฟังก์ชัน doGet(e) อัปเดตใหม่: ส่งทั้งสถิติและข้อมูลเคสทั้งหมดเพื่อรองรับการกรองบนหน้าเว็บ
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Cases");
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ error: "ไม่พบแผ่นงาน Cases" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        totalCases: 0,
        completedCases: 0,
        pendingCases: 0,
        cases: []
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 1. อ่านแถวแรก (Header) เพื่อทำ Map หา Index ของแต่ละคอลัมน์อัตโนมัติ
    var headers = data[0];
    var colIndex = {};
    headers.forEach(function(headerName, index) {
      colIndex[headerName.trim()] = index;
    });
    
    var rows = data.slice(1);
    var allCases = [];
    
    // 2. แปลงข้อมูลทุกแถวให้อยู่ในรูป Object พร้อมใช้งาน
    rows.forEach(function(row) {
      var caseId       = row[colIndex["Case_ID"]] || "";
      var timestamp    = row[colIndex["Timestamp"]] || "";
      var channel      = row[colIndex["Channel"]] || "";
      var targetGroup  = row[colIndex["Target_Group"]] || "ไม่ระบุ";
      var priorityLevel= row[colIndex["Priority_Level"]] || "ปกติ (เขียว)";
      var criticalType = row[colIndex["Critical_Type"]] || "ไม่ระบุ";
      var district     = row[colIndex["District"]] || "อื่นๆ";
      
      var rawStatus    = row[colIndex["Case_Status"]];
      var status       = String(rawStatus !== undefined && rawStatus !== null ? rawStatus : "รับแจ้ง");
      
      // จัดรูปแบบวันที่ให้เป็น YYYY-MM-DD HH:mm
      var formattedDate = "";
      if (timestamp) {
        try {
          formattedDate = Utilities.formatDate(new Date(timestamp), "GMT+7", "yyyy-MM-dd HH:mm");
        } catch (err) {
          formattedDate = String(timestamp);
        }
      }

      allCases.push({
        caseId: caseId,
        date: formattedDate,
        channel: channel,
        targetGroup: targetGroup,
        priority: priorityLevel,
        criticalType: criticalType,
        district: district,
        status: status
      });
    });
    
    // เรียงจากใหม่ไปเก่า
    allCases.reverse();
    
    var result = {
      totalCases: allCases.length,
      cases: allCases // ส่งข้อมูลเคสทั้งหมดไปให้ JavaScript จัดการต่อบนหน้าเว็บ
    };
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * สร้าง Custom Menu เมื่อเปิดไฟล์ Google Sheets
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('ระบบ ศรส.')
      .addItem('บันทึกรับแจ้งเคสใหม่', 'showCaseForm')
      .addToUi();
}

/**
 * แสดง Pop-up Modal Form
 */
function showCaseForm() {
  var html = HtmlService.createHtmlOutputFromFile('Form')
      .setWidth(650)
      .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, 'บันทึกรับแจ้งเคสใหม่ - ศูนย์ ศรส. จังหวัดปราจีนบุรี');
}

/**
 * ฟังก์ชันช่วยหา Index ของคอลัมน์จากชื่อ Header ป้องกันคอลัมน์เลื่อน
 */
function getColumnIndices(sheet) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var map = {};
  headers.forEach(function(header, index) {
    map[header.trim()] = index + 1; // 1-based index สำหรับ Google Sheets
  });
  return map;
}

/**
 * ฟังก์ชันรับข้อมูลจาก HTML Form และบันทึกลงแผ่นงาน Cases และ Personal_Info พร้อมกัน
 */
function saveCaseData(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. จัดการแผ่นงาน Cases
  var casesSheet = ss.getSheetByName("Cases");
  if (!casesSheet) throw new Error("ไม่พบแผ่นงาน Cases");
  
  // สร้าง Case_ID อัตโนมัติ (รูปแบบ ESS-YYYY-XXXX)
  var year = new Date().getFullYear();
  var nextRow = casesSheet.getLastRow() + 1;
  var runningNo = ("000" + (nextRow - 1)).slice(-4);
  var caseId = "ESS-" + year + "-" + runningNo;
  var timestamp = new Date();
  var status = "รับแจ้ง";

  var casesHeaders = getColumnIndices(casesSheet);
  var casesRowData = new Array(casesSheet.getLastColumn()).fill("");

  // บันทึกข้อมูลลงตามหัวข้อคอลัมน์ในชีต Cases
  if (casesHeaders["Case_ID"]) casesRowData[casesHeaders["Case_ID"] - 1] = caseId;
  if (casesHeaders["Timestamp"]) casesRowData[casesHeaders["Timestamp"] - 1] = timestamp;
  if (casesHeaders["Channel"]) casesRowData[casesHeaders["Channel"] - 1] = data.channel;
  if (casesHeaders["Target_Group"]) casesRowData[casesHeaders["Target_Group"] - 1] = data.targetGroup;
  if (casesHeaders["Priority_Level"]) casesRowData[casesHeaders["Priority_Level"] - 1] = data.priorityLevel;
  if (casesHeaders["Critical_Type"]) casesRowData[casesHeaders["Critical_Type"] - 1] = data.criticalType;
  if (casesHeaders["Victim_Name"]) casesRowData[casesHeaders["Victim_Name"] - 1] = data.victimName;
  if (casesHeaders["ID_Card"]) casesRowData[casesHeaders["ID_Card"] - 1] = data.idCard;
  if (casesHeaders["Age"]) casesRowData[casesHeaders["Age"] - 1] = data.age;
  if (casesHeaders["Gender"]) casesRowData[casesHeaders["Gender"] - 1] = data.gender;
  if (casesHeaders["Phone"]) casesRowData[casesHeaders["Phone"] - 1] = data.phone;
  if (casesHeaders["District"]) casesRowData[casesHeaders["District"] - 1] = data.district;
  if (casesHeaders["Sub_District"]) casesRowData[casesHeaders["Sub_District"] - 1] = data.subDistrict;
  if (casesHeaders["Location_Details"]) casesRowData[casesHeaders["Location_Details"] - 1] = data.locationDetails;
  if (casesHeaders["Incident_Details"]) casesRowData[casesHeaders["Incident_Details"] - 1] = data.incidentDetails;
  if (casesHeaders["Case_Status"]) casesRowData[casesHeaders["Case_Status"] - 1] = status;
  if (casesHeaders["Responsible_Staff"]) casesRowData[casesHeaders["Responsible_Staff"] - 1] = "";

  casesSheet.appendRow(casesRowData);

  // 2. จัดการแผ่นงาน Personal_Info (ข้อมูล PDPA)
  var personalSheet = ss.getSheetByName("Personal_Info");
  if (personalSheet) {
    var personalHeaders = getColumnIndices(personalSheet);
    var personalRowData = new Array(personalSheet.getLastColumn()).fill("");

    if (personalHeaders["Case_ID"]) personalRowData[personalHeaders["Case_ID"] - 1] = caseId;
    
    var nameCol = personalHeaders["Victim_Name (ชื่อ-สกุล)"] || personalHeaders["Victim_Name"];
    if (nameCol) personalRowData[nameCol - 1] = data.victimName;

    var idCol = personalHeaders["ID_Card (เลขบัตรประชาชน)"] || personalHeaders["ID_Card"];
    if (idCol) personalRowData[idCol - 1] = data.idCard;

    var ageCol = personalHeaders["Age (อายุ)"] || personalHeaders["Age"];
    if (ageCol) personalRowData[ageCol - 1] = data.age;

    var genderCol = personalHeaders["Gender (เพศ)"] || personalHeaders["Gender"];
    if (genderCol) personalRowData[genderCol - 1] = data.gender;

    var phoneCol = personalHeaders["Phone (เบอร์ติดต่อ)"] || personalHeaders["Phone"];
    if (phoneCol) personalRowData[phoneCol - 1] = data.phone;

    var addrCol = personalHeaders["Current_Address (ที่อยู่ปัจจุบัน)"] || personalHeaders["Current_Address"];
    if (addrCol) personalRowData[addrCol - 1] = data.locationDetails;

    if (personalHeaders["PDPA_Consent"]) personalRowData[personalHeaders["PDPA_Consent"] - 1] = "Yes";

    personalSheet.appendRow(personalRowData);
  }

  return "บันทึกข้อมูลสำเร็จ! รหัสเคส: " + caseId;
}