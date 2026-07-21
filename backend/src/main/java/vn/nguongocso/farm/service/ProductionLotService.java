package vn.nguongocso.farm.service;

import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.farm.dto.request.CreateProductionLotRequest;
import vn.nguongocso.farm.dto.request.UpdateProductionLotRequest;
import vn.nguongocso.farm.dto.response.CreateProductionLotResponse;
import vn.nguongocso.farm.dto.response.UpdateProductionLotResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ProductionLotService {
    CreateProductionLotResponse createProductionLot(CreateProductionLotRequest request, CustomUserDetails userDetails);

    List<CreateProductionLotResponse> getAllProductionLots(CustomUserDetails userDetails);

    UpdateProductionLotResponse updateProductionLot(UUID id, UpdateProductionLotRequest request, CustomUserDetails userDetails);
}