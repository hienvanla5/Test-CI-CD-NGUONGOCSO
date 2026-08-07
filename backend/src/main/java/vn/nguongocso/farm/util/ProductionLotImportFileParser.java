package vn.nguongocso.farm.util;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

/**
 * Đọc và phân tích dữ liệu từ tệp nhập lô sản xuất.
 */
public interface ProductionLotImportFileParser {
    /**
     * Đọc dữ liệu từ tệp và chuyển thành danh sách dòng dữ liệu.
     *
     * @param file tệp Excel hoặc CSV
     * @return danh sách dòng dữ liệu
     */
    List<ProductionLotImportRow> parse(MultipartFile file);
}