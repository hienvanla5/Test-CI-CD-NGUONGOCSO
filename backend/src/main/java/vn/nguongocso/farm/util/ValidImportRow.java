package vn.nguongocso.farm.util;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import vn.nguongocso.farm.entity.ProductionLot;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ValidImportRow {

    private ProductionLot productionLot;

    private ProductionLotImportRow row;
}