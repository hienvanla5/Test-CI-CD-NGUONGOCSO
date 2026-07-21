**API: Ghi nhật ký canh tác**

# 1. Thông tin chung

**Mục tiêu**

Cho phép người dùng có quyền ghi nhận một hoạt động canh tác cho một Lô sản xuất (ProductionLot).

Mỗi bản ghi nhật ký phản ánh một hoạt động như:

- Gieo trồng
- Bón phân
- Phun thuốc
- Tưới nước
- Thu hoạch
- ...

Nhật ký được lưu vào bảng farm_logs (entity FarmLog).

# 2. Endpoint

| **Thuộc tính** | **Giá trị** |
| --- | --- |
| Method | POST |
| URL | /api/v1/farm/farming-logs |
| Authentication | Bearer Token |
| Điều kiện tổ chức | Người dùng phải cùng Organization với ProductionLot |

Ghi chú: mã nguồn service hiện chỉ kiểm tra người dùng thuộc cùng Organization với ProductionLot (không có kiểm tra permission code kiểu "farming_log:create" trong lớp service). Nếu hệ thống có áp dụng permission-based access control, việc này cần được xác nhận ở tầng controller/annotation (@PreAuthorize) — chưa thấy trong đoạn mã được cung cấp.

# 3. Request Body

DTO: CreateFarmLogRequest

| **Field** | **Type** | **Required** | **Validation / Description** |
| --- | --- | --- | --- |
| productionLotId | UUID | ✓ | @NotNull – "Vui lòng chọn lô sản xuất" |
| activityType | Enum (FarmActivityType) | ✓ | @NotNull – "Vui lòng chọn loại hoạt động" |
| material | String |  | @Size(max=255) – "Tên vật tư không được vượt quá 255 ký tự" |
| quantity | Double |  | @Positive – "Số lượng phải lớn hơn 0" |
| unit | String |  | @Size(max=50) – "Đơn vị không được vượt quá 50 ký tự" |
| executedDate | Date (LocalDate) | ✓ | @NotNull – "Vui lòng chọn ngày thực hiện" |
| notes | String |  | @Size(max=1000) – "Ghi chú không được vượt quá 1000 ký tự" |

## Ví dụ Request

```json
{
    "productionLotId": "f034eb60-3895-4479-bb23-976008cfc7be",
    "activityType": "FERTILIZING",
    "material": "NPK 16-16-8",
    "quantity": 25.0,
    "unit": "kg",
    "executedDate": "2026-07-21",
    "notes": "Bón phân lần 1 cho lô sản xuất"
}
```

# 4. Enum FarmActivityType

Lưu ý: đoạn mã cung cấp chỉ xác nhận giá trị FERTILIZING qua ví dụ thực tế; các giá trị còn lại giữ theo tài liệu trước đó, cần đối chiếu lại với định nghĩa enum FarmActivityType trong mã nguồn.

| **Value** | **Hiển thị** |
| --- | --- |
| PLANTING | Gieo trồng |
| WATERING | Tưới nước |
| FERTILIZING | Bón phân |
| PESTICIDE | Phun thuốc |
| WEEDING | Làm cỏ |
| HARVESTING | Thu hoạch |
| OTHER | Khác |

# 5. Business Rules

## 5.1 Kiểm tra dữ liệu (Bean Validation)

| **Điều kiện** | **Kết quả** | **Message** |
| --- | --- | --- |
| productionLotId để trống | 400 Bad Request | Vui lòng chọn lô sản xuất |
| activityType để trống | 400 Bad Request | Vui lòng chọn loại hoạt động |
| executedDate để trống | 400 Bad Request | Vui lòng chọn ngày thực hiện |
| quantity ≤ 0 | 400 Bad Request | Số lượng phải lớn hơn 0 |
| material > 255 ký tự | 400 Bad Request | Tên vật tư không được vượt quá 255 ký tự |
| unit > 50 ký tự | 400 Bad Request | Đơn vị không được vượt quá 50 ký tự |
| notes > 1000 ký tự | 400 Bad Request | Ghi chú không được vượt quá 1000 ký tự |

## 5.2 Kiểm tra tồn tại của ProductionLot

Nếu productionLotId không tồn tại, hệ thống ném BusinessException:

"Không tìm thấy lô sản xuất"

## 5.3 Kiểm tra trạng thái lô

Chỉ cho phép ghi nhật ký khi ProductionLot đang ở trạng thái APPROVED (đã duyệt). Đây là bước kiểm tra được thực hiện trước bước kiểm tra Organization.

**Nếu trạng thái khác APPROVED**

"Lô sản xuất chưa được duyệt."

## 5.4 Kiểm tra quyền theo Organization

Hệ thống so sánh Organization của người dùng đang đăng nhập với Organization sở hữu ProductionLot (thông qua ProductionLot → FarmArea → Organization).

**Nếu không cùng Organization**

"Bạn không có quyền ghi nhật ký cho lô sản xuất này"

## 5.5 Dữ liệu hệ thống tự sinh

Backend tự gán khi lưu (FarmLog entity, @PrePersist):

| **Field** | **Giá trị** |
| --- | --- |
| id | UUID tự sinh nếu chưa có (random UUID) |
| createdBy | User đang đăng nhập (lấy từ SecurityContext) |
| createdAt | Thời gian hệ thống (LocalDateTime.now()) |

Frontend không gửi các trường này.

Riêng productionLotName và createdByName không phải cột lưu trữ — đây là dữ liệu được suy ra (join) từ ProductionLot và User khi build response trả về, không lưu trong bảng farm_logs.

# 6. Response

**HTTP 200 OK**

```json
{
    "success": true,
    "status": 200,
    "data": {
        "id": "a9fcbbac-fe01-4ecf-a97e-2d2c7b4ba5f1",
        "productionLotId": "f034eb60-3895-4479-bb23-976008cfc7be",
        "productionLotName": "Lô chè xuân 2026",
        "activityType": "FERTILIZING",
        "material": "NPK 16-16-8",
        "quantity": 25.0,
        "unit": "kg",
        "executedDate": "2026-07-21",
        "notes": "Bón phân lần 1 cho lô sản xuất",
        "createdByName": "System Administrator",
        "createdAt": "2026-07-21T14:27:34.9674332"
    },
    "timestamp": "2026-07-21T07:27:34.985773800Z"
}
```

Thay đổi so với bản trước: mã trạng thái thành công thực tế là 200 OK (không phải 201 Created); response không có field "message", thay vào đó dùng "status" và "timestamp" ở cấp ngoài, đồng nhất với format của API khai báo vùng trồng. Trường createdBy (UUID) được thay bằng createdByName; đồng thời có thêm productionLotName.

# 7. Error Response

Lưu ý: đoạn mã cung cấp dùng chung một loại BusinessException cho các trường hợp không tìm thấy lô, sai trạng thái và sai quyền tổ chức. Mã HTTP cụ thể cho từng trường hợp (404 / 409 / 403) phụ thuộc vào cấu hình global exception handler — chưa có trong mã nguồn được cung cấp, nên các mã dưới đây giữ theo thiết kế ban đầu và cần được xác nhận lại với global exception handler thực tế.

## 400 Bad Request

```json
{
    "success": false,
    "status": 400,
    "message": "Vui lòng chọn ngày thực hiện"
}
```

## 403 Forbidden

```json
{
    "success": false,
    "status": 403,
    "message": "Bạn không có quyền ghi nhật ký cho lô sản xuất này"
}
```

## 404 Not Found

```json
{
    "success": false,
    "status": 404,
    "message": "Không tìm thấy lô sản xuất"
}
```

## 409 Conflict

```json
{
    "success": false,
    "status": 409,
    "message": "Lô sản xuất chưa được duyệt."
}
```

# 8. Backend xử lý

```
Client
    │
    ▼
POST /farming-logs
    │
    ▼
Validate Request (Bean Validation)
    │
    ▼
Tìm ProductionLot (404 nếu không có)
    │
    ▼
Kiểm tra trạng thái ProductionLot (chỉ APPROVED)
    │
    ▼
Kiểm tra Organization của người dùng
    │
    ▼
Build & Lưu FarmLog
    │
    ▼
Map sang FarmLogResponse & Trả Response
```

Thay đổi so với bản trước: thứ tự thực tế trong FarmLogServiceImpl là kiểm tra trạng thái ProductionLot TRƯỚC, sau đó mới kiểm tra Organization (ngược lại với thứ tự đã mô tả ở bản tài liệu trước).

# 9. Phạm vi của Story

**Bao gồm**

- Thiết kế DTO Request/Response (CreateFarmLogRequest / FarmLogResponse).
- Tạo API ghi nhật ký.
- Validate dữ liệu đầu vào (Bean Validation).
- Kiểm tra trạng thái ProductionLot (chỉ cho phép khi APPROVED).
- Kiểm tra quyền theo Organization.
- Lưu bản ghi FarmLog.

**Không bao gồm**

- Đính kèm ảnh/chứng từ (FarmingLogAttachment) – thuộc NCL-03-CN-002.
- Hiển thị danh sách lịch sử nhật ký – thuộc NCL-03-CN-003.
- Chỉnh sửa hoặc xóa nhật ký.
- Quản lý ProductionLot.
