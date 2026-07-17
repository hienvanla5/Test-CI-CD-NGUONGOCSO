package vn.nguongocso.auth.service;

import vn.nguongocso.auth.dto.request.CreateProductionLotRequest;
import vn.nguongocso.auth.dto.response.CreateProductionLotResponse;
import vn.nguongocso.auth.service.CustomUserDetails;

public interface ProductionLotService {
    CreateProductionLotResponse createProductionLot(CreateProductionLotRequest request, CustomUserDetails userDetails);
}
