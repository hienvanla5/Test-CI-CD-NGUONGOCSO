package vn.nguongocso.farm.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.nguongocso.auth.entity.User;
import vn.nguongocso.auth.repository.UserRepository;
import vn.nguongocso.auth.service.CustomUserDetails;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.farm.dto.response.AttachmentResponse;
import vn.nguongocso.farm.entity.FarmLog;
import vn.nguongocso.farm.entity.FarmLogAttachment;
import vn.nguongocso.farm.repository.FarmLogAttachmentRepository;
import vn.nguongocso.farm.repository.FarmLogRepository;
import vn.nguongocso.farm.repository.ProductionLotRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final FarmLogRepository farmLogRepository;
    private final FarmLogAttachmentRepository attachmentRepository;
    private final UserRepository userRepository;

    @Value("${app.upload.base-dir}")
    private String baseDir;

    @Value("${app.upload.farm-log.relative-path:farm-logs}")
    private String farmLogRelativePath;

    @Value("${app.upload.farm-log.max-size:5242880}")
    private long maxFileSize;

    private String getUploadDir(UUID logId) {
        return Paths.get(baseDir, farmLogRelativePath, logId.toString()).toString();
    }

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "application/pdf"
    );

    @Transactional
    public AttachmentResponse uploadAttachment(UUID logId, MultipartFile file, String description, CustomUserDetails userDetails) {

        // 1. Kiểm tra log tồn tại và quyền sở hữu
        FarmLog farmLog = farmLogRepository.findById(logId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy nhật ký canh tác"));

        // 2. Kiểm tra quyền: user phải thuộc tổ chức sở hữu lô sản xuất
        UUID orgId = userDetails.getOrganizationId();
        UUID lotOrgId = farmLog.getProductionLotId().getOrganization().getOrganizationId();
        if (!lotOrgId.equals(orgId)) {
            throw new BusinessException("Nhật ký không thuộc tổ chức của bạn");
        }

        // 3. Kiểm tra file
        if (file.isEmpty()) throw new BusinessException("File không được để trống");
        if (file.getSize() > maxFileSize) {
            throw new BusinessException("File vượt quá dung lượng cho phép (" + maxFileSize/1024/1024 + "MB)");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BusinessException("Loại file không hỗ trợ. Chỉ chấp nhận JPG, PNG, PDF");
        }

        // 4. Lưu file vật lý
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String newFileName = System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
        String uploadDir = getUploadDir(logId);
        String filePath = uploadDir + newFileName;

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Files.copy(file.getInputStream(), Paths.get(filePath), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Lỗi khi lưu file: {}", e.getMessage());
            throw new BusinessException("Lỗi hệ thống khi lưu file");
        }

        // 5. Lưu vào DB
        User user = userRepository.findById(userDetails.getUserId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy người dùng"));

        FarmLogAttachment attachment = FarmLogAttachment.builder()
                .farmLog(farmLog)
                .fileName(originalFilename != null ? originalFilename : "unknown")
                .fileSize(file.getSize())
                .fileType(contentType)
                .filePath(filePath)
                .description(description)
                .uploadedBy(user)
                .build();
        attachmentRepository.save(attachment);

        log.info("Upload attachment thành công: id={}, logId={}", attachment.getId(), logId);

        return toResponse(attachment);
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachments(UUID logId, CustomUserDetails userDetails) {

        // Kiểm tra quyền: chỉ trả về nếu log thuộc tổ chức user
        FarmLog farmLog = farmLogRepository.findById(logId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy nhật ký canh tác"));

        UUID orgId = userDetails.getOrganizationId();
        UUID lotOrgId = farmLog.getProductionLotId().getOrganization().getOrganizationId();
        if (!lotOrgId.equals(orgId)) {
            throw new BusinessException("Nhật ký không thuộc tổ chức của bạn");
        }

        return attachmentRepository.findByFarmLogId(logId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteAttachment(UUID attachmentId, CustomUserDetails userDetails) {
        FarmLogAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy file đính kèm"));

        // Kiểm tra quyền: chỉ người upload

        boolean isUploader = attachment.getUploadedBy().getUserId().equals(userDetails.getUserId());

        if (!isUploader) {
            throw new BusinessException("Bạn không có quyền xóa file này");
        }

        // Xóa file vật lý
        try {
            Path filePath = Paths.get(attachment.getFilePath());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            } else {
                log.warn("File không tồn tại: {}", attachment.getFilePath());
            }
        } catch (IOException e) {
            log.error("Không thể xóa file: {}, lỗi: {}", attachment.getFilePath(), e.getMessage());
            throw new BusinessException("Không thể xóa file, vui lòng thử lại");
        }

        attachmentRepository.delete(attachment);
        log.info("Xóa attachment thành công: id={}", attachmentId);
    }

    private AttachmentResponse toResponse(FarmLogAttachment attachment) {
        return AttachmentResponse.builder()
                .id(attachment.getId())
                .farmLogId(attachment.getFarmLog().getId())
                .fileName(attachment.getFileName())
                .fileSize(attachment.getFileSize())
                .fileType(attachment.getFileType())
                .fileUrl("/" + attachment.getFilePath())
                .description(attachment.getDescription())
                .uploadedBy(attachment.getUploadedBy().getFullName())
                .uploadedAt(attachment.getUploadedAt())
                .build();
    }
}