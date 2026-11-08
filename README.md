# Pri Husec Dashboard

A lightweight Google Apps Script project for managing and tracking case reports for the `ศรส.` (social welfare and protection support) workflow in Prachinburi province.

This repository contains:
- `Code.gs` — Apps Script backend logic for reading and saving case data
- `Form.html` — user-facing form for submitting new incident reports
- Google Sheets integration for storing case records and personal information

## Overview

The system is designed to help staff quickly record incoming cases from multiple channels such as hotline, community outreach, and local reporting centers. It captures victim and incident details, assigns a case ID, and stores the data in a Google Sheet for follow-up and reporting.

## Features

- Case intake form with required fields
- Priority and critical-type categorization
- Automatic case ID generation
- Support for storing case data in a `Cases` sheet
- Optional personal information storage in a `Personal_Info` sheet
- Dashboard-style JSON endpoint for listing all cases
- Google Sheets custom menu for opening the intake form

## Project Structure

```text
.
├── Code.gs
├── Form.html
└── README.md
```

## Prerequisites

- A Google account
- A Google Spreadsheet where case data will be stored
- Access to Google Apps Script

## Setup Instructions

1. Open Google Sheets and create a new spreadsheet.
2. In the spreadsheet, create the following sheets:
   - `Cases`
   - `Personal_Info`
3. Add the relevant column headers to the `Cases` sheet. Example:

```text
Case_ID
Timestamp
Channel
Target_Group
Priority_Level
Critical_Type
Victim_Name
ID_Card
Age
Gender
Phone
District
Sub_District
Location_Details
Incident_Details
Case_Status
Responsible_Staff
```

4. In `Personal_Info`, add headers that match the personal data fields you want to collect, such as:

```text
Case_ID
Victim_Name
ID_Card
Age
Gender
Phone
Current_Address
PDPA_Consent
```

5. Open Google Apps Script from the spreadsheet.
6. Create a project and paste the contents of `Code.gs` into the script editor.
7. Create an HTML file named `Form` and paste the contents of `Form.html` into it.
8. Save the project and reload the spreadsheet.
9. You should see a custom menu named `ระบบ ศรส.` with an option to open the case form.

## How It Works

- The form collects incident information from the public or staff interface.
- `saveCaseData(data)` writes the data to the `Cases` sheet and, when available, to `Personal_Info`.
- `doGet(e)` reads the `Cases` sheet and returns JSON containing the list of cases and summary data.
- `onOpen()` adds a menu item for opening the intake form inside the spreadsheet.

## Usage

1. Open the spreadsheet.
2. Click the custom menu item `บันทึกรับแจ้งเคสใหม่`.
3. Fill in the incident form.
4. Submit the case.
5. The system stores the information in the spreadsheet automatically.

## Notes

- This project is built for internal workflow support and is designed around a specific case-reporting process.
- The script uses Google Sheets as the database and form backend.
- The data model can be expanded or adjusted depending on your operational needs.

## License

This project does not currently include a license file. If you want, you can add an open-source license such as MIT or Apache 2.0.

## Example Use Case

This dashboard can be used by social welfare or protection teams to record and follow up on vulnerable-person cases, including incidents involving abuse, violence, neglect, or urgent risk situations.

## Future Improvements

- Add dashboard summaries and charts
- Add filtering and search by date or district
- Add case status update workflow
- Add export to PDF or CSV
- Add authentication and restricted access controls

If you want, I can also add a more polished project logo section, badges, screenshots, or a Thai-language version of this README.
