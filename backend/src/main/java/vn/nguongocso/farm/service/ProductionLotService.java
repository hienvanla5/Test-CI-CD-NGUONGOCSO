package vn.nguongocso.farm.service;

import java.util.List;
import java.util.UUID;

import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.farm.dto.request.ApproveProductionLotRequest;
import vn.nguongocso.farm.dto.request.CreateProductionLotRequest;
import vn.nguongocso.farm.dto.request.UpdateProductionLotRequest;
import vn.nguongocso.farm.dto.response.CreateProductionLotResponse;
import vn.nguongocso.farm.dto.response.UpdateProductionLotResponse;

public interface ProductionLotService {
    CreateProductionLotResponse packageProductionLot(UUID id, CustomUserDetails userDetails);
    CreateProductionLotResponse createProductionLot(
            CreateProductionLotRequest request,
            CustomUserDetails userDetails);
    List<CreateProductionLotResponse> getAllProductionLots(
            CustomUserDetails userDetails);

    UpdateProductionLotResponse updateProductionLot(UUID id, UpdateProductionLotRequest request, CustomUserDetails userDetails);

    CreateProductionLotResponse approveProductionLot(UUID lotId, ApproveProductionLotRequest request, CustomUserDetails userDetails);

    CreateProductionLotResponse submitForApproval(UUID lotId, CustomUserDetails userDetails);
    CreateProductionLotResponse submitProductionLot(
            UUID id,
            CustomUserDetails userDetails);
}