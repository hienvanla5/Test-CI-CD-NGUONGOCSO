package vn.nguongocso.farm.service;

import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.farm.dto.request.ApproveProductionLotRequest;
import vn.nguongocso.farm.dto.request.CreateProductionLotRequest;
import vn.nguongocso.farm.dto.response.CreateProductionLotResponse;

import java.util.List;
import java.util.UUID;

public interface ProductionLotService {
    CreateProductionLotResponse createProductionLot(CreateProductionLotRequest request, CustomUserDetails userDetails);

    List<CreateProductionLotResponse> getAllProductionLots(CustomUserDetails userDetails);

    CreateProductionLotResponse approveProductionLot(UUID lotId, ApproveProductionLotRequest request, CustomUserDetails userDetails);

    CreateProductionLotResponse submitForApproval(UUID lotId, CustomUserDetails userDetails);
}