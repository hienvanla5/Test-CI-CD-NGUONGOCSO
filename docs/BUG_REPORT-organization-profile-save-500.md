# BÁO LỖI — Không thể lưu chỉnh sửa Hồ sơ tổ chức (HTTP 500 "Đã xảy ra lỗi hệ thống")

## 1. Lí do cần sửa (tác động nghiệp vụ)

- Chức năng **"Chỉnh sửa hồ sơ tổ chức"** (trang `organizations/profile`) là tính năng cốt lõi cho vai trò Quản lý hợp tác xã (VT-02) và Quản trị viên (VT-01).
- Hiện tại mọi lần bấm **Lưu** đều thất bại với HTTP 500, thông báo chung chung `"Đã xảy ra lỗi hệ thống"` — người dùng không thể cập nhật tên, địa chỉ, số điện thoại, email của tổ chức.
- Lỗi xảy ra **100%** cho tổ chức COCC (code = ABC) — tổ chức đang vận hành với 3 thành viên, nên đây là lỗi chặn (blocker).

## 2. Lỗi hiện có (nguyên nhân gốc)

### Triệu chứng

- Màn hình: tải dữ liệu hồ sơ OK (GET thành công), bấm **Chỉnh sửa** OK, bấm **Lưu** → HTTP 500, message: `Đã xảy ra lỗi hệ thống`.
- Endpoint lỗi: `PUT /api/v1/organizations/profile`
- Tài khoản tái hiện: `jkljkl` (VT-02), thuộc tổ chức COCC (code = `ABC`).

### Vị trí mã nguồn

- `backend/.../organization/service/impl/OrganizationServiceImpl.java` — phương thức `validateUniqueFieldsForUpdate(...)` (~dòng 453–468), được gọi từ `updateCurrentOrganization(...)` (~dòng 490) trước khi `save`.
- `backend/.../organization/repository/OrganizationRepository.java` (dòng 28–29):
  ```java
  Optional<Organization> findByEmail(String email);
  Optional<Organization> findByPhone(String phone);
  ```

### Diễn giải lỗi

1. `validateUniqueFieldsForUpdate` gọi `findByEmail(email)` / `findByPhone(phone)` với kiểu trả về `Optional`.
2. Trong cơ sở dữ liệu, **2 tổ chức trùng** `email = jkljkl@gmail.com` và `phone = 0123456789`:
   - COCC (code = `ABC`, id = `e787d629-a228-4232-8aa7-a03150ca26dc`)
   - COCC (code = `LLL`, id = `1e9cab0a-90da-44d2-aff3-f8101d5dadb9`)
3. Câu query trả về **2 dòng** trong khi repo mong đợi duy nhất 1 dòng (Optional) → Spring Data ném `IncorrectResultSizeDataAccessException` ("query did not return a unique result: 2").
4. `IncorrectResultSizeDataAccessException` **không** phải `BusinessException` cũng **không** phải `DataIntegrityViolationException` nên không khớp handler cụ thể nào trong `GlobalExceptionHandler` → rơi vào `@ExceptionHandler(Exception.class)` (dòng 250) → HTTP 500 `"Đã xảy ra lỗi hệ thống"`.

### Bằng chứng (SQL đã chạy trước khi dọn)

```sql
SELECT email, phone, COUNT(*) AS cnt
FROM organizations
GROUP BY email, phone
HAVING COUNT(*) > 1;
-- Kết quả cũ: jkljkl@gmail.com / 0123456789 / cnt = 2
```

## 3. Phương án sửa chữa

### Phương án A — Dọn dữ liệu trùng (xử lý ngay, đã thực hiện)

> ⚠️ **Trạng thái: ĐÃ THỰC HIỆN** — chỉ sửa dữ liệu runtime (ngoài mã nguồn), không đụng tới code.

- Xác định bản ghi giữ lại: tổ chức **COCC (code = `ABC`)** — tổ chức của tài khoản `jkljkl` (VT-02) đang gặp lỗi, có 3 thành viên hoạt động.
- Bản ghi thừa: tổ chức **COCC (code = `LLL`)** (loại GOVERNMENT, 1 thành viên `jkljkl1`) — email/phone trùng với ABC.

```sql
-- Trước khi dọn (lưu lại để đối chiếu):
SELECT organization_id, name, code, phone, email
FROM organizations WHERE code IN ('ABC','LLL');

-- Đã chạy:
UPDATE organizations
SET email = NULL, phone = NULL
WHERE organization_id = '1e9cab0a-90da-44d2-aff3-f8101d5dadb9';  -- code = 'LLL'

-- Kiểm chứng sau khi dọn (đã chạy, không còn trùng):
SELECT email, phone, COUNT(*) AS cnt
FROM organizations
GROUP BY email, phone
HAVING COUNT(*) > 1;
```

**Kết quả kiểm chứng sau khi dọn:** không còn cặp email/phone trùng; org ABC giữ nguyên `jkljkl@gmail.com` / `0123456789`; org LLL đặt email/phone = NULL (2 cột này nullable, không ảnh hưởng bản ghi khác). Lỗi 500 sẽ không còn tái diễn khi lưu hồ sơ org ABC.

> Lưu ý: nếu tổ chức LLL vẫn cần thông tin liên hệ, bên vận hành cần cấp email/phone **khác biệt** (phone 10–11 chữ số theo ràng buộc hiện tại).

### Phương án B — Sửa code backend (đề xuất, chờ xử lý)

- `OrganizationRepository`: bổ sung phương thức trả `List`:
  ```java
  List<Organization> findAllByEmail(String email);
  List<Organization> findAllByPhone(String phone);
  ```
- `OrganizationServiceImpl.validateUniqueFieldsForUpdate`: đổi sang `findAllByEmail`/`findAllByPhone` và kiểm tra `anyMatch`:
  ```java
  boolean dupEmail = organizationRepository.findAllByEmail(email)
      .stream().anyMatch(o -> !o.getOrganizationId().equals(orgId));
  if (dupEmail) throw new BusinessException("Email đã được sử dụng bởi tổ chức khác");
  ```
  → Nếu vẫn tồn tại dữ liệu trùng, người dùng nhận thông báo rõ ràng (HTTP 400) thay vì 500.

## 4. Gợi ý (hardening phòng tái diễn)

1. **Thêm ràng buộc dữ liệu:** `UNIQUE INDEX` cho `email` và `phone` trên bảng `organizations` (sau khi đã dọn trùng). MySQL cho phép nhiều giá trị NULL trong unique index nên không ảnh hưởng tổ chức chưa khai báo liên hệ.
2. **Rà soát pattern tương tự** có cùng rủi ro `Optional` khi dữ liệu có thể trùng:
   - `organization/service/impl/InvitationServiceImpl.java` (dòng ~83, ~193) dùng `userRepository.findByEmail(...)` trả `Optional`.
   - `auth/repository/UserRepository.java` (`findByEmail`, `existsByEmail`, `existsByPhone`) — kiểm tra thêm dữ liệu `users` có trùng không.
3. **Bổ sung test** cho `validateUniqueFieldsForUpdate` với case: (a) email/phone thuộc tổ chức khác → báo lỗi; (b) dữ liệu trùng tồn tại sẵn → không ném 500; (c) email/phone trống/NULL → bỏ qua.
4. **Thống nhất message:** cân nhắc bắt `DataRetrievalFailureException`/`IncorrectResultSizeDataAccessException` trong `GlobalExceptionHandler` để tránh lộ lỗi 500 mù mờ ở các chỗ khác.

## 5. Thông tin tài khoản được giữ lại (đã xác nhận)

| Trường | Giá trị |
|---|---|
| organization_id | `e787d629-a228-4232-8aa7-a03150ca26dc` |
| Tên / Mã | COCC / `ABC` |
| Loại / Trạng thái | COOPERATIVE / ACTIVE |
| Địa chỉ | Hà Nội |
| Email (giữ nguyên) | `jkljkl@gmail.com` |
| Phone (giữ nguyên) | `0123456789` |
| Thành viên | `jkljkl` (VT-02), `asdasd` (VT-04), `matday` (VT-03) |

Bản ghi đã dọn: COCC / `LLL` (id `1e9cab0a-90da-44d2-aff3-f8101d5dadb9`) — email/phone → `NULL`.
