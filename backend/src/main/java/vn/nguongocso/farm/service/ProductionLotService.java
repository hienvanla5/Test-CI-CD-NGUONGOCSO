package vn.nguongocso.farm.service;

import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.farm.dto.request.CreateProductionLotRequest;
import vn.nguongocso.farm.dto.response.CreateProductionLotResponse;

import java.util.List;

public interface ProductionLotService {
    CreateProductionLotResponse createProductionLot(CreateProductionLotRequest request, CustomUserDetails userDetails);

    List<CreateProductionLotResponse> getAllProductionLots(CustomUserDetails userDetails);
}