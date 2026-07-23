package vn.nguongocso.trace.service;

import vn.nguongocso.trace.dto.request.CreateShipmentRequest;
import vn.nguongocso.trace.dto.response.ShipmentResponse;

public interface ShipmentService {

	ShipmentResponse createShipment(CreateShipmentRequest request);
	
	
}
