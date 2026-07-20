package vn.nguongocso.farm.dto.response;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO phản hồi thông tin loại cây trồng.
 * <p>
 * Được sử dụng để trả về dữ liệu loại cây trồng cho phía client.
 * </p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductCategoryResponse {
	private UUID id;
	private String name;
}