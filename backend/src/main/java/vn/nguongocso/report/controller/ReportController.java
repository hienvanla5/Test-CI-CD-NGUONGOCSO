package vn.nguongocso.report.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import vn.nguongocso.report.dto.response.IndustryReportResponse;
import vn.nguongocso.report.service.ReportService;

/**
 * API cung cấp báo cáo tổng hợp ngành (dạng JSON và PDF).
 */
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * Lấy báo cáo tổng hợp ngành dưới dạng JSON.
     */
    @GetMapping("/industry-summary")
    public ResponseEntity<IndustryReportResponse> getIndustrySummary(
            @RequestParam String region,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

        return ResponseEntity.ok(
                reportService.getIndustrySummary(region, fromDate, toDate));
    }

    /**
     * Xuất báo cáo tổng hợp ngành sang file PDF.
     */
    @GetMapping(
            value = "/industry-summary/export",
            produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> exportIndustrySummary(
            @RequestParam String region,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

        byte[] pdf = reportService.exportIndustrySummary(region, fromDate, toDate);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"industry-summary.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}