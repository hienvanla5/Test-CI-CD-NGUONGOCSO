package vn.nguongocso.report.pdf;

import vn.nguongocso.report.dto.response.IndustryReportResponse;

public interface IndustryReportPdfGenerator {
    byte[] generate(IndustryReportResponse report);
}
