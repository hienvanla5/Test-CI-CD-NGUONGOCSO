package vn.nguongocso.farm.mapper;


import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Component;

import vn.nguongocso.farm.dto.response.FarmAreaResponse;
import vn.nguongocso.farm.entity.FarmArea;

/**
 * Mapper chuyển đổi giữa Entity và DTO của vùng trồng.
 */
@Component
public class FarmAreaMapper {

    /**
     * Chuyển đổi {@link FarmArea} sang {@link FarmAreaResponse}.
     *
     * @param farmArea entity vùng trồng
     * @return DTO phản hồi vùng trồng
     */
    public FarmAreaResponse toResponse(FarmArea farmArea) {

        Point point = farmArea.getLocation();

        return new FarmAreaResponse(
                farmArea.getId(),
                farmArea.getName(),

                farmArea.getOrganization().getOrganizationId(),
                farmArea.getOrganization().getName(),

                farmArea.getCropType().getId(),
                farmArea.getCropType().getName(),

                point.getY(),
                point.getX(),

                farmArea.getArea(),

                farmArea.getCreatedAt(),
                farmArea.getUpdatedAt()
        );
    }

}
