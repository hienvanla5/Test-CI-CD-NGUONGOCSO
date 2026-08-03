package vn.nguongocso.farm.util;

/**
 * Exception xảy ra trong quá trình đọc tệp nhập.
 */
public class ProductionLotImportException extends RuntimeException {

    public ProductionLotImportException(String message) {
        super(message);
    }

}