package vn.nguongocso.farm.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import vn.nguongocso.farm.enums.FarmActivityType;

@Component
@RequiredArgsConstructor
public class ProductionLotImportFileParserImpl implements ProductionLotImportFileParser {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private static final Set<String> REQUIRED_HEADERS = Set.of(
            "ten_lo",
            "ma_loai_nong_san",
            "ma_vung_trong",
            "san_luong_du_kien",
            "san_luong_thuc_thu",
            "ngay_gieo_trong",
            "ngay_thu_hoach",
            "hoat_dong_canh_tac",
            "vat_tu",
            "so_luong",
            "don_vi",
            "ngay_thuc_hien",
            "ghi_chu");

    @Override
    public List<ProductionLotImportRow> parse(MultipartFile file) {
        validateFile(file);

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser parser = CSVFormat.DEFAULT
                     .builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .setTrim(true)
                     .build()
                     .parse(reader)) {

            // --- Bước 1: Chuẩn hóa header (loại bỏ BOM, trim) và tạo map từ tên chuẩn -> tên gốc ---
            Map<String, String> normalizedToRawHeader = new HashMap<>();
            for (String rawHeader : parser.getHeaderMap().keySet()) {
                String normalized = rawHeader.replace("\uFEFF", "").trim();
                normalizedToRawHeader.put(normalized, rawHeader);
            }

            // --- Bước 2: Kiểm tra header với tên đã chuẩn hóa ---
            validateHeaders(normalizedToRawHeader.keySet());

            // --- Bước 3: Đọc dữ liệu, dùng map để lấy tên cột gốc ---
            List<ProductionLotImportRow> rows = new ArrayList<>();
            int rowNumber = 2; // dòng dữ liệu đầu tiên (sau header)

            for (CSVRecord record : parser) {
                String lotName = get(record, normalizedToRawHeader.get("ten_lo"));
                String categoryId = get(record, normalizedToRawHeader.get("ma_loai_nong_san"));
                String farmAreaId = get(record, normalizedToRawHeader.get("ma_vung_trong"));
                Double expectedQuantity = parseDouble(get(record, normalizedToRawHeader.get("san_luong_du_kien")));
                Double actualQuantity = parseDouble(get(record, normalizedToRawHeader.get("san_luong_thuc_thu")));
                LocalDate plantingDate = parseDate(get(record, normalizedToRawHeader.get("ngay_gieo_trong")));
                LocalDate harvestDate = parseDate(get(record, normalizedToRawHeader.get("ngay_thu_hoach")));
                FarmActivityType activityType = parseActivityType(get(record, normalizedToRawHeader.get("hoat_dong_canh_tac")));
                String material = get(record, normalizedToRawHeader.get("vat_tu"));
                Double quantity = parseDouble(get(record, normalizedToRawHeader.get("so_luong")));
                String unit = get(record, normalizedToRawHeader.get("don_vi"));
                LocalDate executedDate = parseDate(get(record, normalizedToRawHeader.get("ngay_thuc_hien")));
                String note = get(record, normalizedToRawHeader.get("ghi_chu"));

                rows.add(ProductionLotImportRow.builder()
                        .rowNumber(rowNumber++)
                        .lotName(lotName)
                        .productCategoryId(categoryId)
                        .farmAreaId(farmAreaId)
                        .expectedQuantity(expectedQuantity)
                        .actualQuantity(actualQuantity)
                        .plantingDate(plantingDate)
                        .harvestDate(harvestDate)
                        .activityType(activityType)
                        .material(material)
                        .quantity(quantity)
                        .unit(unit)
                        .executedDate(executedDate)
                        .note(note)
                        .build());
            }

            return rows;

        } catch (IOException ex) {
            throw new ProductionLotImportException("Không thể đọc tệp CSV. Vui lòng kiểm tra lại nội dung tệp.");
        }
    }

    // ---- Các helper method được giữ nguyên, chỉ thay đổi validateHeaders ----

    private void validateHeaders(Set<String> normalizedHeaders) {
        for (String required : REQUIRED_HEADERS) {
            if (!normalizedHeaders.contains(required)) {
                throw new ProductionLotImportException(
                        "Tệp không đúng mẫu: thiếu cột bắt buộc '" + required + "'.");
            }
        }
    }

    private FarmActivityType parseActivityType(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return FarmActivityType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ProductionLotImportException("Hoạt động canh tác không hợp lệ: " + value);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ProductionLotImportException("Tệp không hợp lệ hoặc không có dữ liệu.");
        }
        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.toLowerCase().endsWith(".csv")) {
            throw new ProductionLotImportException("Chỉ hỗ trợ định dạng .csv.");
        }
    }

    private String get(CSVRecord record, String rawColumnName) {
        if (rawColumnName == null) return null;
        if (!record.isMapped(rawColumnName)) return null;
        try {
            String value = record.get(rawColumnName);
            return value == null ? null : value.trim();
        } catch (IllegalArgumentException e) {
            // Dòng thiếu cột này, bỏ qua
            return null;
        }
    }

    private Double parseDouble(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDate.parse(value, DATE_FORMAT);
        } catch (DateTimeParseException ex) {
            return null;
        }
    }
}