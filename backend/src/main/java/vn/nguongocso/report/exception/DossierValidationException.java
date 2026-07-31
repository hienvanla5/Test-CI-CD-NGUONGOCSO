package vn.nguongocso.report.exception;

import lombok.Getter;
import java.util.List;

@Getter
public class DossierValidationException extends RuntimeException {
    private final List<String> errors;

    public DossierValidationException(String message, List<String> errors) {
        super(message);
        this.errors = errors;
    }
}
